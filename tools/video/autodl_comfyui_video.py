"""AutoDL ComfyUI text-to-video via the AutoDL hosted ComfyUI API.

AutoDL wraps user-supplied ComfyUI workflows behind a two-step REST
protocol: ``POST /api/v1/comfyui/comfyui_workflow/{workflow_id}`` to
submit a task and get a ``task_id``, then ``GET /api/v1/comfyui/
comfyui_workflow/result/{task_id}`` to poll until the task finishes.
When the task succeeds the response payload's ``results`` field lists
downloadable artifact URLs (image / video / audio); the result URL is
short-lived so the tool downloads the artifact locally and returns the
local path.

Unlike the local ``comfyui_video`` tool (which talks to a ComfyUI
server running on the user's machine), this tool talks to a hosted
ComfyUI workflow that AutoDL runs on its own GPU pool. The user only
needs an AutoDL API token whose permission group is bound to the
target workflow (e.g. ``H3`` for the H3 text-to-video family); the
tool never has to manage models, GPUs, or local ComfyUI installs.

The default workflow ID is ``minimax_h3_b99_001`` (the user's H3
text-to-video flow), but the tool is generic -- any AutoDL-published
ComfyUI workflow ID with the same REST contract can be selected via
the ``workflow_id`` input or the ``AUTODL_COMFYUI_WORKFLOW_ID`` env
var. Body fields (prompt, duration, resolution, and any workflow-
specific extras) are passed through as a JSON object so the caller can
match the workflow's actual request schema without tool changes.

See https://autodl.art/docs/comfyui_api/ for the upstream contract.
"""

from __future__ import annotations

import json
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

# Base URL for the AutoDL ComfyUI REST API. The submit endpoint is
# /comfyui_workflow/{workflow_id} and the poll endpoint is
# /comfyui_workflow/result/{task_id}. Both are appended to this host.
AUTODL_API_BASE = "https://autodl.art/api/v1/comfyui"

# Default workflow for the H3 text-to-video path. The token's
# permission group must match (here ``H3``); otherwise the API
# returns 401/403.
DEFAULT_WORKFLOW_ID = "minimax_h3_b99_001"

# Env var name for the user's AutoDL token. The token is bound to one
# or more workflow groups (e.g. ``H3``); the tool does not validate
# the group -- the API does.
TOKEN_ENV_VAR = "AUTODL_COMFYUI_TOKEN"

# Optional env override for the workflow ID; the input field wins
# when supplied. Useful for A/B'ing different H3 variants without
# editing the tool call.
WORKFLOW_ID_ENV_VAR = "AUTODL_COMFYUI_WORKFLOW_ID"

# Optional env override for the AutoDL host, mostly there to support
# internal test sandboxes that mirror the public surface.
API_BASE_ENV_VAR = "AUTODL_COMFYUI_BASE_URL"


def _api_base() -> str:
    return os.environ.get(API_BASE_ENV_VAR, AUTODL_API_BASE).rstrip("/")


def _token() -> str | None:
    """Return the configured AutoDL token, or None if unset / commented.

    Honours the same ``#`` placeholder convention the .env loader
    uses -- a leading ``#`` after stripping whitespace is treated as
    "not set" so a half-configured .env does not get sent to AutoDL
    as ``# your token here``.
    """
    raw = os.environ.get(TOKEN_ENV_VAR, "").strip()
    if not raw or raw.startswith("#"):
        return None
    return raw


class AutoDLComfyUIVideo(BaseTool):
    """Hosted ComfyUI text-to-video via AutoDL's wrapper API.

    Submits the configured workflow (default ``minimax_h3_b99_001``)
    as an async task, polls the result endpoint until the workflow
    finishes, then downloads the generated video from the
    short-lived result URL into ``output_path``.

    The same model stack as the local ``comfyui_video``'s
    ``minimax_h3_api`` partner-node path is reachable here, but the
    cost and quota come from AutoDL's pricing rather than from ComfyUI
    Partner Node credits. Pick this tool when the user already has an
    AutoDL token with H3 access; pick the local tool when the user
    wants ComfyUI Partner Nodes or a self-hosted server.
    """

    name = "autodl_comfyui_video"
    version = "0.1.0"
    tier = ToolTier.GENERATE
    capability = "video_generation"
    provider = "autodl"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.ASYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies = [f"env:{TOKEN_ENV_VAR}"]
    install_instructions = (
        f"Set {TOKEN_ENV_VAR} to your AutoDL API token. Create one at\n"
        "  https://autodl.art/large-model/tokens\n"
        "Choose the permission group that matches the target workflow\n"
        "(e.g. ``H3`` for the default H3 text-to-video flow).\n"
        "Optional: set AUTODL_COMFYUI_WORKFLOW_ID to point at a different\n"
        "AutoDL-published ComfyUI workflow without changing the tool call."
    )
    agent_skills = ["autodl-comfyui", "ai-video-gen"]

    capabilities = ["text_to_video"]
    supports = {
        "text_to_video": True,
        "image_to_video": False,
        "native_audio": False,
        "seed": False,
        "workflow_id_override": True,
        "passthrough_body": True,
        "short_lived_result_urls": True,
    }
    best_for = [
        "AutoDL-hosted ComfyUI workflows (H3 text-to-video and similar)",
        "users who already have an AutoDL token and want zero local GPU setup",
        "calling AutoDL-published workflows whose IDs are not first-class OpenMontage tools",
    ]
    not_good_for = [
        "image-to-video (the default H3 t2v workflow does not accept a reference image)",
        "users without an AutoDL token bound to the workflow's permission group",
        "sub-second latency: this is an async submit + poll + download loop",
    ]
    fallback_tools = ["comfyui_video", "minimax_video", "kling_video", "veo_video"]

    input_schema = {
        "type": "object",
        "required": ["prompt"],
        "properties": {
            "prompt": {
                "type": "string",
                "description": (
                    "Text description of the desired video. Passed straight "
                    "into the workflow's body as the ``prompt`` field."
                ),
            },
            "workflow_id": {
                "type": "string",
                "default": DEFAULT_WORKFLOW_ID,
                "description": (
                    "AutoDL workflow ID. Defaults to the user's H3 t2v "
                    "flow (``minimax_h3_b99_001``); override per call or "
                    "via the AUTODL_COMFYUI_WORKFLOW_ID env var. The token's "
                    "permission group must include the workflow."
                ),
            },
            "duration": {
                "type": "integer",
                "minimum": 1,
                "maximum": 30,
                "default": 6,
                "description": (
                    "Video length in seconds. The default H3 t2v flow "
                    "accepts a small set of integer values (commonly 6 or 10); "
                    "pass the value the workflow's API spec documents."
                ),
            },
            "resolution": {
                "type": "string",
                "default": "736p横",
                "description": (
                    "Resolution token, passed through to the workflow as "
                    "``resolution``. AutoDL's H3 t2v workflow enforces an "
                    "enum check, so the value MUST match the workflow's "
                    "options list. The format is ``{size}p{orientation}`` "
                    "where orientation is ``横`` (landscape, 16:9) or "
                    "``竖`` (portrait, 9:16). The default ``736p横`` is "
                    "the workflow's 16:9 landscape option (1280×736), which "
                    "matches H3's native canvas (1 MP, 16:9). Other "
                    "common valid values: ``480p横``, ``720p横``, "
                    "``1080p横``, ``480p竖``, ``720p竖``, ``1080p竖``. "
                    "Check the workflow's drawer page in AutoDL for the "
                    "exact list."
                ),
            },
            "body": {
                "type": "object",
                "description": (
                    "Optional extra body fields. Merged into the submit "
                    "request body on top of ``prompt``/``duration``/"
                    "``resolution``; workflow-specific knobs (negative "
                    "prompt, camera, seed, etc.) live here so the tool "
                    "does not need per-workflow schema updates."
                ),
            },
            "output_path": {
                "type": "string",
                "description": "Where to save the downloaded video (mp4).",
            },
            "poll_interval_seconds": {
                "type": "number",
                "minimum": 1.0,
                "default": 4.0,
                "description": "Seconds between status polls while the task runs.",
            },
            "timeout_seconds": {
                "type": "integer",
                "minimum": 30,
                "default": 1200,
                "description": (
                    "Max wall-clock time to wait for the task to reach a "
                    "terminal state. H3 t2v at 1080p/6s is typically ~60-180s; "
                    "raise for long/high-res runs."
                ),
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
        backoff_seconds=3.0,
        retryable_errors=["network_error", "rate_limit"],
    )
    idempotency_key_fields = ["prompt", "workflow_id", "duration", "resolution", "body"]
    side_effects = [
        "calls AutoDL ComfyUI submit/poll/download API",
        "writes video file to output_path",
    ]
    user_visible_verification = [
        "Watch generated clip for motion coherence and prompt adherence",
    ]

    # ----- status & cost -----

    def get_status(self) -> ToolStatus:
        if not _token():
            return ToolStatus.UNAVAILABLE
        return ToolStatus.AVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        """Approximate USD cost for an H3 t2v task.

        AutoDL's pricing is per-task and varies by workflow; we use the
        same per-second rate ComfyUI Partner Node charges for the H3
        path as a reasonable starting estimate. The cost is recorded
        on the result and the user can override it by editing the
        tool's estimate_cost if their AutoDL account charges
        differently.
        """
        duration = float(inputs.get("duration", 6) or 6)
        resolution = str(inputs.get("resolution", "736p横") or "736p横")
        # 1080P typically bills at the higher rate; 736P/720P and below at the
        # lower one. Aligns with the rates the local comfyui_video H3
        # path quotes.
        rate = 0.1859 if "1080" in resolution or "2k" in resolution.lower() else 0.1287
        return round(rate * duration, 4)

    def estimate_runtime(self, inputs: dict[str, Any]) -> float:
        # Generous: 30s queue + 30s render per requested second, floor 60s.
        duration = int(inputs.get("duration", 6) or 6)
        return max(60.0, 30.0 + 30.0 * duration)

    # ----- execute -----

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        token = _token()
        if not token:
            return ToolResult(
                success=False,
                error=(
                    f"{TOKEN_ENV_VAR} not set. " + self.install_instructions
                ),
            )

        prompt = (inputs.get("prompt") or "").strip()
        if not prompt:
            return ToolResult(
                success=False,
                error="prompt is required and must be non-empty",
            )

        workflow_id = (
            (inputs.get("workflow_id") or "").strip()
            or os.environ.get(WORKFLOW_ID_ENV_VAR, "").strip()
            or DEFAULT_WORKFLOW_ID
        )
        duration = int(inputs.get("duration", 6) or 6)
        resolution = str(inputs.get("resolution", "736p横") or "736p横")
        extra_body = inputs.get("body") or {}
        if not isinstance(extra_body, dict):
            return ToolResult(
                success=False,
                error="body must be a JSON object of additional workflow parameters",
            )

        output_path = Path(
            inputs.get("output_path") or f"autodl_comfyui_video_{int(time.time())}.mp4"
        )
        poll_interval = float(inputs.get("poll_interval_seconds", 4.0) or 4.0)
        timeout = int(inputs.get("timeout_seconds", 1200) or 1200)

        # Body shape: prompt + duration + resolution are the universal
        # H3 t2v knobs shown in AutoDL's docs example; any workflow-
        # specific extras merge in via ``body``.
        body: dict[str, Any] = {
            "prompt": prompt,
            "duration": duration,
            "resolution": resolution,
        }
        for key, value in extra_body.items():
            body.setdefault(key, value)

        start = time.time()
        try:
            task_id = self._submit(workflow_id, body, token)
        except requests.RequestException as exc:
            return ToolResult(
                success=False,
                error=f"AutoDL ComfyUI submit failed (network): {exc}",
            )
        except AutoDLAPIError as exc:
            return ToolResult(
                success=False,
                error=f"AutoDL ComfyUI submit failed: {exc}",
                data={
                    "provider": "autodl",
                    "workflow_id": workflow_id,
                    "request_body": body,
                },
            )

        try:
            video_url = self._poll(
                task_id,
                token=token,
                poll_interval=poll_interval,
                timeout=timeout,
            )
        except AutoDLTimeoutError as exc:
            return ToolResult(
                success=False,
                error=(
                    f"AutoDL ComfyUI task {task_id} did not finish within "
                    f"{timeout}s. The task may still be running server-side; "
                    f"check task_id={task_id!r} via the AutoDL console."
                ),
                data={
                    "provider": "autodl",
                    "workflow_id": workflow_id,
                    "task_id": task_id,
                    "request_body": body,
                    "elapsed_seconds": round(time.time() - start, 2),
                },
            )
        except AutoDLAPIError as exc:
            return ToolResult(
                success=False,
                error=f"AutoDL ComfyUI task failed: {exc}",
                data={
                    "provider": "autodl",
                    "workflow_id": workflow_id,
                    "task_id": task_id,
                    "request_body": body,
                },
            )

        try:
            saved_path = self._download(video_url, output_path)
        except requests.RequestException as exc:
            return ToolResult(
                success=False,
                error=(
                    f"AutoDL returned the result URL but the download failed "
                    f"(result URLs are short-lived -- re-run the task): {exc}"
                ),
                data={
                    "provider": "autodl",
                    "workflow_id": workflow_id,
                    "task_id": task_id,
                    "result_url": video_url,
                },
            )

        return ToolResult(
            success=True,
            data={
                "provider": "autodl",
                "route": "autodl_comfyui",
                "model": f"comfyui:{workflow_id}",
                "workflow_id": workflow_id,
                "prompt": prompt,
                "operation": "text_to_video",
                "duration": duration,
                "resolution": resolution,
                "task_id": task_id,
                "result_url": video_url,
                "output": str(saved_path),
                "format": "mp4",
                "elapsed_seconds": round(time.time() - start, 2),
            },
            artifacts=[str(saved_path)],
            cost_usd=self.estimate_cost(inputs),
            duration_seconds=round(time.time() - start, 2),
            model=f"comfyui:{workflow_id}",
        )

    # ----- low-level API helpers -----

    def _submit(
        self, workflow_id: str, body: dict[str, Any], token: str
    ) -> str:
        """POST to the submit endpoint and return the task_id.

        Raises ``AutoDLAPIError`` for non-2xx responses whose JSON
        ``code`` is not ``"Success"``; raises ``requests.RequestException``
        for transport-level failures so the caller can distinguish
        "API rejected the request" from "could not reach AutoDL".
        """
        url = f"{_api_base()}/comfyui_workflow/{workflow_id}"
        headers = {
            "Authorization": token,
            "Content-Type": "application/json",
        }
        resp = requests.post(url, json=body, headers=headers, timeout=30)
        try:
            data = resp.json()
        except ValueError:
            resp.raise_for_status()
            raise AutoDLAPIError(
                f"AutoDL returned non-JSON body (status {resp.status_code}): "
                f"{resp.text[:200]!r}"
            )
        if resp.status_code >= 400 or data.get("code") != "Success":
            raise AutoDLAPIError(
                f"AutoDL submit rejected (status {resp.status_code}, "
                f"code={data.get('code')!r}): {data.get('msg') or data}"
            )
        task_id = (data.get("data") or {}).get("task_id")
        if not task_id:
            raise AutoDLAPIError(f"AutoDL submit returned no task_id: {data}")
        return task_id

    def _poll(
        self,
        task_id: str,
        *,
        token: str,
        poll_interval: float,
        timeout: int,
    ) -> str:
        """Block until *task_id* is SUCCESS, then return the first result URL.

        Statuses: ``QUEUED``, ``RUNNING`` (keep polling), ``SUCCESS``
        (return ``data.results[].url``), ``FAILED`` (raise).
        Raises ``AutoDLTimeoutError`` if the deadline is reached.
        """
        url = f"{_api_base()}/comfyui_workflow/result/{task_id}"
        headers = {"Authorization": token, "Content-Type": "application/json"}
        deadline = time.time() + timeout
        last_status: str | None = None
        while time.time() < deadline:
            resp = requests.get(url, headers=headers, timeout=30)
            try:
                data = resp.json()
            except ValueError:
                resp.raise_for_status()
                raise AutoDLAPIError(
                    f"AutoDL poll returned non-JSON body (status {resp.status_code}): "
                    f"{resp.text[:200]!r}"
                )
            if resp.status_code >= 400 or data.get("code") != "Success":
                raise AutoDLAPIError(
                    f"AutoDL poll rejected (status {resp.status_code}, "
                    f"code={data.get('code')!r}): {data.get('msg') or data}"
                )

            payload = data.get("data") or {}
            status = payload.get("status")
            last_status = status

            if status == "SUCCESS":
                results = payload.get("results") or []
                if not results:
                    raise AutoDLAPIError(
                        f"AutoDL task {task_id} succeeded but returned no results: "
                        f"{json.dumps(payload, ensure_ascii=False)[:300]}"
                    )
                first = results[0]
                if not isinstance(first, dict) or not first.get("url"):
                    raise AutoDLAPIError(
                        f"AutoDL task {task_id} result is missing 'url': {first!r}"
                    )
                return str(first["url"])

            if status == "FAILED":
                raise AutoDLAPIError(
                    f"AutoDL task {task_id} FAILED: {payload.get('message') or payload}"
                )

            # QUEUED / RUNNING: keep polling. Cap the sleep so a tiny
            # poll_interval the user supplied cannot burn the budget.
            time.sleep(max(1.0, min(poll_interval, 15.0)))

        raise AutoDLTimeoutError(
            f"AutoDL task {task_id} still {last_status!r} after {timeout}s"
        )

    @staticmethod
    def _download(url: str, dest: Path) -> Path:
        """Stream the result URL to *dest* and return the saved path.

        AutoDL's result URLs are short-lived; if the user's network
        is slow or the server has already revoked the URL, the
        caller should re-run the task. A non-2xx response surfaces
        as ``requests.HTTPError`` so the execute() wrapper can
        produce an actionable error.
        """
        with requests.get(url, stream=True, timeout=120) as resp:
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
        info["default_workflow_id"] = DEFAULT_WORKFLOW_ID
        info["token_env_var"] = TOKEN_ENV_VAR
        info["workflow_id_env_var"] = WORKFLOW_ID_ENV_VAR
        info["api_base_env_var"] = API_BASE_ENV_VAR
        info["execution_modes"] = {
            "autodl_hosted": {
                "hosted": True,
                "network_required": True,
                "billing": "AutoDL token (permission group must match workflow)",
            },
        }
        return info


class AutoDLAPIError(RuntimeError):
    """Raised when the AutoDL API returns a non-Success code or invalid payload."""


class AutoDLTimeoutError(RuntimeError):
    """Raised when an AutoDL task does not reach a terminal state in time."""
