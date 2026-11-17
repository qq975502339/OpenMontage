# 分镜 API 和数据格式

## 文件流

```
timeline.json + project.json + scenes*.py
        │  python3 story_core.py timeline.json scenes.py [more.py ...]
        ▼
src/data/shots.json（Remotion 输入）  sfx.json（音效事件）  keyframes.json（审片帧）
        │  node render.mjs stills <dir> <frame...>      审片
        │  render_chunks.sh video.mp4                   整片画面
        │  mix_audio.py timeline.json mix_raw.wav       人声 + 音乐 + 音效
        ▼  finalize.sh video.mp4 mix_raw.wav out.mp4    合成，响度 -16 LUFS
```

所有命令都在工程根目录运行。素材路径相对于 `public/`。

## timeline.json

一个数组，按播放顺序列出所有片段。`start` 省略时按顺序自动累加。

```json
[
  {"id": "TITLE", "kind": "card", "dur": 4.0},
  {"id": "S01", "kind": "clip", "src": "clips/S01.mp4", "tin": 0.32, "tout": 9.69,
   "cuts": [[6.30, 7.75]], "say": "朗读文本，用来算关键词时间", "sub": "字幕文本，可以写阿拉伯数字"},
  {"id": "CH1", "kind": "card", "dur": 3.0}
]
```

| 字段 | 含义 |
|---|---|
| `id` | 片段名，分镜里用 `G('S01')` 引用 |
| `kind` | `clip`：出镜口播，有画面和声音。`card`：片名、章节、片尾卡，没有人声 |
| `src` | 出镜视频，默认 `clips/<id>.mp4` |
| `tin` `tout` | 在源视频里的入点和出点（秒）。裁掉首尾静音和口误 |
| `cuts` | 片段内部要跳过的区间 `[[a, b], ...]`，用来剪掉中间的口误 |
| `dur` | 片段时长。`clip` 可以省略，由 `tout − tin − cuts` 算出；给了 `dur` 没给 `tout` 时反过来算 `tout` |
| `say` | 朗读文本（汉字写法，例如"十五块"）。关键词计时用它 |
| `sub` | 字幕文本（可以写"15块"），默认等于 `say` |
| `gain` | 这段人声的额外增益，默认 1.0 |

`tin`/`tout` 的定法：先转写每段出镜视频，找到第一个字的开始和最后一个字的结束，前后各留约 0.1 秒。

## project.json

```json
{
  "brand": {"logo": "小Lin说", "label": "AI生成 · 实验作品 · 非本人", "endToon": "toon/wave.png"},
  "voice_db": -19.5,
  "music": [{"src": "music/bgm_playful.mp3", "t0": "CH1", "t1": "S15.end+0.3", "off": 0, "clip": 0.26, "card": 0.8}],
  "sting": {"src": "music/title_sting.mp3", "at": "TITLE+0.75"}
}
```

- `brand.logo` 右上台标，`brand.label` 左上 AI 标注（出镜画面是 AI 生成时必须保留；用真人实拍素材时可以为空），`brand.endToon` 片尾卡的透明 PNG（可选）。
- `theme`：7 套主力画风 `"finance"`（默认）、`"press"`、`"terminal"`、`"banknote"`、`"casefile"`、`"chalk"`、`"pixelgame"`；旧主题 `"blueprint"`、`"desk"`、`"editorial"`、`"finance_classic"`、`"press_classic"`、`"terminal_classic"`（旧名 `tech`、`plain` 仍可用），也可以写对象覆盖局部，见 `layouts.md` 的"主题"。`en_labels`：`false` 时删掉全部英文副标。
- `prop_look`：本期道具的画风 id（20 种之一，目录在 `templates/prop_styles.json`，选法见 `treatment.md` 第 4 节），决定道具的阴影方式。不写时用主题默认画风。
- `music`：每段音乐的起止时刻、从源文件第几秒开始（`off`）、说话时的增益（`clip`）和卡片或停顿时的增益（`card`）、淡入淡出（`fi` `fo`）。音乐不够长时自动循环并交叉淡化。
- 时刻写法：秒数，或 `"片段id"`（片段开始），或 `"片段id.end"`（片段结束），后面可以加 `+0.3` 或 `-0.15`。
- `sting`：片名重击音。脚本找到音频里最强的起音点，把它对齐到 `at`。

## 分镜脚本（scenes.py）

分镜脚本由 `story_core.py` 用 `exec` 执行，可以直接使用下面这些名字。一个工程可以拆成多个分镜文件，按顺序传给 `story_core.py`。

### `G(id)`：片段句柄

- `S = G('S12')`；`S.t0`、`S.t1` 是片段的绝对起止秒，`S.d` 是时长，`S.say` 是朗读文本。
- `S.k('关键词', off=0)`：这个词被说出的绝对时刻，加上偏移。
- `S.at(0.5)`：片段内按比例取时刻（0 到 1）。

关键词计时的原理：去掉标点后，按关键词在 `say` 里的字符位置，在 `[t0 + 0.10, t1 − 0.16]` 之间线性插值。误差没有精确测量。v6 审片时，入场提前 0.15–0.3 秒看起来能对上；语速不均的长句误差会更大。所以：

- 元素入场用 `S.k(词, -0.15)` 到 `-0.3`，略早于词出现。
- 关键词必须是 `say` 里原样出现的字符串，找不到会报 `KeyError`。同一个词出现两次时，取第一次，要用更长的词组区分。
- 关键词在句首时，`S.k(词, -0.3)` 会早于片段起点，和上一段重叠。用 `max(S.t0, S.k(词, -0.3))` 截住。
- 需要精确对齐时，用转写结果的词级时间戳替换 `say` 的插值（未内置）。

### `Scene(name, t0, bg, **opts)`：一个场景

- `name` 全片唯一。`bg` 见 layouts.md 的背景表。`opts`：`sway` `persp` `fg`。
- `sc.add(kind, t, **props)` 添加元素，返回元素字典（之后还可以改）。
- `sc.cam(t, x=, y=, s=, rx=, ry=, rz=, d=)` 添加镜头关键帧，可以链式调用。
- `sc.fx(t, 'shake'|'flash', ...)` 添加特效。

### `show(sc, t0, t1, aroll='hide', **kw)`：上屏

- 在 `[t0, t1]` 内显示场景 `sc`。同一个场景可以多次 `show`，例如中间插一段全屏出镜后再回来。
- `aroll`：`hide` 不显示出镜；`pip` 圆形画中画（`pip='br'|'bl'|'tr'`，`pipd` 直径，默认 330）；`piprect` 左侧竖向矩形（`px` `py` `pw` `ph` 可改）；`full` 出镜全屏。
- 没有被任何 `show` 覆盖的 `clip` 时间，自动填成全屏出镜。每隔一次推近到 1.13 倍。
- 两次 `show` 之间留缝或重叠时，`story_core.py` 会打印 `gaps/overlaps`。正常输出是空列表。

### 其他

- `sfx(t, name)` 加音效。可用：`whoosh` `swish` `whip` `glitch` `shimmer` `ding` `pop` `kaching` `buzz` `marker` `typing`。也可以在 `sc.add(..., sfx='whoosh')` 里直接写。
- `add_doc(...)` 和 `look(...)`：见 layouts.md 的 `docpage`。
- `KF.append(('标签', 绝对秒))`：登记审片关键帧。每个场景至少登记 1 张，通常取场景结束前 0.3 秒（元素全部入场后）。

### 转场

`story_core.py` 在 `build()` 里自动给场景边界分配转场，规则见 style-bible.md 第 7 节。同一场景的两次 `show` 之间不加转场。手动改法：在分镜脚本里改 `TCYCLE`（按边界类型轮换的列表，`'cut'` 表示硬切），或改 `TDUR`。

## 审片和质检

```bash
python3 story_core.py timeline.json scenes.py
python3 -c "import json;print(' '.join(str(f) for _,f in json.load(open('keyframes.json'))))" | xargs node render.mjs stills stills/k1
python3 <skill>/scripts/sheet.py stills/k1 keyframes.json 6   # 每张拼图 6 帧，带标签
```

- `render.mjs stills` 逐帧报错但不中断，输出里的 `FAIL` 行是失败帧，常见原因是图片路径不存在。
- 整片渲染后运行 `python3 <skill>/scripts/audit.py video.mp4 72`：每 72 帧对比一次视频帧和单独渲染的静帧，块差 > 38 的帧会被标记，并写入 `stills/audit/flagged.jpg`。v4 曾出现静帧正常、视频里渐变字变成色块的问题，这一步就是为了发现这类问题。

## 渲染性能和稳定性

- `render_chunks.sh` 每 1800 帧一块，每块启动一个新的 Chrome，避免长时间线内存溢出。重跑时，已完成的块会跳过。
- 实测：12 分钟 1080p24（17,460 帧）在 Apple M1 8 核、并发 4 时约 12 分钟。
- 600px 以上的渐变立体字会让 headless Chrome 卡住。`GText` 已限制立体层数（最多 6 层）和模糊半径。不要绕过这个限制。
