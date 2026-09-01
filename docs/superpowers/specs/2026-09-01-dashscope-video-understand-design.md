# DashScope Qwen3-VL-Plus Video Understanding Design

## Goal

Add a DashScope-backed video-understanding provider for OpenMontage. The tool
uses `qwen3-vl-plus` to describe sampled video frames, answer visual
questions, and provide semantic quality assessments, without changing the
existing local `video_understand` tool.

## Scope

Create one provider tool named `dashscope_video_understand` in
`tools/analysis/`. It will be auto-discovered by the existing tool registry.
The tool accepts local images or videos through `input_path`, and exposes the
same primary modes as the current local tool: `describe`, `qa`, and `quality`.

The tool will reuse the stable local frame sampling behaviour from
`VideoUnderstand`: when callers provide a video, extract evenly spaced frames
with FFmpeg; when callers provide an image, analyze that single image. The
tool will encode the resulting frames to data URLs and submit them with a
mode-specific prompt to DashScope's multimodal-generation endpoint. This
avoids requiring a public URL or uploading source video to external storage.

The following are out of scope: a new selector tool, direct remote-video URL
input, changes to the local Transformers provider, production-pipeline changes,
and automatic provider fallback.

## Architecture

`DashscopeVideoUnderstand` is a concrete `BaseTool` with `provider` set to
`dashscope`, `capability` set to `analysis`, and API runtime metadata. It is
an independent provider rather than a provider switch added to
`VideoUnderstand`; each tool therefore has truthful dependencies, costs, and
availability in the registry.

The execution flow is:

1. Validate `DASHSCOPE_API_KEY`, source path, file type, requested mode, and
   the required `query` for `qa` mode.
2. Reuse `VideoUnderstand._load_frames()` to obtain RGB PIL frames. This
   preserves the repository's timestamp-based sampling behaviour.
3. Convert each frame to a bounded JPEG data URL and build a single native
   DashScope request containing all sampled frames plus the mode prompt.
4. POST to DashScope's multimodal-generation endpoint with Bearer auth and
   `model: qwen3-vl-plus`.
5. Parse the assistant text, produce a consistent result envelope, and redact
   the API key from any returned failure message.

## Public Interface

Required input:

- `input_path: str` — absolute or workspace-relative local image/video path.

Optional input:

- `mode: "describe" | "qa" | "quality"` — defaults to `describe`.
- `query: str` — required only for `qa`.
- `max_frames: int` — defaults to `5`, bounds the number of submitted frames.
- `frame_indices: list[int]` — optional explicit source frame indices.
- `model: "qwen3-vl-plus"` — defaults to and currently permits only this
  provider model.

Successful output contains `provider`, `model`, `mode`, `summary`,
`frame_count`, and `frames`. `frames` records the submitted sample indices;
`summary` is the model's direct response. The tool does not claim numeric
blur/brightness scores because those are produced only by the local metrics
implementation.

## Prompts and Quality Semantics

`describe` requests a chronological account of visual content, scene changes,
camera/framing, subjects, readable on-screen text, and notable events.
`qa` asks the caller's question against all frames and requires an evidence-led
answer that names relevant sampled frames.
`quality` requests only semantic visual defects visible in the samples:
blur, exposure, contrast, compression artifacts, framing, occlusion, and
continuity. It must distinguish no observed issue from a guarantee of quality.

Prompts ask the model not to infer unseen events and to state uncertainty when
sampling is insufficient. This makes the response suitable for review and
scene-planning use without pretending it is a frame-perfect audit.

## Error Handling and Security

Missing credentials produce the repository-standard setup guidance. Invalid
paths, unsupported extensions, empty frame extraction, invalid mode, and a
missing QA query fail before any network request. HTTP/API errors are returned
as `ToolResult(success=False)` and passed through a key-redaction helper.

No API key, raw Base64 media, or request authorization header is included in
results, artifacts, logs, or error text. The tool creates no persistent media
files.

## Testing

Contract tests will verify provider metadata, discovery, availability with and
without `DASHSCOPE_API_KEY`, and the DashScope skill reference. Unit tests will
mock the HTTP client and frame loader to verify native request shape, Base64
frame encoding, mode prompts, response parsing, validation failures, and API
key redaction. Existing `video_understand` sampling tests remain unchanged.

## Documentation

Update `docs/PROVIDERS.md` to list `dashscope_video_understand` as unlocked by
`DASHSCOPE_API_KEY`, identify it as the Qwen3-VL-Plus video description and
semantic QA path, and distinguish it from local metric-based quality checks.
