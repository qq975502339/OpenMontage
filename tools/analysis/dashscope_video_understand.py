"""DashScope Qwen3-VL-Flash video and image understanding."""

from __future__ import annotations

import base64
import io
import os
import time
from pathlib import Path
from typing import Any

from tools.analysis.video_understand import (
    IMAGE_EXTENSIONS,
    VIDEO_EXTENSIONS,
    VideoUnderstand,
)
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


class DashscopeVideoUnderstand(BaseTool):
    name = "dashscope_video_understand"
    version = "0.1.0"
    tier = ToolTier.ANALYZE
    capability = "analysis"
    provider = "dashscope"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies: list[str] = []
    install_instructions = (
        "Set DASHSCOPE_API_KEY to your Alibaba Cloud DashScope API key.\n"
        "  Get one at https://dashscope.aliyun.com/"
    )
    fallback = "video_understand"
    fallback_tools = ["video_understand"]
    agent_skills = ["dashscope"]

    capabilities = [
        "video_description",
        "visual_qa",
        "semantic_quality_assessment",
    ]
    supports = {
        "local_media": True,
        "video": True,
        "image": True,
        "offline": False,
    }
    best_for = [
        "video descriptions",
        "cross-frame visual questions",
        "semantic video-quality review",
    ]
    not_good_for = [
        "offline analysis",
        "numeric blur or exposure measurements",
    ]

    input_schema = {
        "type": "object",
        "required": ["input_path"],
        "properties": {
            "input_path": {
                "type": "string",
                "description": "Local image or video path",
            },
            "mode": {
                "type": "string",
                "enum": ["describe", "qa", "quality"],
                "default": "describe",
            },
            "query": {
                "type": "string",
                "description": "Required visual question for qa mode",
            },
            "model": {
                "type": "string",
                "enum": ["qwen3-vl-flash"],
                "default": "qwen3-vl-flash",
            },
            "frame_indices": {
                "type": "array",
                "items": {"type": "integer"},
            },
            "max_frames": {
                "type": "integer",
                "default": 5,
                "minimum": 1,
                "maximum": 24,
            },
        },
    }
    output_schema = {
        "type": "object",
        "properties": {
            "frames": {"type": "array"},
            "summary": {"type": "string"},
            "mode": {"type": "string"},
            "model": {"type": "string"},
        },
    }

    resource_profile = ResourceProfile(
        cpu_cores=1,
        ram_mb=512,
        vram_mb=0,
        disk_mb=100,
        network_required=True,
    )
    retry_policy = RetryPolicy(
        max_retries=2,
        retryable_errors=["rate_limit", "timeout"],
    )
    idempotency_key_fields = [
        "input_path",
        "mode",
        "model",
        "query",
        "frame_indices",
        "max_frames",
    ]
    side_effects = ["calls DashScope (Alibaba Cloud) Qwen3-VL-Flash API"]
    user_visible_verification = [
        "Compare the response with sampled video frames",
        "Treat semantic quality feedback as sampled evidence, not a "
        "frame-perfect guarantee",
    ]

    ENDPOINT = (
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/"
        "multimodal-generation/generation"
    )

    def get_status(self) -> ToolStatus:
        if os.environ.get("DASHSCOPE_API_KEY"):
            return ToolStatus.AVAILABLE
        return ToolStatus.UNAVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        # DashScope video-understanding pricing varies by sampled-frame input.
        return 0.0

    def estimate_runtime(self, inputs: dict[str, Any]) -> float:
        return float(inputs.get("max_frames", 5)) * 2.0

    @staticmethod
    def _frame_to_data_url(frame: Any) -> str:
        buffer = io.BytesIO()
        frame.convert("RGB").save(buffer, format="JPEG", quality=85)
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        return f"data:image/jpeg;base64,{encoded}"

    @staticmethod
    def _prompt_for(*, mode: str, query: str | None) -> str:
        prompts = {
            "describe": (
                "Describe the sampled video frames in chronological order. "
                "Cover subjects, actions, scene changes, camera/framing, "
                "readable on-screen text, and uncertainty. Do not claim "
                "events absent from the samples."
            ),
            "quality": (
                "Assess only visual-quality issues visible in these sampled "
                "frames: blur, exposure, contrast, compression artifacts, "
                "framing, occlusion, and continuity. State uncertainty and "
                "do not claim a full-video guarantee."
            ),
        }
        if mode == "qa":
            return (
                "Answer this question using only the sampled frames: "
                f"{query} Cite relevant frame numbers and state uncertainty."
            )
        return prompts[mode]

    def _build_payload(
        self,
        frames: list[Any],
        *,
        mode: str,
        query: str | None,
    ) -> dict[str, Any]:
        content = [{"image": self._frame_to_data_url(frame)} for frame in frames]
        content.append({"text": self._prompt_for(mode=mode, query=query)})
        return {
            "model": "qwen3-vl-flash",
            "input": {"messages": [{"role": "user", "content": content}]},
            "parameters": {"result_format": "message"},
        }

    @staticmethod
    def _extract_text(data: dict[str, Any]) -> str:
        choices = data.get("output", {}).get("choices", [])
        if not choices:
            return ""
        content = choices[0].get("message", {}).get("content", [])
        return "\n".join(
            item["text"] for item in content if item.get("text")
        ).strip()

    @staticmethod
    def _safe_error(exc: Exception) -> str:
        message = str(exc)
        api_key = os.environ.get("DASHSCOPE_API_KEY")
        return message.replace(api_key, "[redacted]") if api_key else message

    @staticmethod
    def _load_frames(
        input_path: Path,
        is_video: bool,
        frame_indices: list[int] | None,
        max_frames: int,
    ) -> list:
        return VideoUnderstand()._load_frames(
            input_path,
            is_video,
            frame_indices,
            max_frames,
        )

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        api_key = os.environ.get("DASHSCOPE_API_KEY")
        if not api_key:
            return ToolResult(
                success=False,
                error="DASHSCOPE_API_KEY not set. " + self.install_instructions,
            )

        raw_path = inputs.get("input_path")
        if not raw_path:
            return ToolResult(success=False, error="input_path is required.")
        input_path = Path(raw_path)
        if not input_path.exists():
            return ToolResult(
                success=False,
                error=f"Input file not found: {input_path}",
            )

        suffix = input_path.suffix.lower()
        is_video = suffix in VIDEO_EXTENSIONS
        if not is_video and suffix not in IMAGE_EXTENSIONS:
            return ToolResult(
                success=False,
                error=(
                    f"Unsupported file type: {suffix}. Supported: "
                    f"{sorted(VIDEO_EXTENSIONS | IMAGE_EXTENSIONS)}"
                ),
            )

        mode = inputs.get("mode", "describe")
        if mode not in {"describe", "qa", "quality"}:
            return ToolResult(success=False, error=f"Unknown mode: {mode}")
        query = inputs.get("query")
        if mode == "qa" and not query:
            return ToolResult(
                success=False,
                error="Query is required for 'qa' mode.",
            )

        max_frames = int(inputs.get("max_frames", 5))
        if max_frames < 1:
            return ToolResult(
                success=False,
                error="max_frames must be at least 1.",
            )

        start = time.time()
        try:
            frames = self._load_frames(
                input_path,
                is_video,
                inputs.get("frame_indices"),
                max_frames,
            )
            if not frames:
                return ToolResult(
                    success=False,
                    error="No frames could be extracted.",
                )

            import requests

            response = requests.post(
                self.ENDPOINT,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=self._build_payload(frames, mode=mode, query=query),
                timeout=180,
            )
            response.raise_for_status()
            summary = self._extract_text(response.json())
            if not summary:
                return ToolResult(
                    success=False,
                    error="DashScope returned no analysis text",
                )
        except Exception as exc:
            return ToolResult(
                success=False,
                error=(
                    "DashScope video understanding failed: "
                    f"{self._safe_error(exc)}"
                ),
            )

        return ToolResult(
            success=True,
            data={
                "provider": "dashscope",
                "model": "qwen3-vl-flash",
                "mode": mode,
                "summary": summary,
                "frames": [
                    {"frame_index": index} for index in range(len(frames))
                ],
                "frame_count": len(frames),
            },
            cost_usd=self.estimate_cost(inputs),
            duration_seconds=round(time.time() - start, 2),
            model="qwen3-vl-flash",
        )
