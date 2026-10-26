# 日本经济黑板视频制作计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 制作一支约 2 分钟、16:9、1080p 的中文“日本经济四个矛盾”黑板讲解视频，使用用户提供的黑板图、约 40% 的 Pexels/Pixabay 真实视频、逐笔粉笔字、同步旁白字幕，并通过 hybrid 管线交付 MP4。

**Architecture:** 以用户黑板图裁切后的黑板纹理作为全片底层画布；Remotion 负责黑板层、逐笔文字、粉笔图形、黑板内实拍窗口、字幕和时间轴；FFmpeg 负责音频混合、编码与最终媒体校验。所有中间产物写入 `projects/japan-economy-four-contradictions/`，按 OpenMontage 的阶段工件契约推进。

**Tech Stack:** OpenMontage `hybrid` pipeline, Remotion, FFmpeg, Pexels/Pixabay video tools, DashScope or MiniMax TTS, subtitle generator, local frame sampling and ffprobe validation.

## Global Constraints

- 成片约 2 分钟，16:9，1080p。
- 全片保持黑板主视觉，不出现主持人、头像或黑板之外的装饰背景。
- 用户提供的黑板图作为底层视觉；白墙区域裁掉或缩放裁切。
- Pexels/Pixabay 真实视频目标约 48 秒，占总时长约 40%，且嵌入黑板内粉笔框/窗口。
- 粉笔字必须是中文粉笔风格，并使用逐笔书写，不使用简单淡入。
- 旁白不写在黑板上；底部字幕独立显示，并与旁白逐句同步。
- 脚本区分已公布数据和预测数据，数字包含年份或季度并使用“约”表述。
- Remotion 是锁定的合成运行时；HyperFrames 当前不可用。
- 每个生产阶段先读取对应 `skills/pipelines/hybrid/<stage>-director.md`，再执行该阶段。
- 资产生成前必须读取工具的 Layer 2 技能和 registry 返回的 Layer 3 技能。

---

### Task 1: 初始化项目和研究工件

**Files:**
- Create: `projects/japan-economy-four-contradictions/project.json`
- Create: `projects/japan-economy-four-contradictions/artifacts/research_brief.json`
- Create: `projects/japan-economy-four-contradictions/checkpoint_research.json`
- Read: `pipeline_defs/hybrid.yaml`
- Read: `skills/pipelines/hybrid/executive-producer.md`

**Interfaces:**
- Consumes: 已批准设计规格、参考视频分析、IMF/日本央行/日本内阁府研究结果。
- Produces: 项目目录、研究简报、pipeline checkpoint，供 idea/script 阶段使用。

- [ ] **Step 1: 初始化项目目录**

运行项目初始化工具，项目 ID 固定为 `japan-economy-four-contradictions`，pipeline 固定为 `hybrid`，标题固定为“日本经济的四个矛盾”。

- [ ] **Step 2: 写入研究简报**

记录以下事实边界：IMF 2026 年实际 GDP 增长预测约 0.6%–0.8%；日本央行判断经济温和增长、通胀逐步靠近 2% 目标；日本内阁府 2026 年第二季度实际 GDP 同比约 0.9%；劳动力短缺、实际工资压力、半导体/AI 投资和人口结构作为解释线索。每项记录来源 URL、数据类型（actual/forecast）和可用于旁白的谨慎表述。

- [ ] **Step 3: 运行研究阶段自检**

确认研究工件包含主题、受众、时长、数据来源、参考视频风格摘要、事实边界和四个矛盾，不包含未经来源支持的精确数字。

---

### Task 2: 编写旁白脚本并生成脚本工件

**Files:**
- Create: `projects/japan-economy-four-contradictions/artifacts/brief.json`
- Create: `projects/japan-economy-four-contradictions/artifacts/script.json`
- Create: `projects/japan-economy-four-contradictions/narration/script.txt`
- Create: `projects/japan-economy-four-contradictions/checkpoint_idea.json`
- Create: `projects/japan-economy-four-contradictions/checkpoint_script.json`
- Read: `skills/pipelines/hybrid/idea-director.md`
- Read: `skills/pipelines/hybrid/script-director.md`

**Interfaces:**
- Consumes: `research_brief.json` 与已批准设计规格。
- Produces: 约 520–600 字中文单人旁白，分为 hook、总览、四个矛盾、结论七段，后续 TTS 和字幕均以此为唯一文本源。

- [ ] **Step 1: 写入 brief**

明确 anchor medium 为黑板图解，support medium 为黑板内 Pexels/Pixabay 实拍窗口；记录 2 分钟、16:9、Remotion、单一中文女声和约 40% 实拍比例。

- [ ] **Step 2: 编写脚本**

脚本必须按以下顺序组织：

```text
开场问题 → 三个总览数据 → 低速增长 → 工资/物价 → 弱日元/出口进口 → AI芯片/人口 → 结论
```

每段包含 `narration`、`on_board_keywords`、`subtitle_sentences`、`fact_labels`，并明确旁白全文不作为黑板文字层输出。

- [ ] **Step 3: 脚本自检**

检查脚本字数在 520–600 中文字符范围；每个事实数字包含年份/季度或“预测”标签；每句字幕可独立对应旁白；没有把“预测”写成“已经发生”。

---

### Task 3: 设计黑板分镜和素材清单

**Files:**
- Create: `projects/japan-economy-four-contradictions/artifacts/scene_plan.json`
- Create: `projects/japan-economy-four-contradictions/artifacts/asset_manifest.json`
- Create: `projects/japan-economy-four-contradictions/checkpoint_scene_plan.json`
- Read: `skills/pipelines/hybrid/scene-director.md`
- Read: `skills/pipelines/hybrid/asset-director.md`

**Interfaces:**
- Consumes: `script.json`。
- Produces: 7 个主场景的时间表、黑板绘制顺序、实拍素材需求、字幕区域规则和资产来源记录。

- [ ] **Step 1: 定义场景时间**

以实际旁白时间为准，初始目标为 0:00–0:08、0:08–0:28、0:28–0:50、0:50–1:12、1:12–1:34、1:34–1:52、1:52–2:00；允许因 TTS 实际时长在 ±2 秒内调整，但总时长保持约 120 秒。

- [ ] **Step 2: 定义黑板层**

每场景列出背景、粉笔标题、数据、箭头、图标、实拍窗口、字幕安全区和清除/降亮度规则。粉笔文字颜色固定为白、黄、青、红四类。

- [ ] **Step 3: 定义实拍素材**

至少列出东京街景/通勤、办公/消费、超市/食品、港口/汽车/货运、半导体/自动化工厂五类素材；每个素材记录平台、搜索词、下载 URL、许可证信息、文件路径、使用时码和是否嵌入黑板窗口。

- [ ] **Step 4: 运行场景计划自检**

确认每场景都有 source/support treatment；实拍目标累计约 48 秒；没有任何依赖未声明生成资产的镜头。

---

### Task 4: 生成并审核旁白、字幕与真实视频素材

**Files:**
- Create: `projects/japan-economy-four-contradictions/assets/audio/narration.wav`
- Create: `projects/japan-economy-four-contradictions/assets/subtitles.srt`
- Create: `projects/japan-economy-four-contradictions/assets/video/*.mp4`
- Create: `projects/japan-economy-four-contradictions/assets/provenance.json`
- Create: `projects/japan-economy-four-contradictions/artifacts/asset_manifest.json`
- Create: `projects/japan-economy-four-contradictions/checkpoint_assets.json`
- Read: `skills/pipelines/hybrid/asset-director.md`
- Read: relevant Layer 2 and Layer 3 skills for TTS, Pexels/Pixabay video, subtitles, FFmpeg audio.

**Interfaces:**
- Consumes: `script.json`, `scene_plan.json`, `narration/script.txt`。
- Produces: 可播放旁白、逐句字幕、已下载的真实视频片段、来源清单和资产工件。

- [ ] **Step 1: 在生成前登记 provider/model 决策**

记录 TTS provider、voice、model、素材平台和每次调用是否为 sample；TTS 默认优先 DashScope，若实际音质不达标，先暂停并征得用户同意后再切换 MiniMax。

- [ ] **Step 2: 生成旁白**

使用 `narration/script.txt` 生成单一中文女声；检查音频长度、响度、停顿和发音，避免数字、百分比、GDP、AI 等术语误读。

- [ ] **Step 3: 检索并冻结素材**

通过 Pexels/Pixabay 工具按场景搜索真实素材，下载 5 类素材并裁切为可用片段；冻结文件路径和来源，不在后续阶段直接替换文件。

- [ ] **Step 4: 生成字幕**

根据旁白时轴生成 SRT；逐句核对旁白文本与字幕文本，字幕只放底部独立字幕层，不写入黑板内容。

- [ ] **Step 5: 资产审核门**

逐个检查旁白、字幕和素材；如果音色、素材质量或授权信息不合格，记录具体问题并停在 assets checkpoint，不自动更换 provider 或素材平台。

---

### Task 5: 编写编辑决策并实现 Remotion 黑板合成

**Files:**
- Create: `projects/japan-economy-four-contradictions/composition/`
- Create: `projects/japan-economy-four-contradictions/artifacts/edit_decisions.json`
- Create: `projects/japan-economy-four-contradictions/checkpoint_edit.json`
- Read: `skills/pipelines/hybrid/edit-director.md`
- Read: `skills/pipelines/hybrid/compose-director.md`
- Read: `skills/remotion*.md` and `.agents/skills/remotion-best-practices/SKILL.md` before authoring.

**Interfaces:**
- Consumes: `scene_plan.json`, `asset_manifest.json`, `subtitles.srt`。
- Produces: `render_runtime: remotion` 的编辑决策和可渲染的黑板构图。

- [ ] **Step 1: 定义编辑决策**

固定 `render_runtime` 为 `remotion`；定义黑板背景裁切、每场景粉笔图层、黑板内实拍窗口、字幕样式、音频轨、转场和最终编码配置。

- [ ] **Step 2: 实现逐笔粉笔字**

使用预处理的中文粉笔字图层或 SVG/遮罩路径，让笔画按顺序显示；禁止只使用 opacity 变化模拟书写。每一行文字需能独立调整起止时间和颜色。

- [ ] **Step 3: 实现黑板内实拍窗口**

所有 Pexels/Pixabay 片段放入带粉笔边框的矩形窗口，窗口出现、播放、缩小和结束都在黑板画布内完成。

- [ ] **Step 4: 实现字幕与音频**

将 SRT 映射为底部字幕层，旁白和可选音乐混音后进入主时间轴；字幕层与黑板文字层保持独立。

- [ ] **Step 5: 运行本地草稿渲染**

先渲染低质量草稿，检查黑板裁切、文字可读性、实拍窗口比例、字幕同步和 120 秒目标时长。

---

### Task 6: 最终渲染、验证和交付

**Files:**
- Create: `projects/japan-economy-four-contradictions/renders/final.mp4`
- Create: `projects/japan-economy-four-contradictions/artifacts/render_report.json`
- Create: `projects/japan-economy-four-contradictions/artifacts/final_review.json`
- Create: `projects/japan-economy-four-contradictions/artifacts/publish_log.json`
- Create: `projects/japan-economy-four-contradictions/checkpoint_compose.json`
- Create: `projects/japan-economy-four-contradictions/checkpoint_publish.json`
- Read: `skills/pipelines/hybrid/publish-director.md`

**Interfaces:**
- Consumes: `edit_decisions.json`, `asset_manifest.json`, composition workspace and audio/subtitle assets。
- Produces: 最终 MP4、渲染报告、质量审查和交付日志。

- [ ] **Step 1: 渲染 1080p 交付版**

使用 Remotion 生成 16:9、1080p、正常帧率的 MP4；保持 `render_runtime=remotion`，不得静默切换到其他合成运行时。

- [ ] **Step 2: 运行媒体校验**

用 ffprobe 检查分辨率、时长、帧率、音频轨和视频编码；用抽帧检查所有粉笔字是否在黑板内、是否存在未授权的黑板外画面。

- [ ] **Step 3: 运行同步校验**

逐场景比对旁白、SRT 和画面时间码；确认每句字幕对应旁白，关键粉笔字在对应概念开始后出现。

- [ ] **Step 4: 运行比例和来源校验**

统计实拍视频在最终时间轴中的累计时长，目标约 48 秒；核对每个片段在 `provenance.json` 中有平台、URL、许可证和使用时间码。

- [ ] **Step 5: 写入交付日志**

记录最终文件路径、编码参数、校验结果、已知限制和素材来源；只有所有质量门槛通过后才标记 publish completed。

