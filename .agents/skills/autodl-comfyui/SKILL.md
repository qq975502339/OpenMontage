---
name: autodl-comfyui
description: Use when calling AutoDL's hosted ComfyUI workflows (e.g. the H3 text-to-video flow `minimax_h3_b99_001`) through the `autodl_comfyui_video` tool. Covers submit + poll + download protocol, token/permission-group setup, workflow-ID override, body passthrough, and short-lived result URLs.
---

# AutoDL ComfyUI

AutoDL exposes a curated catalogue of ComfyUI workflows behind a thin REST
wrapper. The `autodl_comfyui_video` tool talks to that wrapper so the user
can drive a hosted workflow (H3 text-to-video and similar) without running
ComfyUI locally or buying ComfyUI Partner Node credits. It is not a
substitute for the local `comfyui_video` tool: that one talks to a
self-hosted ComfyUI server; this one talks to AutoDL's hosted GPU pool.

Read this before calling `autodl_comfyui_video`. After this, the
tool's `input_schema` and the upstream docs at
https://autodl.art/docs/comfyui_api/ are the source of truth.

## Token and permission group

1. Create a token at https://autodl.art/large-model/tokens.
2. Pick the permission group that matches the target workflow. The
   default H3 text-to-video flow needs a token whose group covers
   `H3` (or the equivalent AutoDL label for that workflow family).
3. Set `AUTODL_COMFYUI_TOKEN` in `.env`. The tool treats a leading
   `#` placeholder as "not set" so a half-configured .env is safe.
4. The tool's `get_status()` returns `AVAILABLE` only when a token is
   present; selectors and preflight read this and downgrade the tool
   to `UNAVAILABLE` otherwise.

A token whose group does not cover the workflow returns 401/403 from
the submit endpoint -- surface the raw `msg` so the user can fix the
group on the AutoDL console.

## Workflow selection

| Knob | Where it comes from | Notes |
|---|---|---|
| Default workflow | `DEFAULT_WORKFLOW_ID` constant (`minimax_h3_b99_001`) | The user's H3 t2v flow. |
| Per-call override | `inputs["workflow_id"]` | Useful for A/B'ing H3 variants or trying a sibling flow. |
| Per-install default | `AUTODL_COMFYUI_WORKFLOW_ID` env var | Tool-call stays clean; flip the env var to redirect. |
| API host (sandbox) | `AUTODL_COMFYUI_BASE_URL` env var | Defaults to `https://autodl.art/api/v1/comfyui`; do not change unless you mirror the public surface for testing. |

The tool is intentionally generic over the workflow ID -- it passes
`prompt`, `duration`, `resolution`, and any caller-supplied `body`
straight to the workflow's own request schema. The `body` field is
the escape hatch for workflow-specific knobs (negative prompt, camera
move, seed if the workflow exposes one) so the tool does not need
per-workflow schema updates.

## Submit + poll + download protocol

1. **Submit** -- `POST {api_base}/comfyui_workflow/{workflow_id}` with
   `Authorization: <token>` and a JSON body. Returns a `task_id`.
2. **Poll** -- `GET {api_base}/comfyui_workflow/result/{task_id}`.
   Status is one of `QUEUED` / `RUNNING` / `SUCCESS` / `FAILED`. Keep
   polling while `QUEUED`/`RUNNING`; raise on `FAILED`; on `SUCCESS`
   read `data.results[0].url` for the artifact.
3. **Download** -- `GET {result_url}` to a local `output_path`.
   **The result URL is short-lived** (per AutoDL's docs); a slow
   network or a revoked URL is the common failure mode here. If the
   download fails, re-run the task -- there is no resume.

Timeouts:

- `timeout_seconds` defaults to 1200s. H3 t2v at 1080p/6s is
  typically 60-180s; raise for long/high-res runs.
- `poll_interval_seconds` defaults to 4s and is clamped to 1-15s so
  a tiny user value cannot burn the budget.

## Body shape

The tool always sends `prompt`, `duration`, `resolution` for H3 t2v
flows (the canonical fields AutoDL's docs example uses). If the
caller supplies a `body` dict, it merges on top of those defaults
via `setdefault`, so the canonical fields win and the caller's
extras flow through untouched. Example:

```python
tool.execute({
    "prompt": "A cat walking on clouds, cinematic",
    "duration": 6,
    "resolution": "736p横",  # 1280×736, 16:9 landscape, H3 native
    "body": {
        "negative_prompt": "blurry, watermark",
        "seed": 42,
    },
    "output_path": "projects/foo/assets/video/clip_001.mp4",
})
```

`negative_prompt` and `seed` are workflow-specific; include them
only if the workflow's API spec documents them.

## Resolution: 横 vs 竖 (mandatory enum)

The `resolution` field is **strictly enum-checked** by the workflow.
Free-form strings like `"1080p"` or `"1920x1080"` get rejected with
`code='RequestParameterIsWrong'` and the API lists the accepted
options. For the H3 t2v flow the format is:

```
{size}p{orientation}
```

where `orientation` is one of:

| Token | Meaning | Aspect |
|---|---|---|
| `横` (landscape) | 16:9 | Your project default for a 16:9 doc |
| `竖` (portrait) | 9:16 | Shorts / vertical |

Common valid values (verify against the workflow's drawer page):

- Landscape (横): `480p横`, `720p横`, **`736p横`** *(1280×736, H3 native)*, `1080p横`, `2K横`
- Portrait (竖): `480p竖`, `720p竖`, `736p竖`, `1080p竖`, `2K竖`

The tool's default is **`736p横` (1280×736)** — this is the workflow's
native 16:9 landscape option (1 MP, matches H3's 1344×768 native canvas
scaled to 16:9). It is cheaper than `1080p横` and avoids the up/down
scaling artifacts you'd get from rendering a non-native size. Switch
to `1080p横` only for a final master that must survive full-screen
playback; stay on `736p横` for everything else. Switch to `竖` only
for portrait deliverables. Anything outside the workflow's `options`
list will spend a submission attempt.

The official AutoDL docs example uses `"480p竖"` (portrait 480p);
that's the only form AutoDL documents publicly. The `横` variants
were confirmed by running real `minimax_h3_b99_001` tasks — the
`竖` and `横` options are part of the workflow's enum, not separate
workflows.

## Cost and runtime estimates

- **Cost**: AutoDL charges per task. The tool's `estimate_cost()`
  uses the same per-second rate as the local `comfyui_video` H3
  Partner-Node path as a reasonable starting point
  ($0.1287/s at 720p-or-below, $0.1859/s at 1080p/2K). Override
  `estimate_cost()` if your AutoDL account bills differently --
  the recorded `cost_usd` is what shows up in the project's cost
  log.
- **Runtime**: queue (30s) + render (30s per requested second),
  floor 60s. H3 t2v at 1080p/6s typically finishes well under
  the floor.

## Failure modes and recovery

| Symptom | Likely cause | Recovery |
|---|---|---|
| `get_status() == UNAVAILABLE` | Token missing or commented in `.env` | Set `AUTODL_COMFYUI_TOKEN`; restart the agent. |
| Submit returns 401/403 | Token's permission group does not cover the workflow | Pick the right group on the AutoDL token page. |
| `AutoDLAPIError` on submit | Bad workflow ID, or workflow is offline | Re-check `workflow_id`; try a sibling flow to confirm the token. |
| `AutoDLTimeoutError` on poll | Task queueing took longer than `timeout_seconds` | The task may still be running server-side; check `task_id` on the AutoDL console. Re-poll directly or re-submit. |
| `requests.RequestException` on download | Result URL expired (short-lived) | Re-run the task. There is no resume for the download step. |

The tool never silently retries a `FAILED` task and never fabricates
a `task_id` for resume -- the AutoDL console is the source of truth
when a task is still running after the local timeout.

## When NOT to use this tool

- **Need image-to-video or reference-to-video.** The default H3 t2v
  flow does not accept a reference image; the tool is honest about
  this by setting `image_to_video: False` in `supports`. Use a
  different tool (`comfyui_video` with a community I2V workflow,
  `kling_official_video`, `veo_video`, etc.) instead.
- **Have ComfyUI Partner Node credits.** The local `comfyui_video`'s
  `model_family="minimax_h3_api"` Partner Node path is the
  ComfyUI-blessed way to call H3. The AutoDL path is a parallel
  option, not a replacement.
- **Need a workflow this tool does not know about.** Drop the
  `workflow_id` into the `body` field? No -- pick the right
  `workflow_id` input instead. The tool's whole point is routing
  through AutoDL's official API.
