# 编辑风格组件引擎

此目录从 `xiaolin-explainer-packaging/templates/engine` 复制并按用户反馈改造，原技能保持不变。个人风格技能入口在 `../editorial-explainer-packaging/SKILL.md`。

视觉方向：黑色深色场景、奶油黄、珊瑚红和暖橙；标题卡、片尾卡及计算器保留用户确认的专用设计。输入接口基于原引擎，具体字段及素材路径参见 `COMPONENT_GUIDE.md`。

40 个注册元素均有相应实现；`ui`、`people`、`toon`、`meme`、`chart`、`arrow`、`scribble`、`coin`、`coinflow` 按用户要求使用原版实现。`paper` 的纵向和横向图表分别提供对照。批量新增的 30 个元素及横向变体视频保存在 `previews/`，索引为 `previews/index.html`。预览直接展示组件，原有场景层的摄像机与入场包装未全部加入对照。

40 个注册元素：

- 基础元素（27）：`card`, `concept`, `panel`, `icon`, `people`, `doc`, `slider`, `stack`, `pillar`, `roof`, `formula`, `flag`, `entity`, `txt`, `photo`, `meme`, `bubble`, `comment`, `stamp`, `toon`, `spark`, `box`, `chart`, `bars`, `tag`, `coin`, `note`。
- 画布元素（3）：`coinflow`, `arrow`, `scribble`。
- 主要版式（7）：`wall`, `paper`, `docpage`, `ent6`, `bignum`, `ui`, `formula6`。
- 全屏元素（3）：`titlecard`, `endcard`, `ruler`。

依赖见 `package.json`，字体许可证见 `public/fonts/LICENSES.txt`。`YouShe.ttf` 未附带，缺失时使用项目内的 Noto Sans SC 字体回退。原技能的素材、字体及 Remotion 的许可仍分别适用。

从引擎目录运行 `node preview/render-batch.mjs` 可重新生成批量对照；也可在命令后指定单个组件名。支持通过 `CHROME_PATH` 指定本机 Chrome。渲染使用项目内素材及原技能代码，不会修改原技能。

运行 `node preview/render-demo.mjs` 可使用真实引擎渲染 `preview/demo-shots.json`，不覆盖当前项目分镜。`previews/personal-style-demo.mp4` 是无旁白版；Windows 上运行 `preview/add-demo-voice.ps1` 可使用本机中文语音生成 `previews/personal-style-demo-voice.mp4`。数据仅用于展示组件，不是事实报道。
