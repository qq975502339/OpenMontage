# 04 · 增强层：图用 qwen-image-3.0-pro（Token Plan）/ 视频用 H3 15s

**本项目固定模型（用户 2026-11 指定，覆盖原 Renoise 方案）**：

| 资产 | 模型 / 接口 | 单价 | 用在 |
|---|---|---|---|
| 配图 | `qwen-image-3.0-pro`（千问AI平台 Token Plan，DashScope 兼容端点） | **0（走 Token Plan 额度）** | 写实场景、主视觉底图、示意底图 |
| 动态镜头 | AutoDL 托管 ComfyUI 工作流 `minimax_h3_image_audio_to_video_v2_15s` | **0.05 元 / 秒**（15 秒 = 0.75 元） | 需要真实运动的镜头，首帧用已确认的配图 |
| 配乐 | 技能自带 `vibe-bgm`（`tools/fit_bgm.py` 裁切） | 0 | 全片铺底（`bgm_force` 强制） |
| 音效 | earshot 代码音效（references/10-earshot.md）；要真人质感的少量音效用 ElevenLabs | 0 / 按量 | 转折、揭晓、页面切换 |

Renoise MCP（`estimate_cost / create_tasks / wait_tasks / download_results`）**不再是默认路径**；只有当用户明确要求用 Renoise 时才走旧方案。

**花钱的硬规矩**：把整期的 assets.json 列成一张表（镜头、模型、提示词、张数 / 秒数、合计金额）发给用户，**等用户在对话里明确说可以**才提交生成。宿主的工具授权弹窗不算确认；之前说过「直接生成」也不算。改了任何提示词、模型、数量就要重新报价确认。

## 出图：qwen-image-3.0-pro

1. 读 `.env` 的 `QIANWEN_API_KEY`（千问AI平台 Token Plan；缺了就退回 `DASHSCOPE_API_KEY`，都没有就让用户补，不要换模型）。端点默认 `https://maas.qianwenaiapi.com/api/v1`，可用 `QIANWEN_BASE_URL` 覆盖。
2. 一次一张：`prompt` + `size`。16:9 用 `1664*928`（**星号分隔，不是 `x`**）；竖屏用 `928*1664`；需要方图或自定义尺寸时按 DashScope 支持的 `W*H` 取最接近的比例，成片里再 crop。
3. `prompt_extend` 默认 `true`（平台会改写提示词、出图更好看）；要严格照提示词出图（精确构图、器物结构）时显式设 `false`。
4. `watermark` 设 `false`。
5. 下载到 `lessons/NN/assets/img/<id>.jpg`，`assets.json` 的 `status` 改 `done`，记下费用。

### 配图提示词写法（英文，短句视觉描述）

`[style_prefix], [主体], [环境], [光线], [构图：wide shot / low angle / negative space on the right for text], no text, no letters, no watermark`

- 给关键词留位置：写明 `negative space on the left/right/top`。
- 16:9；人物不写具体面部，写剪影 / 背影 / 远景，减少「像某个真人」的风险。
- 地图 / 示意同样只让模型画底，地名与数字一律由代码叠加（spread / keyword）。

## 出视频：H3 15s 工作流

1. **先写提示词，且必须用项目技能**：每次写、改、重写视频提示词前，先读 `.agents/skills/h3-prompt-writing/SKILL.md`，判定输入模式（T2VA / I2VA / FL2VA / L2VA / Ref2VA），再按其引用的 `references/base-en.txt`（文本 / 关键帧）或 `references/ref-en.txt`（图像 + 音频参考）写。
   - 基础模式字段顺序：`integrated_multimodal_description` → `overall_soundscape` → `non_diegetic_music`。
   - 全参考模式（带图 + 带音频）：`subject_definitions` → `summary` → `retention_analysis` → `detailed_description` → `overall_soundscape` → `non_diegetic_music`。
   - 提示词里写的总时长必须等于请求的 `duration`（4–15 秒）。
2. 调用 `autodl_comfyui_video`：`workflow_id` 显式写 `minimax_h3_image_audio_to_video_v2_15s`，`duration` **必须显式传**（5–15 的整数，省略时工作流会按 5 秒出片；实测 15 秒 ≈ 8–9 分钟、24fps 362 帧、1344×768），`resolution` 用工作流页面列出的枚举（16:9 横屏如 `768p横`；接口报 `RequestParameterIsWrong` 时按返回的 options 选）。参考素材走 `body` 的 `ref_image_0` / `ref_audio_0` 等字段传入 **远端可访问的 URL**（本机文件路径远端读不到）。
3. 首帧一律用已经确认的 qwen 配图（图生视频），保证动静一致；没有合适配图就先出图、挑图，再生成视频。
4. 下载到 `lessons/NN/assets/clips/<id>.mp4` → `python3 tools/clip2frames.py assets/clips/<id>.mp4 assets/clips/<id> --fps 24`（H3 原生 24fps，按 24 抽帧最省事也最准；自动裁掉画幅边）→ 打印帧数 n → `film.js` 里 `vclip(s, { dir: A("clips/<id>"), n, fps: 24 })`。镜头时长比片子短时用 `rate ≈ 视频秒数 / 镜头秒数` 拉伸，别让末尾冻帧。
5. 视频自带音轨：要当环境声就加一条 music：`{ src: P("clips/<id>/audio.wav"), at, dur, gain: -20 }`；不要就 `audio: "mute"`。
6. 首帧视频不一定照提示词演（会自作主张加人或改动作）：先播一遍、抽帧看，再决定用不用；不满意只重做那一条。

## 分镜与预算

- 只把代码做不好的镜头交给生成模型（写实现场、真实材质、最需要被记住的 1–3 个时刻、真实运动），其余照样代码画。
- 一期典型量：图 6–12 张（1.1–2.2 元）+ 视频 2–4 条 15 秒（1.5–3 元），整期通常 3–6 元。
- 生成画面一律角标「AI 示意图 / AI 生成画面」（plate、vclip 默认带）；配图与视频不进片尾署名以外的素材声明。

## 安全

- 不生成在世真人的脸、不模仿品牌 logo；历史人物写「人物造型为示意」。
- 不把用户的私人素材传给外部服务，除非用户明确要用。
