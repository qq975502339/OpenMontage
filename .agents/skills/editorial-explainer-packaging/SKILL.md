---
name: editorial-explainer-packaging
description: Use when packaging Chinese educational or finance explainer videos with the user's approved calm editorial component library, including configurable Remotion cards, charts, formulas, titles and visual annotations.
---

# 个人风格讲解包装

使用仓库中的个人组件引擎 `visual-components/editorial-engine` 制作讲解画面。先阅读引擎内的 `COMPONENT_GUIDE.md`；处理口播、分镜、资料和混音时，结合仓库中 `.agents/skills/xiaolin-explainer-packaging/SKILL.md` 的相关流程，但画面组件必须使用个人引擎，不要新建原版引擎后误称已经使用个人风格。安装到其他位置时，从仓库运行或用环境变量 `EDITORIAL_ENGINE_PATH` 指向个人引擎。

## 图标与真实素材

规划每个场景时，制作视频的助理应理解对应口播及上下文，为所有需要图片的地方按语义选择合适素材，包括人物比例、角色图片、图标、照片、国旗、卡片图像与实拍视频；不要沿用示例素材充当默认内容。人物比例还要按原始数据核对总数、点亮数及统计口径。真实人物和事件的素材要与实际对象、时间和场景相符。缺少适合的素材时先查找、准备或绘制；无法核实的真实素材不要臆造，必要时省略并说明。逐项检查素材含义、路径、大小、遮挡和出现时机；不是每个画面都必须加图。具体字段和示例见 [图标与素材使用](references/visual-assets.md)。

科技、财经、知识等都可使用这套个人组件。按用户要求不接入原技能 v1.1 的科技主题、网页截图标注、Logo 及图标砖墙功能；已有的照片卡、图片背景和实拍视频背景仍可使用。真实素材须记录来源、许可和所需署名，区分视频、图片与生成示意图；生成图不得冒充真实事件证据。具体操作见 [图标与素材使用](references/visual-assets.md)。

## 创建工程

运行本技能目录下 `node scripts/create-project.mjs <新工程目录>`；可用环境变量 `EDITORIAL_ENGINE_PATH` 指向引擎。命令会复制引擎源代码、素材和运行文件，不会覆盖已有目录。进入新工程安装 `package.json` 的依赖，再按原技能的分镜 API 制作 `src/data/shots.json`；示例见引擎的 `preview/demo-shots.json`。根据实际内容准备图片、图标、音频和事实，图片文件要先存在，场景内容应可替换。

默认深色场景使用黑色背景；标题卡、片尾卡、计算器等保留各自已经确认的专用设计。遵循用户确认：`ui`、`people`、`toon`、`meme`、`chart`、`arrow`、`scribble`、`coin`、`coinflow` 使用原版实现；其余组件按个人引擎当前代码执行。横向条图与滑块默认透明。素材由制作视频的助理根据内容选择并显式填入组件参数；组件本身不解析口播或自动查找素材，不要声称具备此功能。

在目标工程中用 `node render.mjs video <输出.mp4>` 渲染；Windows 可以设置 `CHROME_PATH` 使用本机 Chrome。使用前核对必要的字体、素材、依赖及许可；`YouShe.ttf` 不存在时回退到内置字体。渲染后查看不同时间点、文字边界和字幕遮挡，并明确区分示例数据与可核实事实。

本地样片及对照位于引擎的 `previews/`。`personal-style-demo-voice.mp4` 使用电脑自带语音作为示例旁白。
