# 个人风格组件使用指南

组件通过 `k` 指定类型，常用定位和时间参数为 `t`（秒）、`x`、`y`；除屏幕元素外，`x`、`y` 一般表示元素中心。`anim: 'none'` 可避免场景包装动画叠加组件自身动效。真实场景还要设置画面背景：`bg: {type: 'dark'}` 默认采用深蓝织物质感背景；显式指定的背景仍按参数显示。标题和片尾保留已确认的独立设计，计算器保留原有结构。堆叠、支柱、支柱顶部、文字、强调文字、闪光、横向条图、硬币、金币流和计算器保留统一风格前的主体视觉，只随场景更换背景。

下表列常用输入，不表示所有参数；未列出的参数与精确行为以 `src/els.tsx`、`src/els6.tsx` 及对应组件文件为准。文件路径相对工程 `public/`，使用前确保素材存在。

| 组件 | 用途 | 常用内容输入 |
|---|---|---|
| `card` | 信息卡 | `label`、`value`、`unit`、`sub`、`icon`、`count` |
| `concept` | 概念卡 | `word`、`en`、`sub`、`icon`、`size` |
| `panel` | 大面板 | `title`、`en`、`w`、`h` |
| `icon` | 图标卡 | `src`、`size`、`label`、`en` |
| `people` | 人物比例，保留原有功能和动效 | `src`、`n`、`litn`、`lt`、`size`；素材为 `public/icons/<src>.png` |
| `doc` | 小文档 | `org`、`seal`、`lines`、`w`、`h` |
| `slider` | 滑块比较 | `min`、`max`、`a`、`b`、`unit`、`label`、`sub` |
| `stack` | 堆叠 | `n`、`nw`、`gap`、`d` |
| `pillar` | 单个支柱 | `title`、`sub`、`icon`、`w`、`h` |
| `roof` | 支柱顶部 | `txt`、`w`、`h` |
| `formula` | 基础公式 | `items`（每项 `s`、`op`、`lab`、`icon`、`t`）、`focus`、`size` |
| `flag` | 国旗 | `c`、`shape`、`size`；自定义图使用 `src` |
| `entity` | 基础实体 | `name`、`en`、`c`、`size` |
| `txt` | 文字 | `txt`、`en`、`size`、`font`、`color`、`grad` |
| `photo` | 照片 | `src`、`cap`、`en`、`credit`、`w`、`h`、`pos` |
| `meme` | 强调文字，保留原有功能和动效 | `txt`、`size`、`burst`、`tilt`、`c` |
| `bubble` | 气泡 | `txt`、`side`、`size` |
| `comment` | 评论 | `name`、`txt`、`meta`、`av`、`w` |
| `stamp` | 印章 | `txt`、`size`、`c`、`tilt`、`bg` |
| `toon` | 角色图片，保留原有功能和动效 | `src`、`size`、`wig`；素材为 `public/toon/<src>.png` |
| `spark` | 闪光 | `size`、`c` |
| `box` | 色块 | `w`、`h`、`bg`、`bd` |
| `chart` | 折线图，保留原有功能和动效 | `pts`（标签与数值数组）、`labels`、`min`、`max`、`unit`、`title` |
| `bars` | 横向条形图 | `rows`（`label`、`v`、`txt`）、`max`、`w`、`bh` |
| `tag` | 标签 | `txt`、`size`、`c`、`en` |
| `coin` | 硬币，保留原有功能和动效 | `size`；原版符号为固定 `¥` |
| `note` | 纸币 | `size` 或 `w`、`value`、`symbol`、`label`；改变面额时同时设置对应 `label` |
| `coinflow` | 金币流，保留原有功能和动效 | `from`、`to`、`n`、`d`、`tr`、`s` |
| `arrow` | 箭头，保留原有功能和动效 | `from`、`to`、`bend`、`sw`、`c` |
| `scribble` | 手绘标注，保留原有功能和动效 | `shape`、`x`、`y`、`w`、`h`、`c` |
| `wall` | 卡片墙 | `cards`、`cols`、`cw`、`ch`、`gap`、`focus`；卡片可替换文字与图标 |
| `paper` | 白卡图表 | `kind`、`title`、`en`、`rows`、`max`、`w`、`h`；支持横向条形图等变体 |
| `docpage` | 整页文档 | 文档内容、来源和高亮；按原技能分镜接口用 `add_doc` 添加 |
| `ent6` | 实体卡 | `name`、`en`、`strip`、`c` 或 `icon`、`w`、`h` |
| `bignum` | 大数字 | `v` 或 `count`、`unit`、`size`、`kicker`、`cap`、`en` |
| `ui` | 计算器，保留原有功能和动效 | `title`、`fields`、`res`、`w`、`h` |
| `formula6` | 大公式条 | `toks`、`fs`、`ih`、`hl`、`pw`、`ph`；图标用 `toks[].icon` 或 `iconKind` |
| `titlecard` | 标题卡 | `l1`、`l2`、`l2b`、`q`、`en`；使用 `layer: 'screen'` |
| `endcard` | 片尾卡 | `title`、`subtitle`、`en`、`image`、`bgVariant`；使用 `layer: 'screen'` |
| `ruler` | 时间标尺 | `from`、`to`、`prev`、`mark`、`y` |

人物图片通过分镜中指定 `src` 更换；引擎不会自动理解口播来选图。内置国旗的国家代码有限，其他国家可给 `flag.src` 自定义图片，实体卡可以给 `icon` 图片。`note`、`coin` 等是静态示意图，不代表实际汇率或财务事实。示例模板不等于对所有长度、内容和素材的自动排版保证：实际使用时应调整尺寸，并逐帧检查裁切。

示例工程数据见 [demo-shots.json](preview/demo-shots.json)，由 `node preview/render-demo.mjs` 渲染为 `previews/personal-style-demo.mp4`；它通过临时副本运行真实引擎，保留当前 `src/data/shots.json`。Windows 上运行 `preview/add-demo-voice.ps1` 可用本机中文语音生成带旁白版本。原始各组件对照见 [预览总览](previews/index.html)。

## 新增的七种版式

以下版式改编自 xiaolin-explainer-packaging v1.4.0（MIT）；保留现有折线图。每个版式均可设置 `t`、`x`、`y`、`anim`，真实数据、素材与高亮时间需逐期配置。版式使用个人深蓝金配色，并可与华尔街画面按内容选择。

| 类型 | 作用 | 主要参数 |
|---|---|---|
| `timeline6` | 时间轴，事件卡上下交错 | `items: [{y,l,s?,icon?,t?}]`、`gap`、`cw`、`ch`、`focus` |
| `pie6` | 饼图、环形图 | `slices: [{l,v,c?,t?}]`、`donut`、`center`、`hi`、`title` |
| `flow6` | 流程与回环 | `steps: [{l,s?,t?}]`、`bw`、`bh`、`gap`、`loop`、`focus` |
| `tree6` | 树状拆解 | `root: {id,l,c:[...]}`、节点 `op`、`bw`、`bh`、`lv`、`focus` |
| `map6` | 示意地图、地点和航线 | `view`、`hi`、`pts`、`routes`、`surface`、`title` |
| `vs6` | 两组信息对比 | `a`、`b`（含 `l,v,u,s,pts`）、`focus` |
| `graph6` | 关系网络、方向和资金流 | `nodes: [{id,l,x,y}]`、`edges: [{a,b,l,flow?}]`、`focus` |

`focus`、`hi` 的时间为影片绝对秒数；元素内部的逐项时间 `t` 也应按影片时间填写。地图使用 Natural Earth 低精度示意数据，涉及中国疆域的公开出版应使用符合要求的标准地图素材。该地图不是标准地图，不应将它用于需要精确边界的场景。道具图片仍需逐期准备，组件不会自动检索图片。静态示例在 `previews/extended-layouts/`，只是版式演示，动效需播放视频或逐帧检查。

## 动态道具与象形图

以下两个组件改编自 xiaolin-explainer-packaging v1.4.0（MIT）。它们叠加在场景中，场景仍须设置背景；图片素材由制作人员按内容准备并放进工程的 `public/`，路径相对于 `public/`。所有时间参数均以成片绝对秒数计，内容、动作和素材须按每期主题设置。以下是接口示例；具体素材和参数应在实际项目中检查。

### 动态道具 `prop`

可用透明 PNG 等图片表现物体或角色。`src` 为图片路径，`w`、`h` 控制大小；`idle` 可选 `sway`（摆动）、`breathe`（呼吸）、`shake`（抖动）、`wobble`（摇摆）或 `spin`（旋转）。`to: [dx,dy]` 或 `path: [[dx,dy], ...]` 定义相对初始位置的移动，`pt`、`pd` 设置开始时间和持续秒数，`arc` 设置抛物线高度；`copies`、`dt` 可制作多份连续移动，`loop` 可循环。可用 `anim: 'none'` 避免外层默认入场与道具动作叠加。

```json
{"k":"prop","t":0,"x":500,"y":540,"anim":"none","src":"props/truck.png","w":250,"to":[800,0],"pt":0.5,"pd":3,"idle":"sway"}
```

### 象形图 `stack6`

用同一图片堆叠成柱，或排列成网格并替换其中一部分图像。柱状模式使用 `src`、`cols: [{l,v,src?}]`、`unit`（每个图案代表的数值）、`per`（每列每行图案数量）和 `iw`；网格模式使用 `grid: {n,per,hi,alt,hiT,hiD}`，其中 `n` 为总数、`hi` 为替换数量、`alt` 为替换后的图片路径、`hiT` 为开始替换的绝对时间。网格需要同时提供 `src` 和 `grid.alt`，每个图标的数值意义应清楚并核对数据口径。

```json
{"k":"stack6","t":0,"x":960,"y":520,"anim":"none","src":"props/shop.png","iw":70,"grid":{"n":100,"per":10,"hi":30,"alt":"props/shop-highlight.png","hiT":2,"hiD":1.2}}
```

图片不会由组件自动搜索或生成；图片、版式、数据比例、字幕遮挡和效果需在实际视频制作时检查。

## 折线图上的道具与照片背景

现有 `chart` 可选 `rider: {src, w?, h?, dx?, dy?}`，图片路径相对 `public/`，不指定时保留原来的折线图。道具沿原折线的显露前端移动，`w`、`h` 为图片尺寸，`dx`、`dy` 为像素偏移；出现时间与原折线绘制时间一致。制作时应核验数据和素材并检查标签遮挡。

```json
{"k":"chart","t":0,"x":960,"y":520,"pts":[["一月",10],["二月",18],["三月",14]],"min":0,"max":20,"rider":{"src":"props/gold.png","w":100,"dy":-12}}
```

照片作为图形画面背景使用 `bg: {"type":"dark","photo":"photos/example.jpg","blur":10,"bright":0.35}`；此路径相对 `public/`，`blur` 控制模糊像素，`bright` 控制亮度，画面有缓慢放大。需要展示原始细节的照片可使用 `broll` 图像模式，并设置 `bright`、`dim` 和移动参数。背景应结合实际文字、字幕和图表检查可读性，并记录来源和许可，不能把 AI 示意图当成真实事件照片。
