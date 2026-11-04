# xiaolin-explainer-packaging

把出镜口播片段包装成小Lin说风格讲解视频的 agent skill，内含一套 Remotion 渲染引擎。

An agent skill with a Remotion engine. It turns talking-head clips into explainer videos in the visual style of the Chinese finance channel 小Lin说 (Xiao Lin Shuo). This is an unofficial project. It is not affiliated with or endorsed by the creator.

## 声明

- 这是非官方项目。它与小Lin说及其团队无关，没有得到授权或认可。"小Lin说"只用来描述视觉风格。
- 仓库不含她的视频、截图、肖像、声音或台标。演示画面里的出镜位置是占位色块。
- 成片默认带"AI生成 · 实验作品 · 非本人"标注。请保留这个标注。
- 不要用真实创作者的肖像或声音生成出镜画面后公开发布。不要把成片当成本人作品发布。

## 效果

![9 种版式](docs/layouts.jpg)

![卡片墙动效：镜头跟到当前项，当前项亮起，其余压暗并虚化](docs/demo_wall.gif)

上面的画面都来自 `--demo` 演示工程。数据是演示数据。

## 能做什么

输入是两样东西：每句台词一段 1920×1080 的出镜 mp4，以及每句的朗读文本和字幕文本。输出是讲解画面、字幕、转场、配乐和音效合成后的成片。

| 部分 | 内容 |
|---|---|
| 主版式 | 巨型数字 `bignum`、卡片墙 `wall`、白卡图表 `paper`、整页文档加荧光笔 `docpage`、实体卡 `ent6`、大公式条 `formula6`、白底计算器 `ui` |
| 其他元素 | 片名卡、章节卡、片尾卡、照片卡、标签、小人、金币流、印章、弹幕、对话气泡、手绘圈等约 25 种；25 个 2.5D 图标 |
| 计时 | 元素入场对齐台词关键词：`S.k('关键词', -0.15)` |
| 镜头和转场 | 镜头跟随当前项；场景间自动分配推拉、甩镜、推移、闪白、旋转推近 |
| 画中画 | 全屏、圆形、矩形三种 |
| 声音 | 人声、配乐、合成音效（嗖声、重击声等）混音，响度归一到 -16 LUFS |
| 资料检索 | 每种版式要查的资料、来源分级、事实文件模板；Wikimedia Commons 自由许可照片的搜索和下载脚本，自动生成署名 |
| 质检 | 关键帧审片拼图；整片视频帧和静帧逐帧对比 |

风格规则写在 `references/style-bible.md`。规则来自对她 5 期公开视频的逐帧拆解，例如"主体要被画面边缘裁切，或者占画面 60% 以上""每 2–3 个深色场景插 1 个白纸场景"。

## 不做什么

- 不生成出镜画面。出镜片段要用别的工具生成或自己拍摄。
- 不写口播稿。
- 只做这一种风格。换风格要改组件代码。
- 只支持 1920×1080、24 帧。
- 国旗只有 6 个：智利、中国、德国、法国、日本、美国。

## 安装

### Manus

1. 从 [Releases](../../releases) 下载 `xiaolin-explainer-packaging.skill`。
2. 在 Manus 里把这个文件添加为技能。
3. 对 Manus 说："用 xiaolin-explainer-packaging，给 `<目录>` 里的口播片段做讲解包装，台词在 `<文件>`。"

### 其他支持 SKILL.md 的 agent

把 `xiaolin-explainer-packaging/` 文件夹复制到该 agent 的 skills 目录，例如 Claude Code 的 `~/.claude/skills/`。这种用法未测试。

### 不用 agent，直接用引擎

先准备环境：

- Node 18 或更高版本、ffmpeg、python3（带 numpy 和 Pillow）。
- `npm install` 和第一次渲染要联网。第一次渲染时，Remotion 会下载 Chrome。
- 只在 macOS（Apple Silicon）上测试过。其他系统默认用软件渲染 `swangle`，可以用环境变量 `REMOTION_GL` 改。

然后跑演示工程：

```bash
git clone https://github.com/howoneai/xiaolin-explainer-packaging.git
S=$PWD/xiaolin-explainer-packaging/xiaolin-explainer-packaging
bash $S/scripts/new_project.sh demo --demo        # 复制引擎、生成 4 段假出镜、npm install
cd demo
python3 story_core.py timeline.json scenes.py     # 生成分镜数据，应输出 gaps/overlaps []
python3 -c "import json;print(' '.join(str(f) for _,f in json.load(open('keyframes.json'))))" | xargs node render.mjs stills stills/k1
python3 $S/scripts/sheet.py stills/k1 keyframes.json 6   # 关键帧审片拼图
bash $S/scripts/render_chunks.sh video.mp4        # 整片
python3 $S/scripts/mix_audio.py timeline.json mix_raw.wav
bash $S/scripts/finalize.sh video.mp4 mix_raw.wav final.mp4
python3 $S/scripts/audit.py video.mp4 72          # 逐帧质检，flagged 应为 0
```

做自己的视频时，按 `SKILL.md` 的 7 步走：准备输入、建工程、规划场景、查资料、写分镜、关键帧审片、整片质检。分镜写法从 `templates/scenes_example.py` 复制。参数见 `references/layouts.md` 和 `references/storyboard-api.md`。

### 字体：优设标题黑

标题和字幕原本用优设标题黑。它的官网允许免费商用，但没有写允许再分发，所以仓库不带这个字体。

请从 https://www.uisdc.com/uisdc-first-free-font 下载，再存为工程里的 `public/fonts/YouShe.ttf`。另一种方法是设置环境变量 `YOUSHE_TTF` 指向字体文件，`new_project.sh` 会自动复制。缺这个字体时，标题和字幕回退到思源黑体 900 字重，没有斜切，风格会明显变弱。

## 目录

```
xiaolin-explainer-packaging/
├── SKILL.md                    工作流、审片清单、已知陷阱
├── references/
│   ├── style-bible.md          图形语言、硬规则、色板、字体、转场、声音电平
│   ├── layouts.md              每个版式的参数和示例
│   ├── storyboard-api.md       timeline.json 格式、分镜 API、渲染命令
│   └── research.md             资料检索规范和图片权利
├── scripts/                    new_project、render_chunks、mix_audio、finalize、sheet、audit、commons_photo
└── templates/
    ├── engine/                 Remotion 工程（src/、public/fonts、public/icons）
    ├── scenes_example.py       覆盖 7 种主版式的示例分镜
    ├── facts_template.md       事实文件模板
    └── *.example.json          时间线和工程配置示例
```

## 许可

| 内容 | 许可 |
|---|---|
| 代码、文档、图标 | MIT，见 [LICENSE](LICENSE)。图标由 AI 图像工具生成 |
| 字体（D-DIN Condensed、Bebas Neue、Oswald、Quicksand、Noto Sans SC、Noto Serif SC） | SIL Open Font License 1.1，见 `templates/engine/public/fonts/LICENSES.txt` |
| Remotion | 不在本仓库内，`npm install` 时下载。个人、3 人以内的公司和非营利组织可以免费使用。4 人以上的公司要购买公司授权：https://www.remotion.pro/license |
| 优设标题黑 | 不在本仓库内，见上文 |

## 来历

这个 skill 由 [Manus](https://manus.im) 在一次风格复刻实验中制作。制作过程是：先逐帧拆解她的公开视频，再用 Remotion 重建版式，最后用一期约 12 分钟的养老金选题，把讲解包装迭代了 4 版（v3–v6）。实验中的出镜画面用了真人形象的 AI 生成，所以那期成片没有放进本仓库。
