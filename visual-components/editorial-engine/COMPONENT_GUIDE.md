# 个人风格组件使用指南

组件通过 `k` 指定类型，常用定位和时间参数为 `t`（秒）、`x`、`y`；除屏幕元素外，`x`、`y` 一般表示元素中心。`anim: 'none'` 可避免场景包装动画叠加组件自身动效。真实场景还要设置画面背景：`bg: {type: 'dark'}` 默认为黑色；标题、片尾和计算器有各自已确认的设计。

下表列常用输入，不表示所有参数；未列出的参数与精确行为以 `src/els.tsx`、`src/els6.tsx` 及对应组件文件为准。文件路径相对工程 `public/`，使用前确保素材存在。

| 组件 | 用途 | 常用内容输入 |
|---|---|---|
| `card` | 信息卡 | `label`、`value`、`unit`、`sub`、`icon`、`count` |
| `concept` | 概念卡 | `word`、`en`、`sub`、`icon`、`size` |
| `panel` | 大面板 | `title`、`en`、`w`、`h` |
| `icon` | 图标卡 | `src`、`size`、`label`、`en` |
| `people` | 人物比例，原版 | `src`、`n`、`litn`、`lt`、`size`；素材为 `public/icons/<src>.png` |
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
| `meme` | 强调文字，原版 | `txt`、`size`、`burst`、`tilt`、`c` |
| `bubble` | 气泡 | `txt`、`side`、`size` |
| `comment` | 评论 | `name`、`txt`、`meta`、`av`、`w` |
| `stamp` | 印章 | `txt`、`size`、`c`、`tilt`、`bg` |
| `toon` | 角色图片，原版 | `src`、`size`、`wig`；素材为 `public/toon/<src>.png` |
| `spark` | 闪光 | `size`、`c` |
| `box` | 色块 | `w`、`h`、`bg`、`bd` |
| `chart` | 折线图，原版 | `pts`（标签与数值数组）、`labels`、`min`、`max`、`unit`、`title` |
| `bars` | 横向条形图 | `rows`（`label`、`v`、`txt`）、`max`、`w`、`bh` |
| `tag` | 标签 | `txt`、`size`、`c`、`en` |
| `coin` | 硬币，原版 | `size`；原版符号为固定 `¥` |
| `note` | 纸币 | `size` 或 `w`、`value`、`symbol`、`label`；改变面额时同时设置对应 `label` |
| `coinflow` | 金币流，原版 | `from`、`to`、`n`、`d`、`tr`、`s` |
| `arrow` | 箭头，原版 | `from`、`to`、`bend`、`sw`、`c` |
| `scribble` | 手绘标注，原版 | `shape`、`x`、`y`、`w`、`h`、`c` |
| `wall` | 卡片墙 | `cards`、`cols`、`cw`、`ch`、`gap`、`focus`；卡片可替换文字与图标 |
| `paper` | 白卡图表 | `kind`、`title`、`en`、`rows`、`max`、`w`、`h`；支持横向条形图等变体 |
| `docpage` | 整页文档 | 文档内容、来源和高亮；按原技能分镜接口用 `add_doc` 添加 |
| `ent6` | 实体卡 | `name`、`en`、`strip`、`c` 或 `icon`、`w`、`h` |
| `bignum` | 大数字 | `v` 或 `count`、`unit`、`size`、`kicker`、`cap`、`en` |
| `ui` | 计算器，原版 | `title`、`fields`、`res`、`w`、`h` |
| `formula6` | 大公式条 | `toks`、`fs`、`ih`、`hl`、`pw`、`ph`；图标用 `toks[].icon` 或 `iconKind` |
| `titlecard` | 标题卡 | `l1`、`l2`、`l2b`、`q`、`en`；使用 `layer: 'screen'` |
| `endcard` | 片尾卡 | `title`、`subtitle`、`en`、`image`、`bgVariant`；使用 `layer: 'screen'` |
| `ruler` | 时间标尺 | `from`、`to`、`prev`、`mark`、`y` |

人物图片通过分镜中指定 `src` 更换；引擎不会自动理解口播来选图。内置国旗的国家代码有限，其他国家可给 `flag.src` 自定义图片，实体卡可以给 `icon` 图片。`note`、`coin` 等是静态示意图，不代表实际汇率或财务事实。示例模板不等于对所有长度、内容和素材的自动排版保证：实际使用时应调整尺寸，并逐帧检查裁切。

示例工程数据见 [demo-shots.json](preview/demo-shots.json)，由 `node preview/render-demo.mjs` 渲染为 `previews/personal-style-demo.mp4`；它通过临时副本运行真实引擎，保留当前 `src/data/shots.json`。Windows 上运行 `preview/add-demo-voice.ps1` 可用本机中文语音生成带旁白版本。原始各组件对照见 [预览总览](previews/index.html)。
