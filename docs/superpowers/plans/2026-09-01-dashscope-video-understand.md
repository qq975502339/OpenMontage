# DashScope Qwen3-VL-Plus Video Understanding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a DashScope `qwen3-vl-plus` video-understanding provider that analyzes locally sampled video frames without uploading the source video.

**Architecture:** A new `DashscopeVideoUnderstand` `BaseTool` reuses `VideoUnderstand._load_frames()` for local image/video sampling, encodes sampled PIL frames as JPEG data URLs, and submits one native DashScope multimodal request. It remains separate from the local Transformers tool, so registry metadata accurately describes provider, runtime, credentials, and fallback.

**Tech Stack:** Python 3, Pillow, FFmpeg/ffprobe via existing `VideoUnderstand`, `requests` lazy import, pytest, DashScope native multimodal-generation API.

## Global Constraints

- Do not create a git commit for code, tests, skills, or documentation in this plan.
- Preserve the user's existing modification to `schemas/artifacts/decision_log.schema.json`.
- Never persist or return `DASHSCOPE_API_KEY`, authorization headers, or Base64 frame data.
- The new provider accepts local image/video paths only and must not require public media URLs.
- Existing `video_understand` behavior and sampling tests must remain unchanged.

---

### Task 1: Add DashScope provider contract and request helpers

**Files:**
- Create: `tools/analysis/dashscope_video_understand.py`
- Test: `tests/tools/test_dashscope_video_understand.py`

**Interfaces:**
- Consumes: `VideoUnderstand._load_frames(input_path, is_video, frame_indices, max_frames)` and `VIDEO_EXTENSIONS` / `IMAGE_EXTENSIONS` from `tools.analysis.video_understand`.
- Produces: `DashscopeVideoUnderstand.execute(inputs: dict[str, Any]) -> ToolResult` registered by `ToolRegistry.discover()` as `dashscope_video_understand`.

- [ ] **Step 1: Write failing tests for the public contract and pure request helpers**

```python
from PIL import Image

from tools.analysis.dashscope_video_understand import DashscopeVideoUnderstand
from tools.base_tool import ExecutionMode, ToolRuntime, ToolStatus, ToolTier


def test_contract_identifies_qwen_video_understanding_provider():
    tool = DashscopeVideoUnderstand()
    assert tool.name == "dashscope_video_understand"
    assert tool.provider == "dashscope"
    assert tool.tier == ToolTier.ANALYZE
    assert tool.capability == "analysis"
    assert tool.runtime == ToolRuntime.API
    assert tool.execution_mode == ExecutionMode.SYNC
    assert tool.agent_skills == ["dashscope"]
    assert tool.input_schema["properties"]["model"]["default"] == "qwen3-vl-plus"


def test_status_requires_dashscope_key(monkeypatch):
    tool = DashscopeVideoUnderstand()
    monkeypatch.delenv("DASHSCOPE_API_KEY", raising=False)
    assert tool.get_status() == ToolStatus.UNAVAILABLE
    monkeypatch.setenv("DASHSCOPE_API_KEY", "fake-key")
    assert tool.get_status() == ToolStatus.AVAILABLE


def test_build_payload_sends_jpeg_data_urls_before_prompt():
    tool = DashscopeVideoUnderstand()
    image = Image.new("RGB", (4, 4), color="red")
    payload = tool._build_payload([image], mode="describe", query=None)

    content = payload["input"]["messages"][0]["content"]
    assert payload["model"] == "qwen3-vl-plus"
    assert content[0]["image"].startswith("data:image/jpeg;base64,")
    assert "Describe" in content[-1]["text"]
    assert payload["parameters"] == {"result_format": "message"}


def test_qa_prompt_includes_the_caller_question():
    tool = DashscopeVideoUnderstand()
    assert "Is the speaker visible?" in tool._prompt_for(
        mode="qa", query="Is the speaker visible?"
    )
```

- [ ] **Step 2: Run the tests and verify they fail because the module is absent**

Run: `pytest tests/tools/test_dashscope_video_understand.py -v`

Expected: collection fails with `ModuleNotFoundError: No module named 'tools.analysis.dashscope_video_understand'`.

- [ ] **Step 3: Implement the provider contract and helper methods**

```python
"""DashScope Qwen3-VL-Plus video and image understanding."""

from __future__ import annotations

import base64
import io
import os
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
        "Set DASHSCOPE_API_KEY to your Alibaba Cloud DashScope API key.\\n"
        "  Get one at https://dashscope.aliyun.com/"
    )
    fallback = "video_understand"
    fallback_tools = ["video_understand"]
    agent_skills = ["dashscope"]
    capabilities = ["video_description", "visual_qa", "semantic_quality_assessment"]
    supports = {"local_media": True, "video": True, "image": True, "offline": False}
    best_for = ["video descriptions", "cross-frame visual questions", "semantic video-quality review"]
    not_good_for = ["offline analysis", "numeric blur or exposure measurements"]
    input_schema = {
        "type": "object",
        "required": ["input_path"],
        "properties": {
            "input_path": {"type": "string", "description": "Local image or video path"},
            "mode": {"type": "string", "enum": ["describe", "qa", "quality"], "default": "describe"},
            "query": {"type": "string", "description": "Required visual question for qa mode"},
            "model": {"type": "string", "enum": ["qwen3-vl-plus"], "default": "qwen3-vl-plus"},
            "frame_indices": {"type": "array", "items": {"type": "integer"}},
            "max_frames": {"type": "integer", "default": 5, "minimum": 1, "maximum": 24},
        },
    }
    output_schema = {"type": "object", "properties": {"frames": {"type": "array"}, "summary": {"type": "string"}, "mode": {"type": "string"}, "model": {"type": "string"}}}
    resource_profile = ResourceProfile(cpu_cores=1, ram_mb=512, vram_mb=0, disk_mb=100, network_required=True)
    retry_policy = RetryPolicy(max_retries=2, retryable_errors=["rate_limit", "timeout"])
    idempotency_key_fields = ["input_path", "mode", "model", "query", "frame_indices", "max_frames"]
    side_effects = ["calls DashScope (Alibaba Cloud) Qwen3-VL-Plus API"]
    user_visible_verification = ["Compare the response with sampled video frames", "Treat semantic quality feedback as sampled evidence, not a frame-perfect guarantee"]
    ENDPOINT = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"

    def get_status(self) -> ToolStatus:
        return ToolStatus.AVAILABLE if os.environ.get("DASHSCOPE_API_KEY") else ToolStatus.UNAVAILABLE

    @staticmethod
    def _frame_to_data_url(frame: Any) -> str:
        buffer = io.BytesIO()
        frame.convert("RGB").save(buffer, format="JPEG", quality=85)
        return "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")

    @staticmethod
    def _prompt_for(*, mode: str, query: str | None) -> str:
        prompts = {
            "describe": "Describe the sampled video frames in chronological order. Cover subjects, actions, scene changes, camera/framing, readable on-screen text, and uncertainty. Do not claim events absent from the samples.",
            "quality": "Assess only visual-quality issues visible in these sampled frames: blur, exposure, contrast, compression artifacts, framing, occlusion, and continuity. State uncertainty and do not claim a full-video guarantee.",
        }
        if mode == "qa":
            return f"Answer this question using only the sampled frames: {query} Cite relevant frame numbers and state uncertainty."
        return prompts[mode]

    def _build_payload(self, frames: list[Any], *, mode: str, query: str | None) -> dict[str, Any]:
        content = [{"image": self._frame_to_data_url(frame)} for frame in frames]
        content.append({"text": self._prompt_for(mode=mode, query=query)})
        return {"model": "qwen3-vl-plus", "input": {"messages": [{"role": "user", "content": content}]}, "parameters": {"result_format": "message"}}

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        raise NotImplementedError
```

- [ ] **Step 4: Run the helper tests and verify they pass**

Run: `pytest tests/tools/test_dashscope_video_understand.py -v`

Expected: PASS for the four contract/helper tests.

- [ ] **Step 5: Do not commit**

Leave the new source and test files uncommitted, as required by the user.

### Task 2: Add execution, validation, result parsing, and failure coverage

**Files:**
- Modify: `tools/analysis/dashscope_video_understand.py`
- Modify: `tests/tools/test_dashscope_video_understand.py`

**Interfaces:**
- Consumes: `input_path`, `mode`, optional `query`, `max_frames`, `frame_indices`, and `DASHSCOPE_API_KEY`.
- Produces: `ToolResult.data` with `provider`, `model`, `mode`, `summary`, `frames`, and `frame_count`; failures use `ToolResult(success=False)`.

- [ ] **Step 1: Write failing tests for execution, validation, and redaction**

```python
from pathlib import Path


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


def test_execute_uses_one_request_and_returns_provider_summary(monkeypatch, tmp_path):
    import requests
    from PIL import Image

    monkeypatch.setenv("DASHSCOPE_API_KEY", "secret-key")
    clip = tmp_path / "clip.mp4"
    clip.write_bytes(b"video")
    tool = DashscopeVideoUnderstand()
    monkeypatch.setattr(tool, "_load_frames", lambda *args: [Image.new("RGB", (4, 4)), Image.new("RGB", (4, 4))])
    captured = {}
    monkeypatch.setattr(requests, "post", lambda url, **kwargs: (captured.update({"url": url, **kwargs}) or FakeResponse({"output": {"choices": [{"message": {"content": [{"text": "Two sampled frames show a presenter."}]}}]}})))

    result = tool.execute({"input_path": str(clip), "mode": "describe", "max_frames": 2})

    assert result.success is True
    assert result.data["provider"] == "dashscope"
    assert result.data["summary"] == "Two sampled frames show a presenter."
    assert result.data["frame_count"] == 2
    assert captured["url"] == tool.ENDPOINT
    assert captured["json"]["model"] == "qwen3-vl-plus"
    assert captured["headers"]["Authorization"] == "Bearer secret-key"


def test_execute_rejects_qa_without_query(monkeypatch, tmp_path):
    monkeypatch.setenv("DASHSCOPE_API_KEY", "fake-key")
    image = tmp_path / "shot.jpg"
    image.write_bytes(b"image")
    result = DashscopeVideoUnderstand().execute({"input_path": str(image), "mode": "qa"})
    assert result.success is False
    assert result.error == "Query is required for 'qa' mode."


def test_execute_redacts_key_from_api_failure(monkeypatch, tmp_path):
    import requests
    from PIL import Image

    monkeypatch.setenv("DASHSCOPE_API_KEY", "secret-key")
    image = tmp_path / "shot.jpg"
    image.write_bytes(b"image")
    tool = DashscopeVideoUnderstand()
    monkeypatch.setattr(tool, "_load_frames", lambda *args: [Image.new("RGB", (4, 4))])
    monkeypatch.setattr(requests, "post", lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("bad secret-key")))

    result = tool.execute({"input_path": str(image)})
    assert result.success is False
    assert "secret-key" not in result.error
    assert "[redacted]" in result.error
```

- [ ] **Step 2: Run the tests and verify they fail because `execute` is not implemented**

Run: `pytest tests/tools/test_dashscope_video_understand.py -v`

Expected: the new execution test fails with an abstract-method error or an assertion failure because `execute` does not yet return the required `ToolResult`.

- [ ] **Step 3: Implement minimal execution and response handling**

```python
    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0

    def estimate_runtime(self, inputs: dict[str, Any]) -> float:
        return float(inputs.get("max_frames", 5)) * 2.0

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        api_key = os.environ.get("DASHSCOPE_API_KEY")
        if not api_key:
            return ToolResult(success=False, error="DASHSCOPE_API_KEY not set. " + self.install_instructions)
        input_path = Path(inputs.get("input_path", ""))
        if not input_path.exists():
            return ToolResult(success=False, error=f"Input file not found: {input_path}")
        suffix = input_path.suffix.lower()
        is_video = suffix in VIDEO_EXTENSIONS
        if not is_video and suffix not in IMAGE_EXTENSIONS:
            return ToolResult(success=False, error=f"Unsupported file type: {suffix}. Supported: {sorted(VIDEO_EXTENSIONS | IMAGE_EXTENSIONS)}")
        mode = inputs.get("mode", "describe")
        if mode not in {"describe", "qa", "quality"}:
            return ToolResult(success=False, error=f"Unknown mode: {mode}")
        query = inputs.get("query")
        if mode == "qa" and not query:
            return ToolResult(success=False, error="Query is required for 'qa' mode.")
        try:
            frames = self._load_frames(input_path, is_video, inputs.get("frame_indices"), int(inputs.get("max_frames", 5)))
            if not frames:
                return ToolResult(success=False, error="No frames could be extracted.")
            import requests
            response = requests.post(self.ENDPOINT, headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, json=self._build_payload(frames, mode=mode, query=query), timeout=180)
            response.raise_for_status()
            summary = self._extract_text(response.json())
            if not summary:
                return ToolResult(success=False, error="DashScope returned no analysis text")
        except Exception as exc:
            return ToolResult(success=False, error=f"DashScope video understanding failed: {self._safe_error(exc)}")
        return ToolResult(success=True, data={"provider": "dashscope", "model": "qwen3-vl-plus", "mode": mode, "summary": summary, "frames": [{"frame_index": index} for index in range(len(frames))], "frame_count": len(frames)}, model="qwen3-vl-plus")

    @staticmethod
    def _extract_text(data: dict[str, Any]) -> str:
        contents = data.get("output", {}).get("choices", [{}])[0].get("message", {}).get("content", [])
        return "\\n".join(item["text"] for item in contents if item.get("text")).strip()

    @staticmethod
    def _safe_error(exc: Exception) -> str:
        return str(exc).replace(os.environ.get("DASHSCOPE_API_KEY", ""), "[redacted]")
```

- [ ] **Step 4: Run the focused test suite and preserve the legacy suite**

Run: `pytest tests/tools/test_dashscope_video_understand.py tests/tools/test_video_understand_sampling.py -v`

Expected: PASS; the new provider tests pass and existing FFmpeg sampling regression tests remain green.

- [ ] **Step 5: Do not commit**

Leave all modified code and tests uncommitted, as required by the user.

### Task 3: Register the provider contract knowledge and documentation

**Files:**
- Modify: `tests/contracts/test_dashscope_tools.py`
- Modify: `.agents/skills/dashscope/SKILL.md`
- Modify: `docs/PROVIDERS.md`

**Interfaces:**
- Consumes: `DashscopeVideoUnderstand` and existing DashScope tool catalog.
- Produces: registry contract coverage, Layer 3 provider instructions, and setup documentation for `dashscope_video_understand`.

- [ ] **Step 1: Write failing registry-discovery coverage**

```python
from tools.analysis.dashscope_video_understand import DashscopeVideoUnderstand


def test_all_four_tools_discoverable():
    from tools.tool_registry import ToolRegistry

    registry = ToolRegistry()
    registry.discover()
    names = {tool.name for tool in registry._tools.values() if tool.provider == "dashscope"}
    assert names == {
        "dashscope_image",
        "dashscope_tts",
        "dashscope_asr",
        "dashscope_video_understand",
    }
```

Extend `TOOLS`, `EXPECTED_TIER`, `EXPECTED_CAPABILITY`, and `EXPECTED_EXECUTION_MODE` so the existing parametrized contract assertions include `DashscopeVideoUnderstand`; add `DashscopeVideoUnderstand` handling to the minimal-input branches of `test_estimate_cost_returns_float` and `test_dry_run_returns_dict`.

- [ ] **Step 2: Run the contract test and verify discovery fails**

Run: `pytest tests/contracts/test_dashscope_tools.py::TestDashscopeRegistryDiscovery -v`

Expected: FAIL because the prior expected tool set contains only three DashScope tools.

- [ ] **Step 3: Update provider skill and user documentation**

Add this section to `.agents/skills/dashscope/SKILL.md` after ASR:

```markdown
### Video Understanding

`dashscope_video_understand` sends locally sampled image/video frames as JPEG
Base64 data URLs to `qwen3-vl-plus` through DashScope's native
multimodal-generation endpoint. It supports `describe`, `qa`, and semantic
`quality` modes. It does not upload the original local video and does not
replace numeric local blur, brightness, or contrast checks.
```

Update the DashScope section of `docs/PROVIDERS.md` as follows:

```markdown
### Alibaba DashScope — Qwen Image + TTS + ASR + Video Understanding

**Tools unlocked:** `dashscope_image`, `dashscope_tts`, `dashscope_asr`,
`dashscope_video_understand`

- Qwen3-VL-Plus video description, cross-frame visual QA, and sampled semantic
  quality review from local media; no public source-video URL is required.
```

- [ ] **Step 4: Run the complete DashScope and video-understanding verification set**

Run: `pytest tests/contracts/test_dashscope_tools.py tests/tools/test_dashscope_video_understand.py tests/tools/test_video_understand_sampling.py -v`

Expected: PASS with `dashscope_video_understand` discovered as an available provider when `DASHSCOPE_API_KEY` is configured and unavailable otherwise.

- [ ] **Step 5: Check the final diff and do not commit**

Run: `git diff --check; git status --short`

Expected: no whitespace errors; code, tests, skills, and docs remain uncommitted; `schemas/artifacts/decision_log.schema.json` remains modified but untouched.
