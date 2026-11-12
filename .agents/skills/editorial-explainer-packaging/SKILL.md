---
name: editorial-explainer-packaging
description: Use when packaging Chinese educational or finance explainer videos with the user's approved calm editorial component library, including configurable Remotion cards, charts, formulas, portrait stories and Wall Street style evidence and presenter scenes.
---

# 个人风格讲解包装

横屏讲解使用仓库中的个人组件引擎 `visual-components/editorial-engine` 制作画面。先阅读引擎内的 `COMPONENT_GUIDE.md`；处理口播、分镜、资料和混音时，结合仓库中 `.agents/skills/xiaolin-explainer-packaging/SKILL.md` 的相关流程，个人视觉画面使用个人引擎；已批准的华尔街画面使用独立华尔街引擎并保留原版风格，不要混称两者。安装到其他位置时，从仓库运行或用环境变量 `EDITORIAL_ENGINE_PATH` 指向个人引擎。

## 旁白配音

需要生成旁白时，默认使用 Token Plan 的 `token_plan_tts`，模型 `qwen-audio-3.0-tts-plus`，音色 `longanlingxin`；读取 [Token Plan 旁白](references/token-plan-narration.md)。此默认适用于个人画面、大头剪贴和华尔街画面的生成旁白；子技能中的默认配音服务与此不一致时，以本技能为准。用户明确指定其他声音、服务或提供原始口播时遵从用户要求；真人口播原声无需替换。旁白生成后按真实音频重新对齐分镜、字幕和混音。

## 人物、创业和公司故事

遇到人物经历、创业故事、公司历史中适合故事化呈现的内容，主动调用随技能内置的 **bighead-collage 大头剪贴故事视觉模式**，保留其原版人物剪纸、小舞台、道具、字体、颜色、动作、镜头和转场；如果只是视频中的一段，该模式可作为独立故事片段使用。用户有明确视觉或画幅要求时优先服从。先读 [故事模式](references/story-mode.md) 和内置原项目 `vendor/bighead-collage/SKILL.md`，按其完整制作流程执行；使用 `node scripts/create-story.mjs <新工程目录>` 创建原版竖屏故事工程；横屏故事使用 `--landscape` 参数，再按横屏重新编排。横屏提供人物、道具和固定字幕辅助函数；故事片段可与个人图表片段通过合成清单拼接及混音，具体步骤见故事模式。故事画面仍需根据题目设计，跨引擎组合不等于自动嵌入 Remotion。横屏个人组件沿用已确认的视觉风格及动效。

## 财经证据与真人口播

用户确认接入 `wallstreet-explainer` 的大数字、柱状图、折线图和其他已列入清单的财经、关系、素材和真人口播能力，保留其原版深蓝金色风格；不接入该项目的公式 `equation`、标题卡 `title` 和开场关键词 `flash`。原有个人组件及大头剪贴均保留。先读 [华尔街财经与真人口播模式](references/wallstreet-mode.md)，按文案选择，并用 `node scripts/create-wallstreet.mjs <新工程目录>` 创建。不同引擎的画面需实际渲染与组合，人物、图表、新闻和旁白按语义、授权及时间线准备。

## 数字主持人按需生成

需要数字主持人出镜时，主动按分镜逐段生成，无需用户提供完整数字人口播视频。每次编写或修改数字主持人的 H3 提示词前，必须读取并遵循项目中的 `.agents/skills/h3-prompt-writing/SKILL.md` 及其对应输入模式的参考文件。统一使用 AutoDL 的 `autodl_comfyui_video` 工具，指定 `workflow_id=minimax_h3_image_audio_to_video_v2_15s`；每个生成片段设为 5–15 秒，实际成片中主持人可见画面合计占视频总时长的 30%。固定形象和声音，按口播文本、时间线和素材生成；严禁虚称无参考素材的多次生成天然是同一个人。提示词必须逐条禁止推拉摇移、重新构图、背景变化和画面抖动，并检查脖子、喉咙、下巴、肩膀、衣物和麦克风的皮肤波动、液化、融化、拉伸和几何变形；台词口型、配音和画面质量同样要逐段抽帧验收，提示词不能保证绝对不动，不合格则调整或重生成。完整步骤、比例算法、参数和限制见 [数字主持人生成](references/autodl-presenter.md)。

## 图标与真实素材

规划每个场景时，制作视频的助理应理解对应口播及上下文，为所有需要图片的地方按语义选择合适素材，包括人物比例、角色图片、图标、照片、国旗、卡片图像与实拍视频；不要沿用示例素材充当默认内容。人物比例还要按原始数据核对总数、点亮数及统计口径。真实人物和事件的素材要与实际对象、时间和场景相符。缺少适合的素材时先查找、准备或绘制；无法核实的真实素材不要臆造，必要时省略并说明。逐项检查素材含义、路径、大小、遮挡和出现时机；不是每个画面都必须加图。具体字段和示例见 [图标与素材使用](references/visual-assets.md)。

科技、财经、知识等都可使用这套个人组件。按用户要求不接入原技能 v1.1 的科技主题、网页截图标注、Logo 及图标砖墙功能；已有的照片卡、图片背景和实拍视频背景仍可使用。真实素材须记录来源、许可和所需署名，区分视频、图片与生成示意图；生成图不得冒充真实事件证据。具体操作见 [图标与素材使用](references/visual-assets.md)。

## 创建工程

运行本技能目录下 `node scripts/create-project.mjs <新工程目录>`；可用环境变量 `EDITORIAL_ENGINE_PATH` 指向引擎。命令会复制引擎源代码、素材和运行文件，不会覆盖已有目录。进入新工程安装 `package.json` 的依赖，再按原技能的分镜 API 制作 `src/data/shots.json`；示例见引擎的 `preview/demo-shots.json`。根据实际内容准备图片、图标、音频和事实，图片文件要先存在，场景内容应可替换。

默认深色场景采用深蓝织物质感与柔和金色，个人组件的视觉配色与华尔街风格协调；标题卡和片尾卡保留已确认的独立设计。保留既有组件的功能、参数、布局和动效，国旗、人民币及用户提供的图片素材保留自身颜色。堆叠、支柱、支柱顶部、文字、强调文字、闪光、横向条图、硬币、金币流和计算器保留统一风格前的主体视觉，只随场景更换背景。显式指定的背景及组件颜色按参数显示。横向条图与滑块默认透明。素材由制作视频的助理根据内容选择并显式填入组件参数；组件本身不解析口播或自动查找素材，不要声称具备此功能。

在目标工程中用 `node render.mjs video <输出.mp4>` 渲染；Windows 可以设置 `CHROME_PATH` 使用本机 Chrome。使用前核对必要的字体、素材、依赖及许可；`YouShe.ttf` 不存在时回退到内置字体。渲染后查看不同时间点、文字边界和字幕遮挡，并明确区分示例数据与可核实事实。

本地样片及对照位于引擎的 `previews/`。`personal-style-demo-voice.mp4` 使用电脑自带语音作为示例旁白。
