"""DashScope Qwen-Audio TTS through the SDK WebSocket transport only."""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    RetryPolicy,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolStatus,
    ToolTier,
)


class DashscopeTTS(BaseTool):
    name = "dashscope_tts"
    version = "0.2.0"
    tier = ToolTier.VOICE
    capability = "tts"
    provider = "dashscope"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies = ["dashscope"]
    install_instructions = "Set DASHSCOPE_API_KEY to the configured DashScope key."
    fallback = "piper_tts"
    fallback_tools = ["doubao_tts", "elevenlabs_tts", "openai_tts", "piper_tts"]
    agent_skills = ["dashscope"]

    capabilities = ["text_to_speech", "voice_selection", "multilingual"]
    supports = {
        "voice_cloning": False,
        "multilingual": True,
        "offline": False,
        "native_audio": True,
    }
    best_for = ["Chinese-language narration via Qwen-Audio 3.1 WebSocket TTS"]
    not_good_for = ["fully offline production", "voice clone matching"]

    input_schema = {
        "type": "object",
        "required": ["text"],
        "properties": {
            "text": {
                "type": "string",
                "description": "Text to convert to speech.",
            },
            "model": {
                "type": "string",
                "enum": ["qwen-audio-3.1-tts-flash"],
                "default": "qwen-audio-3.1-tts-flash",
            },
            "voice": {
                "type": "string",
                "default": "xuyuyuan_v3.1",
                "description": "Qwen-Audio 3.1 voice ID.",
            },
            "language_type": {
                "type": "string",
                "default": "Auto",
                "enum": ["Auto", "Chinese", "English", "Japanese", "Korean"],
                "description": "Language hint for the TTS model.",
            },
            "speech_rate": {
                "type": "number",
                "default": 0.65,
                "minimum": 0.5,
                "maximum": 2.0,
                "description": "Relative speech rate for the SDK WebSocket synthesizer.",
            },
            "instructions": {
                "type": "string",
                "description": "Optional natural-language delivery direction.",
            },
            "output_path": {"type": "string"},
        },
    }

    resource_profile = ResourceProfile(
        cpu_cores=1, ram_mb=256, vram_mb=0, disk_mb=50, network_required=True
    )
    retry_policy = RetryPolicy(
        max_retries=2, retryable_errors=["rate_limit", "timeout"]
    )
    idempotency_key_fields = [
        "text",
        "voice",
        "model",
        "language_type",
        "speech_rate",
        "instructions",
    ]
    side_effects = [
        "writes audio file to output_path",
        "calls DashScope SDK WebSocket TTS API",
    ]
    user_visible_verification = [
        "Listen to generated audio for naturalness and pacing"
    ]

    MODEL = "qwen-audio-3.1-tts-flash"
    WEBSOCKET_DEFAULT_URL = "wss://maas.qianwenaiapi.com/api-ws/v1/inference"
    WEBSOCKET_DEFAULT_VOICE = "xuyuyuan_v3.1"
    DEFAULT_SPEECH_RATE = 0.65

    def get_status(self) -> ToolStatus:
        return (
            ToolStatus.AVAILABLE
            if os.environ.get("DASHSCOPE_API_KEY")
            else ToolStatus.UNAVAILABLE
        )

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        """No cost estimate without actual input/output token usage from the SDK."""
        return 0.0

    @staticmethod
    def _load_websocket_sdk():
        import dashscope
        from dashscope.audio.tts_v2 import SpeechSynthesizer

        return dashscope, SpeechSynthesizer

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        api_key = os.environ.get("DASHSCOPE_API_KEY")
        if not api_key:
            return ToolResult(
                success=False,
                error="DASHSCOPE_API_KEY not set. " + self.install_instructions,
            )

        model = inputs.get("model", self.MODEL)
        if model != self.MODEL:
            return ToolResult(
                success=False,
                error=f"Unsupported model: {model}. This tool only supports {self.MODEL}.",
            )

        start = time.time()
        try:
            dashscope, speech_synthesizer = self._load_websocket_sdk()
            endpoint = os.environ.get(
                "DASHSCOPE_WS_BASE_URL", self.WEBSOCKET_DEFAULT_URL
            ).strip()
            if not endpoint:
                raise ValueError("DASHSCOPE_WS_BASE_URL cannot be empty")

            voice = inputs.get("voice") or self.WEBSOCKET_DEFAULT_VOICE
            speech_rate = inputs.get("speech_rate", self.DEFAULT_SPEECH_RATE)
            dashscope.api_key = api_key
            dashscope.base_websocket_api_url = endpoint
            synthesizer = speech_synthesizer(
                model=model,
                voice=voice,
                instruction=inputs.get("instructions"),
                language_hints=self._websocket_language_hints(inputs),
                speech_rate=speech_rate,
            )
            audio = synthesizer.call(inputs["text"], timeout_millis=120000)
            if not isinstance(audio, bytes) or not audio:
                raise RuntimeError("DashScope WebSocket TTS returned no audio bytes")

            output_path = Path(inputs.get("output_path", "dashscope_tts.mp3"))
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(audio)

            from tools.analysis.audio_probe import probe_duration

            audio_duration = probe_duration(output_path)
        except Exception as exc:
            return ToolResult(
                success=False,
                error=f"DashScope WebSocket TTS failed: {self._safe_error(exc)}",
            )

        return ToolResult(
            success=True,
            data={
                "provider": "dashscope",
                "transport": "websocket",
                "endpoint": endpoint,
                "model": model,
                "voice": voice,
                "language_type": inputs.get("language_type", "Auto"),
                "speech_rate": speech_rate,
                "text_length": len(inputs["text"]),
                "audio_duration_seconds": (
                    round(audio_duration, 2) if audio_duration else None
                ),
                "output": str(output_path),
                "cost_estimate_available": False,
            },
            artifacts=[str(output_path)],
            cost_usd=0.0,
            duration_seconds=round(time.time() - start, 2),
            model=model,
        )

    @staticmethod
    def _websocket_language_hints(inputs: dict[str, Any]) -> list[str] | None:
        language = inputs.get("language_type", "Auto")
        return {
            "Chinese": ["zh"],
            "English": ["en"],
            "Japanese": ["ja"],
            "Korean": ["ko"],
        }.get(language)

    @staticmethod
    def _safe_error(exc: Exception) -> str:
        return str(exc).replace(
            os.environ.get("DASHSCOPE_API_KEY", ""), "[redacted]"
        )
