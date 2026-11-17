---
name: editorial-explainer-packaging
description: Package Chinese educational and finance explainer videos using the user's personal editorial components, Wall Street scenes, news and real footage.
metadata:
  version: "2.0.0"
---

# 个人风格讲解包装

以华尔街的导演表、证据素材、时间线和审片为整片主流程，按内容选择个人与华尔街画面，不设数量配额。默认横屏、无主持人、有旁白和字幕；用户当次明确要求优先。视觉保留用户确认的个人组件、动效及统一背景；标题卡、片尾卡保留独立背景。**先读 [混合制作流程](references/hybrid-production.md)**；每个镜头按选题设计动作和道具，禁止用固定卡片轮换冒充分镜。镜头可根据内容直接切换或选择转场，不要求专门设计跨组件承接；本条优先于原项目相关默认。

## 制作前确认

正式视频默认先准备并向用户展示导演表、素材清单和预计预算，等待用户确认后再开始正式制作；可先进行必要的查证和免费、只读素材检索。用户当次明确要求直接制作或已确认同一方案时，不重复确认。仅要求方案或样片时按该请求执行。详见 [混合制作流程](references/hybrid-production.md)。

## 选择画面

- 真实事件和事实：先找可核实且使用条件适合的新闻原文、照片或实景；新闻与金融关系可选华尔街 article、headlines、footage、frames、flow、network 等。真实资料、示意和生成图明确区分。
- 标题、片尾、需要个人组件样式的图表/公式、贴纸道具和动态示意：个人引擎；华尔街也有已接入的数字、柱状、折线、对比等，依镜头任务和可读性选，不因引擎数量强行平均。
- 人物经历、创业及公司故事适合演绎时，读 [故事模式](references/story-mode.md)，明确该段与整片风格的结合方式；用户明确指定画风时优先。
- 图标、照片、实景及素材授权读 [图标与素材](references/visual-assets.md)；照片背景和动态道具读 [画面设计](references/scene-treatment.md)。组件不解析稿件或自动找素材；制作流程应主动准备素材，可使用 API、搜索、截图、生成工具，核验内容、来源和许可。

## 明确不接入

| 排除 | 仍可使用 |
|---|---|
| 华尔街 equation、title、flash | 个人公式与标题卡 |
| 小林新版 line6 | 已确认的个人折线图及已接入华尔街折线图 |
| 小林 v1.1 科技主题、webshot 截图标注、Logo、图标砖墙 | 普通新闻截图、照片和实景；已接入的华尔街新闻展示 |
| 小林七套整片主题整体接入 | 已确认个人视觉、单独选择的道具画风 |

## 道具和默认语音

新个人工程默认写入 prop_look: sticker25d，使用小林 2.5D 卡通贴纸参考 visual-components/editorial-engine/public/prop_styles/sticker25d.png 与 prop_styles.json。原有工程外观不自动改变；实际道具需按内容准备，配置仅影响引擎支持的部分。用户可明确指定其他画风。具体参数见 visual-components/editorial-engine/COMPONENT_GUIDE.md。

需要生成旁白时默认使用 Token Plan token_plan_tts、qwen-audio-3.0-tts-plus、longanlingxin，先读 [旁白](references/token-plan-narration.md)。基于实际音频对齐镜头和字幕；用户明确指定声音、提供音频或要求无旁白时优先遵从。

## 主持人（仅在用户明确要求时）

默认无主持人，不设出镜配额。用户明确要求时，先确认当次形态、时长、音色、预算及是否有占比；全屏/竖窗读 [AutoDL H3](references/autodl-presenter.md)，圆窗读 [Vidu](references/vidu-presenter.md)。H3 每次 5–15 秒并必须先读项目 h3-prompt-writing；可在检查口型和音画衔接后剪短。若用户指定占比，以最终成片实际总帧数为分母、约定形态可见区间并集为分子，重叠只计一次；未指定则不设配额。不得将生成片段的溢出从成片分母扣除。

## 工程与组合

在仓库运行；EDITORIAL_ENGINE_PATH 可指定个人引擎。使用说明和真实能力限制见 [混合制作流程](references/hybrid-production.md)、[华尔街模式](references/wallstreet-mode.md)、[故事模式](references/story-mode.md)。

| 工具 | 用途 |
|---|---|
| scripts/create-project.mjs | 创建个人组件工程，写入贴纸默认和渲染前检查 |
| scripts/create-wallstreet.mjs | 创建华尔街工程 |
| scripts/create-story.mjs --landscape | 创建横屏故事工程，仍需重新排版 |
| scripts/prepare-wallstreet-clip.mjs | 个人片段转 30fps 帧序列供 footage 使用，不保留音轨 |
| scripts/assemble-story.mjs | 按清单拼接并另混指定音轨；当前固定 720p/24fps、补边、硬切 |
| assets/story-landscape.js | 横屏故事工程的人物、道具与字幕辅助函数，具体用法见故事模式 |

## 交付与检查

按 [混合制作流程](references/hybrid-production.md) 保留导演表、决定记录、事实及素材台账；字幕和音频仅在实际使用时保存。渲染前检查道具配置、字体、素材和依赖；渲染后检查画面、字幕、音频、时长/规格与来源，输出实际检查结果。新工程使用 node render.mjs video <输出.mp4>；Windows 可指定本机 CHROME_PATH。缺 YouShe.ttf 会回退字体，需在正式渲染前向用户说明。仅凭工程创建、配置或静帧不能声称整片已验证。
