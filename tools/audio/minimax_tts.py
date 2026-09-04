"""MiniMax text-to-speech through the first-party T2A v2 API."""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    RetryPolicy,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolTier,
)


MODELS = [
    "speech-2.8-hd",
    "speech-2.8-turbo",
    "speech-2.6-hd",
    "speech-2.6-turbo",
    "speech-2.5-hd-preview",
    "speech-2.5-turbo-preview",
    "speech-02-hd",
    "speech-02-turbo",
    "speech-01-hd",
    "speech-01-turbo",
]
# speech-02-hd is listed on both the global (api.minimax.io) and mainland
# China (api.minimaxi.com) platforms, so it is the safest default.
DEFAULT_MODEL = "speech-02-hd"
DEFAULT_REGION = "global"
# Conservative pay-as-you-go estimate (~HD tier, per 1k characters).
PRICE_PER_1K_CHARS_USD = 0.05
REGION_BASE_URLS = {
    "global": "https://api.minimax.io",
    "global_en": "https://api.minimax.io",
    "cn": "https://api.minimaxi.com",
    "cn_zh": "https://api.minimaxi.com",
}
FORMAT_SUFFIXES = {"mp3": ".mp3", "wav": ".wav", "flac": ".flac", "pcm": ".pcm"}


class MinimaxTTS(BaseTool):
    name = "minimax_tts"
    version = "0.1.0"
    tier = ToolTier.VOICE
    capability = "tts"
    provider = "minimax"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies = ["env:MINIMAX_API_KEY"]
    install_instructions = (
        "Set MINIMAX_API_KEY to your MiniMax API key. "
        "Optionally set MINIMAX_REGION to global or cn, "
        "MINIMAX_TTS_VOICE to a default voice id, and "
        "MINIMAX_GROUP_ID if your account requires the GroupId query parameter."
    )
    agent_skills = ["text-to-speech"]
    fallback = "doubao_tts"
    fallback_tools = ["doubao_tts", "google_tts", "elevenlabs_tts", "openai_tts", "piper_tts"]

    capabilities = [
        "text_to_speech",
        "voice_selection",
        "multilingual",
    ]
    supports = {
        "voice_cloning": True,
        "multilingual": True,
        "offline": False,
        "native_audio": True,
    }
    best_for = [
        "natural Mandarin and multilingual narration via the MiniMax voice library",
        "one-key setups that already use MINIMAX_API_KEY for image/video",
        "expressive narrator voices with speed/volume/pitch control",
    ]
    not_good_for = [
        "fully offline production",
        "word-level subtitle timestamps (use a tool with timestamp support)",
    ]

    input_schema = {
        "type": "object",
        "required": ["text"],
        "properties": {
            "text": {
                "type": "string",
                "description": "Text to convert to speech. Max 10000 characters. "
                "Insert <#x#> markers for custom pauses (x in seconds).",
            },
            "model": {
                "type": "string",
                "enum": MODELS,
                "default": DEFAULT_MODEL,
            },
            "voice_id": {
                "type": "string",
                "description": "MiniMax voice id (system or cloned). "
                "System examples: presenter_female, presenter_male, female-shaonv, "
                "female-yujie, male-qn-jingying, audiobook_female_1. "
                "Defaults to MINIMAX_TTS_VOICE or presenter_female.",
            },
            "speed": {"type": "number", "minimum": 0.5, "maximum": 2.0, "default": 1.0},
            "vol": {"type": "number", "exclusiveMinimum": 0, "maximum": 10, "default": 1.0},
            "pitch": {"type": "integer", "minimum": -12, "maximum": 12, "default": 0},
            "format": {
                "type": "string",
                "enum": ["mp3", "wav", "flac", "pcm"],
                "default": "mp3",
            },
            "sample_rate": {
                "type": "integer",
                "enum": [8000, 16000, 22050, 24000, 32000, 44100],
                "default": 32000,
            },
            "bitrate": {"type": "integer", "default": 128000},
            "language_boost": {
                "type": "string",
                "description": "Boost minority-language recognition, e.g. Chinese, English, "
                "Japanese. Use 'auto' to let the model detect the language.",
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
        "model",
        "voice_id",
        "speed",
        "vol",
        "pitch",
        "format",
        "sample_rate",
        "bitrate",
        "language_boost",
    ]
    side_effects = [
        "writes an audio file to output_path",
        "calls the MiniMax T2A v2 API",
    ]
    user_visible_verification = [
        "Listen to the generated narration for pronunciation and pacing"
    ]

    @staticmethod
    def _region() -> str:
        region = os.environ.get("MINIMAX_REGION", DEFAULT_REGION).strip().lower()
        return region if region in REGION_BASE_URLS else DEFAULT_REGION

    def _base_url(self) -> str:
        override = os.environ.get("MINIMAX_BASE_URL")
        if override:
            return override.rstrip("/")
        return REGION_BASE_URLS[self._region()]

    def _endpoint(self) -> str:
        url = f"{self._base_url()}/v1/t2a_v2"
        group_id = os.environ.get("MINIMAX_GROUP_ID", "").strip()
        if group_id:
            url = f"{url}?{urlencode({'GroupId': group_id})}"
        return url

    @staticmethod
    def _default_voice() -> str:
        return os.environ.get("MINIMAX_TTS_VOICE", "").strip() or "presenter_female"

    @staticmethod
    def _base_resp_error(data: dict[str, Any]) -> str | None:
        base_resp = data.get("base_resp") or {}
        status_code = base_resp.get("status_code")
        if status_code in (None, 0):
            return None
        status_msg = base_resp.get("status_msg") or "unknown error"
        return f"MiniMax API error {status_code}: {status_msg}"

    @staticmethod
    def _build_payload(inputs: dict[str, Any]) -> dict[str, Any]:
        model = inputs.get("model", DEFAULT_MODEL)
        if model not in MODELS:
            raise ValueError(f"Unsupported MiniMax TTS model '{model}'.")

        text = inputs.get("text")
        if not isinstance(text, str) or not text:
            raise ValueError("MiniMax TTS requires 'text'.")
        if len(text) > 10000:
            raise ValueError("MiniMax TTS text must not exceed 10000 characters.")

        audio_format = inputs.get("format", "mp3")

        payload: dict[str, Any] = {
            "model": model,
            "text": text,
            "stream": False,
            "voice_setting": {
                "voice_id": inputs.get("voice_id") or MinimaxTTS._default_voice(),
                "speed": float(inputs.get("speed", 1.0)),
                "vol": float(inputs.get("vol", 1.0)),
                "pitch": int(inputs.get("pitch", 0)),
            },
            "audio_setting": {
                "sample_rate": int(inputs.get("sample_rate", 32000)),
                "bitrate": int(inputs.get("bitrate", 128000)),
                "format": audio_format,
                "channel": 1,
            },
        }
        if inputs.get("language_boost"):
            payload["language_boost"] = inputs["language_boost"]
        return payload

    @staticmethod
    def _output_path(output_path: str | None, audio_format: str) -> Path:
        path = Path(output_path or "minimax_tts.mp3")
        suffix = FORMAT_SUFFIXES.get(audio_format, ".mp3")
        if path.suffix != suffix:
            path = path.with_suffix(suffix)
        return path

    @staticmethod
    def _safe_error(exc: Exception, api_key: str) -> str:
        return str(exc).replace(api_key, "[redacted]") if api_key else str(exc)

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        text = inputs.get("text") or ""
        return round(len(text) / 1000 * PRICE_PER_1K_CHARS_USD, 6)

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        api_key = os.environ.get("MINIMAX_API_KEY", "")
        if not api_key:
            return ToolResult(
                success=False,
                error="MINIMAX_API_KEY not set. " + self.install_instructions,
            )

        import requests

        start = time.time()
        try:
            payload = self._build_payload(inputs)
            response = requests.post(
                self._endpoint(),
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=120,
            )
            response.raise_for_status()
            data = response.json()

            base_error = self._base_resp_error(data)
            if base_error:
                return ToolResult(success=False, error=base_error)

            audio_hex = (data.get("data") or {}).get("audio")
            if not audio_hex:
                return ToolResult(
                    success=False, error="MiniMax returned no audio payload."
                )

            output_path = self._output_path(
                inputs.get("output_path"), payload["audio_setting"]["format"]
            )
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(bytes.fromhex(audio_hex))
        except Exception as exc:
            return ToolResult(
                success=False,
                error=(
                    "MiniMax TTS failed: "
                    f"{self._safe_error(exc, api_key)}"
                ),
            )

        extra = data.get("extra_info") or {}
        return ToolResult(
            success=True,
            data={
                "provider": "minimax",
                "model": payload["model"],
                "text": payload["text"],
                "voice_id": payload["voice_setting"]["voice_id"],
                "region": self._region(),
                "output": str(output_path),
                "usage_characters": extra.get("usage_characters"),
                "audio_length": extra.get("audio_length"),
                "audio_sample_rate": extra.get("audio_sample_rate"),
                "audio_format": extra.get("audio_format"),
                "request_id": data.get("trace_id"),
            },
            artifacts=[str(output_path)],
            cost_usd=self.estimate_cost(inputs),
            duration_seconds=round(time.time() - start, 2),
            model=payload["model"],
        )
