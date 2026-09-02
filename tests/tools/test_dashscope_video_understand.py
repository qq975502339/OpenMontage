"""Tests for the DashScope Qwen3-VL-Flash video-understanding provider."""

from PIL import Image

from tools.analysis.dashscope_video_understand import DashscopeVideoUnderstand
from tools.base_tool import ExecutionMode, ToolRuntime, ToolStatus, ToolTier


class FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


def test_contract_identifies_qwen_video_understanding_provider():
    tool = DashscopeVideoUnderstand()

    assert tool.name == "dashscope_video_understand"
    assert tool.provider == "dashscope"
    assert tool.tier == ToolTier.ANALYZE
    assert tool.capability == "analysis"
    assert tool.runtime == ToolRuntime.API
    assert tool.execution_mode == ExecutionMode.SYNC
    assert tool.agent_skills == ["dashscope"]
    assert tool.input_schema["properties"]["model"]["default"] == "qwen3-vl-flash"


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
    assert payload["model"] == "qwen3-vl-flash"
    assert content[0]["image"].startswith("data:image/jpeg;base64,")
    assert "Describe" in content[-1]["text"]
    assert payload["parameters"] == {"result_format": "message"}


def test_qa_prompt_includes_the_caller_question():
    tool = DashscopeVideoUnderstand()

    assert "Is the speaker visible?" in tool._prompt_for(
        mode="qa", query="Is the speaker visible?"
    )


def test_execute_uses_one_request_and_returns_provider_summary(monkeypatch, tmp_path):
    import requests

    monkeypatch.setenv("DASHSCOPE_API_KEY", "secret-key")
    clip = tmp_path / "clip.mp4"
    clip.write_bytes(b"video")
    tool = DashscopeVideoUnderstand()
    frames = [Image.new("RGB", (4, 4)), Image.new("RGB", (4, 4))]
    monkeypatch.setattr(tool, "_load_frames", lambda *args: frames, raising=False)
    captured = {}

    def fake_post(url, **kwargs):
        captured["url"] = url
        captured.update(kwargs)
        return FakeResponse({
            "output": {
                "choices": [{
                    "message": {
                        "content": [
                            {"text": "Two sampled frames show a presenter."}
                        ]
                    }
                }]
            }
        })

    monkeypatch.setattr(requests, "post", fake_post)

    result = tool.execute({
        "input_path": str(clip),
        "mode": "describe",
        "max_frames": 2,
    })

    assert result.success is True
    assert result.data["provider"] == "dashscope"
    assert result.data["summary"] == "Two sampled frames show a presenter."
    assert result.data["frame_count"] == 2
    assert captured["url"] == tool.ENDPOINT
    assert captured["json"]["model"] == "qwen3-vl-flash"
    assert captured["headers"]["Authorization"] == "Bearer secret-key"


def test_execute_rejects_qa_without_query(monkeypatch, tmp_path):
    monkeypatch.setenv("DASHSCOPE_API_KEY", "fake-key")
    image = tmp_path / "shot.jpg"
    image.write_bytes(b"image")

    result = DashscopeVideoUnderstand().execute({
        "input_path": str(image),
        "mode": "qa",
    })

    assert result.success is False
    assert result.error == "Query is required for 'qa' mode."


def test_execute_redacts_key_from_api_failure(monkeypatch, tmp_path):
    import requests

    monkeypatch.setenv("DASHSCOPE_API_KEY", "secret-key")
    image = tmp_path / "shot.jpg"
    image.write_bytes(b"image")
    tool = DashscopeVideoUnderstand()
    monkeypatch.setattr(
        tool,
        "_load_frames",
        lambda *args: [Image.new("RGB", (4, 4))],
        raising=False,
    )

    def failing_post(*args, **kwargs):
        raise RuntimeError("bad secret-key")

    monkeypatch.setattr(requests, "post", failing_post)

    result = tool.execute({"input_path": str(image)})

    assert result.success is False
    assert "secret-key" not in result.error
    assert "[redacted]" in result.error
