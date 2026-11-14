"""Vidu S2 Avatar (offline / async) talking-head video generation.

Vidu's S2-Avatar 非实时版 exposes an async task API: ``POST
/ent/s_avatar/offline`` accepts one character image plus either an audio
file or a text line, and returns a ``task_id``; ``GET
/ent/v2/tasks/{task_id}/creations`` is polled until the task reaches
``success`` or ``failed``. On success ``creations[].url`` holds the
clean video (24h expiry), so the tool downloads it into ``output_path``
immediately.

Compared with the AutoDL H3 image+audio workflow (``autodl_comfyui_video``)
this route does not take a prompt at all: identity comes from the single
reference image, and mouth shape comes from the audio track. That makes
it the low-friction path when the presenter's look is already fixed and
no per-shot camera/prompt control is needed.

Docs: https://platform.vidu.cn/vidu-stream/doc/s2-avatar/async/introduction
      https://platform.vidu.cn/vidu-stream/doc/s2-avatar/async/parameters
"""

from __future__ import annotations

import base64
import json
import mimetypes
import os
import time
from pathlib import Path
from typing import Any

import requests

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

# Host for the domestic platform; the overseas deployment is api.vidu.com.
VIDU_API_BASE = "https://api.vidu.cn"

# Create + poll endpoints, appended to the host above.
CREATE_PATH = "/ent/s_avatar/offline"
TASK_PATH = "/ent/v2/tasks/{task_id}/creations"

# Default model for the offline avatar flow.
DEFAULT_MODEL = "vidu-s2"

# Accepted resolution tokens (case-insensitive on input, lower-cased on send).
RESOLUTIONS = ("720p", "1080p", "2k")

# Local base64 inputs are rejected by the API above this decoded size;
# larger assets must be served from a public URL instead.
MAX_BASE64_BYTES = 20 * 1024 * 1024

KEY_ENV_VAR = "VIDU_API_KEY"
BASE_ENV_VAR = "VIDU_API_BASE_URL"

# Pricing: 1 credit per output second, 1 credit = 0.03125 CNY.
CNY_PER_CREDIT = 0.03125
USD_PER_CNY = 0.139  # ~7.2 CNY/USD, for the advisory cost estimate only
# Text mode bills the synthesized speech; the docs quote ~2-3 characters/s.
CHARS_PER_SECOND = 2.5


def _api_base() -> str:
    return os.environ.get(BASE_ENV_VAR, VIDU_API_BASE).rstrip("/")


def _api_key() -> str | None:
    """Return the configured Vidu key, or None when unset / commented out."""
    raw = os.environ.get(KEY_ENV_VAR, "").strip()
    if not raw or raw.startswith("#"):
        return None
    return raw


def _as_media_value(value: str, kind: str) -> tuple[str, str]:
    """Normalize one media input into what the API accepts.

    Returns ``(payload_value, source_kind)`` where ``source_kind`` is
    ``url``, ``base64`` or ``file``. Public URLs and ``data:`` URIs pass
    through untouched; anything else is read from disk and encoded as a
    ``data:`` URI with the MIME type prefix the API requires.
    """
    text = (value or "").strip()
    if text.startswith(("http://", "https://")):
        return text, "url"
    if text.startswith("data:"):
        return text, "base64"

    path = Path(text)
    if not path.is_file():
        raise FileNotFoundError(
            f"{kind} input is neither a public http(s) URL, a data: URI, "
            f"nor an existing file: {text!r}"
        )
    raw = path.read_bytes()
    if len(raw) > MAX_BASE64_BYTES:
        raise ValueError(
            f"{kind} file is {len(raw) / 1024 / 1024:.1f} MB; the API caps "
            f"base64 input at {MAX_BASE64_BYTES // 1024 // 1024} MB decoded. "
            f"Upload it somewhere public and pass the URL instead."
        )
    mime = mimetypes.guess_type(path.name)[0]
    if not mime:
        mime = "image/png" if kind == "image" else "audio/mpeg"
    return f"data:{mime};base64,{base64.b64encode(raw).decode('ascii')}", "file"


class ViduS2Avatar(BaseTool):
    """Vidu S2-Avatar 非实时版: image + audio (or text) -> talking video.

    Sends one character image and either a narration audio file or a
    text line, polls the task, then downloads the clean ``creations[].url``
    video. Text mode lets Vidu synthesize the voice with ``voice``; audio
    mode always wins when both are supplied, so a pre-generated narration
    keeps the project's own TTS voice.
    """

    name = "vidu_s2_avatar"
    version = "0.1.0"
    tier = ToolTier.GENERATE
    capability = "avatar"
    provider = "vidu"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.ASYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies = [f"env:{KEY_ENV_VAR}"]
    install_instructions = (
        f"Set {KEY_ENV_VAR} to your Vidu open-platform key (format "
        "``vda_xxx``).\n"
        "  Get one at https://platform.vidu.cn/vidu-stream/doc/api-key\n"
        "When both ``audio`` and ``text`` are supplied the API uses the "
        "audio track, so a project-generated narration keeps its own voice."
    )
    agent_skills: list[str] = []

    capabilities = ["avatar_video", "audio_driven_avatar", "text_driven_avatar"]
    supports = {
        "audio_driven_avatar": True,
        "text_driven_avatar": True,
        "single_image_required": True,
        "timeline_actions": True,
        "callback_url": True,
        "short_lived_result_urls": True,
        "cloud_render": True,
        "prompt_control": False,
    }
    best_for = [
        "presenter clips where the look is already fixed by one character image",
        "narration-driven lip sync without writing per-shot motion prompts",
        "projects that already have a Vidu key and want an async batch-friendly route",
    ]
    not_good_for = [
        "shot-by-shot camera or expression control (use the AutoDL H3 image+audio workflow)",
        "multi-person images: the API accepts exactly one person per image",
        "offline / no-network runs",
    ]
    fallback_tools = [
        "autodl_comfyui_video",
        "kling_avatar",
        "talking_head",
        "lip_sync",
    ]

    input_schema = {
        "type": "object",
        "required": ["image"],
        "anyOf": [{"required": ["audio"]}, {"required": ["text"]}],
        "properties": {
            "image": {
                "type": "string",
                "description": (
                    "Character image: public http(s) URL, data: URI, or a "
                    "local file path (auto-encoded as base64, max 20 MB "
                    "decoded). Exactly one person per image; face and full "
                    "body joints must be visible or the task fails with an "
                    "ImageCheck* error."
                ),
            },
            "audio": {
                "type": "string",
                "description": (
                    "Narration audio: URL, data: URI, or local path. Takes "
                    "precedence over ``text``. Output length follows this "
                    "track, and billing is 1 credit per output second."
                ),
            },
            "text": {
                "type": "string",
                "description": (
                    "Speaking line used only when ``audio`` is absent; Vidu "
                    "synthesizes the voice. Max 10000 characters. Billed by "
                    "the synthesized speech length (~2-3 chars/s), so a "
                    "project TTS track is almost always cheaper and more "
                    "consistent."
                ),
            },
            "voice": {
                "type": "string",
                "description": (
                    "Vidu voice id for text mode only; ignored when ``audio`` "
                    "is supplied. See https://platform.vidu.cn/vidu-stream/doc/voice-list"
                ),
            },
            "timeline": {
                "type": ["array", "string"],
                "description": (
                    "Optional action timeline: a list of "
                    "``{text, time_range: [start, end]}`` objects (seconds) or "
                    "the equivalent JSON string. Omit to let the service "
                    "derive actions from the audio; keep actions >= 5s apart."
                ),
            },
            "resolution": {
                "type": "string",
                "enum": list(RESOLUTIONS),
                "default": "720p",
                "description": "Output resolution: 720p (default), 1080p or 2k.",
            },
            "watermark": {
                "type": "boolean",
                "default": False,
                "description": (
                    "Whether Vidu also renders a watermarked copy. The tool "
                    "always downloads the clean ``creations[].url``; the "
                    "watermarked variant is only reported. Set true when you "
                    "need the compliance-marked file as well."
                ),
            },
            "payload": {
                "type": "string",
                "description": "Optional passthrough tag returned by the query API (e.g. a project id).",
            },
            "output_path": {
                "type": "string",
                "description": "Where to save the downloaded mp4.",
            },
            "poll_interval_seconds": {
                "type": "number",
                "minimum": 2.0,
                "default": 4.0,
                "description": "Seconds between polls; values below 2s risk TooManyRequests.",
            },
            "timeout_seconds": {
                "type": "integer",
                "minimum": 30,
                "default": 300,
                "description": "Wall-clock budget for the task; Vidu documents 40s-2min typical.",
            },
        },
    }

    resource_profile = ResourceProfile(
        cpu_cores=1,
        ram_mb=512,
        vram_mb=0,
        disk_mb=500,
        network_required=True,
    )
    retry_policy = RetryPolicy(
        max_retries=1,
        backoff_seconds=5.0,
        retryable_errors=["network_error", "rate_limit"],
    )
    idempotency_key_fields = ["image", "audio", "text", "voice", "resolution"]
    side_effects = [
        "calls the Vidu S2 offline avatar create/poll/download API",
        "writes video file to output_path",
    ]
    user_visible_verification = [
        "Play the clip: lip sync must match the narration for the whole segment",
        "Check the neck, chin, shoulders and clothing for warping or melting",
        "Confirm the framing and background stay locked across the clip",
    ]

    # ----- status & cost -----

    def get_status(self) -> ToolStatus:
        if not _api_key():
            return ToolStatus.UNAVAILABLE
        return ToolStatus.AVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        """Advisory USD estimate: 1 credit per output second.

        Output length equals the audio duration, which is unknown before
        the call, so audio mode returns 0. Text mode is estimated from
        the documented ~2.5 characters per second.
        """
        if inputs.get("audio"):
            return 0.0
        chars = len(str(inputs.get("text") or "").strip())
        if not chars:
            return 0.0
        seconds = chars / CHARS_PER_SECOND
        return round(seconds * CNY_PER_CREDIT * USD_PER_CNY, 4)

    def estimate_runtime(self, inputs: dict[str, Any]) -> float:
        return 120.0

    # ----- execute -----

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        key = _api_key()
        if not key:
            return ToolResult(
                success=False,
                error=f"{KEY_ENV_VAR} not set. " + self.install_instructions,
            )

        image_input = str(inputs.get("image") or "").strip()
        audio_input = str(inputs.get("audio") or "").strip()
        text = str(inputs.get("text") or "").strip()
        if not image_input:
            return ToolResult(success=False, error="image is required")
        if not audio_input and not text:
            return ToolResult(success=False, error="audio or text is required")
        if audio_input and text:
            # The API would silently prefer the audio; say so instead of
            # letting the caller believe the text was used.
            text = ""

        resolution = str(inputs.get("resolution") or "720p").lower()
        if resolution not in RESOLUTIONS:
            return ToolResult(
                success=False,
                error=f"resolution must be one of {', '.join(RESOLUTIONS)}",
            )

        try:
            image_value, image_source = _as_media_value(image_input, "image")
            audio_value, audio_source = ("", "")
            if audio_input:
                audio_value, audio_source = _as_media_value(audio_input, "audio")
        except (OSError, ValueError) as exc:
            return ToolResult(success=False, error=str(exc))

        body: dict[str, Any] = {
            "model": str(inputs.get("model") or DEFAULT_MODEL),
            "image": image_value,
            "resolution": resolution,
        }
        if audio_value:
            body["audio"] = audio_value
        else:
            body["text"] = text
            voice = str(inputs.get("voice") or "").strip()
            if voice:
                body["voice"] = voice

        timeline = inputs.get("timeline")
        if timeline:
            if isinstance(timeline, str):
                # The API wants a serialized JSON string; validate so a
                # malformed value fails here rather than as FieldInvalid.
                try:
                    json.loads(timeline)
                except ValueError:
                    return ToolResult(
                        success=False,
                        error="timeline must be valid JSON (or a list of actions)",
                    )
                body["timeline"] = timeline
            else:
                body["timeline"] = json.dumps(timeline, ensure_ascii=False)

        if inputs.get("watermark") is True:
            body["watermark"] = True
        payload = str(inputs.get("payload") or "").strip()
        if payload:
            body["payload"] = payload

        output_path = Path(
            inputs.get("output_path") or f"vidu_s2_avatar_{int(time.time())}.mp4"
        )
        poll_interval = float(inputs.get("poll_interval_seconds", 4.0) or 4.0)
        timeout = int(inputs.get("timeout_seconds", 300) or 300)

        # Never echo base64 blobs back into artifacts or the board.
        request_summary = {
            key_name: value
            for key_name, value in body.items()
            if key_name not in ("image", "audio")
        }
        request_summary["image_source"] = image_source
        if audio_source:
            request_summary["audio_source"] = audio_source

        start = time.time()
        try:
            task_id = self._create_task(body, key)
        except requests.RequestException as exc:
            return ToolResult(
                success=False,
                error=f"Vidu create task failed (network): {exc}",
                data={"provider": "vidu", "request": request_summary},
            )
        except ViduAPIError as exc:
            return ToolResult(
                success=False,
                error=f"Vidu create task rejected: {exc}",
                data={"provider": "vidu", "request": request_summary},
            )

        try:
            task = self._poll_task(
                task_id, key=key, poll_interval=poll_interval, timeout=timeout
            )
        except ViduTimeoutError as exc:
            return ToolResult(
                success=False,
                error=(
                    f"Vidu task {task_id} did not finish within {timeout}s. "
                    f"The task may still be running server-side; re-check "
                    f"task_id={task_id!r} with the same key."
                ),
                data={
                    "provider": "vidu",
                    "task_id": task_id,
                    "request": request_summary,
                },
            )
        except ViduAPIError as exc:
            return ToolResult(
                success=False,
                error=f"Vidu task failed: {exc}",
                data={
                    "provider": "vidu",
                    "task_id": task_id,
                    "request": request_summary,
                },
            )

        creations = task.get("creations") or []
        if not creations or not creations[0].get("url"):
            return ToolResult(
                success=False,
                error=(
                    f"Vidu task {task_id} reported success but returned no "
                    f"video url: {json.dumps(task, ensure_ascii=False)[:300]}"
                ),
                data={"provider": "vidu", "task_id": task_id},
            )
        first = creations[0]
        video_url = str(first["url"])

        try:
            saved_path = self._download(video_url, output_path)
        except requests.RequestException as exc:
            return ToolResult(
                success=False,
                error=(
                    f"Vidu returned a result URL but the download failed "
                    f"(result URLs expire after 24h; re-run if it is stale): {exc}"
                ),
                data={
                    "provider": "vidu",
                    "task_id": task_id,
                    "result_url": video_url,
                },
            )

        duration = task.get("duration") or 0
        credits = task.get("credits") or 0
        return ToolResult(
            success=True,
            data={
                "provider": "vidu",
                "route": "vidu_s2_offline_avatar",
                "model": task.get("model") or body["model"],
                "task_id": task_id,
                "mode": "audio" if audio_source else "text",
                "duration": duration,
                "credits": credits,
                "resolution": task.get("resolution") or resolution,
                "output": str(saved_path),
                "format": "mp4",
                "result_url": video_url,
                "cover_url": first.get("cover_url") or "",
                "watermarked_url": first.get("watermarked_url") or "",
                "request": request_summary,
                "elapsed_seconds": round(time.time() - start, 2),
            },
            artifacts=[str(saved_path)],
            cost_usd=round(float(credits) * CNY_PER_CREDIT * USD_PER_CNY, 4),
            duration_seconds=round(time.time() - start, 2),
            model=task.get("model") or body["model"],
        )

    # ----- low-level API helpers -----

    @staticmethod
    def _headers(key: str) -> dict[str, str]:
        return {
            "Authorization": f"Token {key}",
            "Content-Type": "application/json",
        }

    def _create_task(self, body: dict[str, Any], key: str) -> str:
        url = f"{_api_base()}{CREATE_PATH}"
        resp = requests.post(url, json=body, headers=self._headers(key), timeout=60)
        data = self._json(resp, "create")
        task_id = data.get("task_id") or (data.get("data") or {}).get("task_id")
        if not task_id:
            raise ViduAPIError(f"no task_id in response: {data}")
        return str(task_id)

    def _poll_task(
        self,
        task_id: str,
        *,
        key: str,
        poll_interval: float,
        timeout: int,
    ) -> dict[str, Any]:
        """Poll until a terminal state and return the task payload."""
        url = f"{_api_base()}{TASK_PATH.format(task_id=task_id)}"
        deadline = time.time() + timeout
        interval = max(2.0, poll_interval)
        last_state = "unknown"
        while time.time() < deadline:
            resp = requests.get(url, headers=self._headers(key), timeout=30)
            data = self._json(resp, "poll")
            task = data.get("data") or data
            state = str(task.get("state") or "").lower()
            last_state = state or last_state

            if state == "success":
                return task
            if state == "failed":
                raise ViduAPIError(
                    f"state=failed err_code={task.get('err_code')!r} "
                    f"err_msg={task.get('err_msg')!r}"
                )
            # created / queueing / processing: back off gradually, but
            # never poll faster than 2s (the API rate-limits that).
            time.sleep(interval)
            interval = min(interval + 1.0, 8.0)

        raise ViduTimeoutError(f"last state {last_state!r} after {timeout}s")

    @staticmethod
    def _json(resp: requests.Response, stage: str) -> dict[str, Any]:
        try:
            data = resp.json()
        except ValueError:
            resp.raise_for_status()
            raise ViduAPIError(
                f"{stage} returned non-JSON body (status {resp.status_code}): "
                f"{resp.text[:200]!r}"
            )
        if resp.status_code >= 400:
            reason = data.get("reason") or data.get("message") or data
            raise ViduAPIError(f"{stage} HTTP {resp.status_code}: {reason}")
        return data

    @staticmethod
    def _download(url: str, dest: Path) -> Path:
        with requests.get(url, stream=True, timeout=180) as resp:
            resp.raise_for_status()
            dest.parent.mkdir(parents=True, exist_ok=True)
            with open(dest, "wb") as fp:
                for chunk in resp.iter_content(chunk_size=1 << 16):
                    if chunk:
                        fp.write(chunk)
        return dest

    # ----- info -----

    def get_info(self) -> dict[str, Any]:
        info = super().get_info()
        info["api_base"] = _api_base()
        info["api_base_env_var"] = BASE_ENV_VAR
        info["key_env_var"] = KEY_ENV_VAR
        info["default_model"] = DEFAULT_MODEL
        info["resolutions"] = list(RESOLUTIONS)
        info["pricing"] = "1 credit per output second; 1 credit = 0.03125 CNY"
        info["execution_modes"] = {
            "vidu_cloud_async": {
                "hosted": True,
                "network_required": True,
                "billing": "Vidu credits (pre-checked on create, deducted on queueing)",
            },
        }
        return info


class ViduAPIError(RuntimeError):
    """Raised when the Vidu API rejects a request or a task ends in ``failed``."""


class ViduTimeoutError(RuntimeError):
    """Raised when a Vidu task does not reach a terminal state in time."""
