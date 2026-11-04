# 版式组件参考

所有元素用 `sc.add(kind, t, **props)` 添加。`t` 是入场时刻（绝对秒）。坐标是世界坐标：镜头在缩放 s=1、对准 (960, 540) 时，看到的就是 1920×1080 的区域。

屏幕坐标换算：`屏幕 x = (世界 x − 镜头 x) × s + 960`，y 同理（中心 540）。

## 共用参数（所有元素）

| 参数 | 含义 |
|---|---|
| `x` `y` | 元素中心（世界坐标） |
| `s` | 元素缩放 |
| `rot` `rx` `ry` | 平面旋转、绕 X 轴和 Y 轴的 3D 倾斜（度） |
| `z` | 景深层，影响虚化强度。`nodof=True` 关闭虚化，主体元素都要加 |
| `anim` `ad` | 入场动画和时长。`up` `down` `left` `right` `pop` `zoom` `slam` `flip` `flipy` `fade` `none`。`fly3d` 由引擎分配给 doc、chart、photo |
| `out` `od` `oanim` | 退场时刻、时长；`oanim='up'` 向上退出 |
| `lit` | `[[t0, t1], ...]`：这段时间内亮起，其余时间压暗 |
| `dimBlur` `litScale` | 压暗时的虚化量、亮起时的放大比例 |
| `layer='screen'` | 放在屏幕层，不随镜头移动（片名、角标） |
| `sfx` | 入场音效名，自动写进 `sfx.json` |

## v6 主版式（els6.tsx）

### `bignum` 巨型数字

```python
sc.add('bignum', t, x=900, y=455, v='30', count=[15, 30, 0], ct=S.k('三十块', -0.15), cd=0.8,
       size=560, unit='元', kicker='一杯咖啡', cap='从 15 元涨到 30 元', en='PRICE PER CUP',
       anim='zoom', ad=0.5, nodof=True, sfx='whoosh')
```

- `v` 显示的值；`count=[起, 止, 小数位]` 从 `ct` 开始滚动 `cd` 秒。
- `size` 数字字高（px），常用 460–620。`unit`/`us` 单位和字号；`kicker` 上方标题；`cap` 下方说明；`en` 英文小字。
- `grad` 渐变（默认 `lime`），`glow` 光晕，`sep` 千分位，`align` 对齐方式。
- 两个数字对比：放两个 `bignum`，左右各一，中间放 `tag` 写 "vs"。

### `wall` 卡片墙

```python
sc.add('wall', t, x=960, y=560, cols=3, cw=640, ch=560, gap=50, nodof=True, cards=[
    dict(word='天气', size=200, ty=0.12, en='WEATHER', es=26, sub='产地干旱', ss=46,
         icon='icons/hourglass.png', ih=0.4, iy=0.3), ...],
    focus=[[t, -1], [S.k('第一', -0.2), 0], [S.k('第二', -0.2), 1]])
```

- `focus=[[时刻, 卡片序号], ...]`：该时刻起这张卡亮，其余压暗并虚化。`-1` 表示全部亮。
- 卡片：`word` 大字，`size` 字号，`ty` 大字的纵向位置（占卡高的比例），`en`/`es` 英文和字号，`sub`/`ss` 说明和字号，`icon`/`ih`/`iy` 图标路径、高度比例、位置。
- 镜头跟随：每次换焦点，`sc.cam(t, x=卡中心x, y=..., s=1.18, d=0.8)`。卡中心 x = `X + (i − (cols−1)/2) × (cw + gap)`。
- 墙的总宽要大于画面（R1）。3 张 640 宽的卡加间距约 2020px，正好超出画面。

### `paper` 白卡图表

```python
sc.add('paper', t, x=880, y=500, w=1640, h=860, kind='col', title='咖啡豆期货价格', en='COFFEE FUTURES INDEX',
       kicker='2024 — 2026', unit='指数', src='来源：……', bw=180, vs=40, ls=32, stag=0.12,
       cols=[dict(l='2024', v=100), dict(l='2025', v=160), dict(l='2026', v=230)],
       hi=[[t, -1], [S.k('翻了一倍多'), 2]], anim='up', ad=0.6, rot=-2, nodof=True, sfx='whoosh')
```

- `kind='col'`：竖柱，数据在 `cols`。`kind='barh'`：横条，数据在 `rows=[dict(l, v, s?, dt?)]`，`lw` 是标签列宽，`bt` 是条的粗细。
- `hi=[[时刻, 序号]]` 高亮某根柱或某条（`-1` 表示不高亮）。`max` 固定刻度上限。`stag` 逐根入场的间隔。
- `title` 在深色标题条里显示为金色渐变字；`en` 英文小字；`kicker` 标题上方的小字；`src` 左下角来源。
- 卡片底边的屏幕 y 要 ≤ 900，否则底部标签会被字幕（屏幕 y 905–960）盖住。有 `src` 时，柱的底线自动上移 30px。
- 放在深色背景上，`rot=-2` 到 `-3` 轻微倾斜。

### `docpage` 整页文档（用 `add_doc` 添加，不要直接 `sc.add`）

```python
paras = [('title', '国务院关于……的办法'), ('meta', '2024 年 9 月 · 第一条'), ('gap', ''),
         ('p', '……原文……[[0|需要高亮的原文片段]]……原文……')]
marks = [dict(t=S.k('关键词', -0.15), kind='hl')]          # kind: hl | box | under；可加 c=颜色、d=时长
D = add_doc(sc, t, paras, x=1000, y=780, marks=marks, w=2300, size=64, anim='up', ad=0.5, logo='gov.cn')
look(sc, t, 1000, D['lines'][0] + 330, 1.0, 0.1)                                   # 先看标题
look(sc, S.k('关键词', -0.45), D['m'][0][0], D['m'][0][1], 1.22, 0.9, D['left'], D['left'] + 2300)  # 推到高亮处
```

- 段落类型：`title` 居中大标题，`meta` 小字信息行，`p` 正文（自动折行，避免标点出现在行首），`gap` 空行。
- `[[序号|文字]]` 标出要高亮的片段。序号对应 `marks` 列表。跨行的片段按行依次刷过。
- 返回值：`D['m'][i] = (中心x, 中心y, 左x, 右x)`，`D['lines']` 是每行中心的 y，`D['left']` 是纸的左边。
- 纸宽 2300 比画面宽，左右边缘被裁切（R1）。`look()` 的 `xmin`/`xmax` 防止镜头移出纸面。
- 背景用 `{'type': 'paper'}`，画中画用 `aroll='pip', pip='br'`。
- 正文只放能核对来源的逐字引用。

### `ent6` 实体卡

```python
sc.add('ent6', t, x=700, y=520, w=440, h=620, c='us', name='美国', en='UNITED STATES', strip='大买家', ss=60,
       anim='flipy', ad=0.6, nodof=True, sfx='whoosh')
```

- `c` 国旗代码，只支持 `cl` `cn` `de` `fr` `jp` `us`。其他国家要在 `els.tsx` 的 `Flag` 里加。
- `name` 金色大名，`ns` 字号；`en` 英文小名；`strip` 底部白条文字，`ss` 字号；`tag` 卡上方标签。
- 一排 2–4 张。主角卡放中间，并且做得更大（`w`/`h` 加大 15%）。

### `formula6` 大公式条

```python
toks = [dict(s='价格', t=t0, icon='icons/coins.png', l='一杯的价格', en='PRICE'),
        dict(s='=', op=True, t=S.k('等于', -0.1)),
        dict(s='豆子', t=S.k('豆子', -0.2), icon='icons/treasure.png', l='原料', en='BEANS'), ...]
sc.add('formula6', t0, x=1210, y=520, pw=1280, ph=860, fs=104, gap=6, iw=240, ih=118, lfs=28,
       title='一杯咖啡的价格', en='WHAT YOU PAY FOR', toks=toks,
       hl=[[S.k('豆子', -0.1), 2]], strike=[[t, 序号]], anim='up', ad=0.6, nodof=True, sfx='whoosh')
show(sc, t0, t1, aroll='piprect')
```

- token：`s` 文字，`op=True` 表示运算符（不带图标），`t` 出现时刻，`icon`/`l`/`en` 下方的图标、说明和英文。
- `hl=[[时刻, token 序号]]` 当前项加高亮框，`dimOthers` 压暗其他项；`strike` 手绘划掉；`foot`/`ffs` 底部注释和字号。
- token 列宽等于 `iw`。`iw` 必须 ≥ 字数 × `fs`，否则 token 会换行成竖排。4 个两字词加 3 个运算符：`fs=104, iw=240, pw≈1280`。
- 配 `aroll='piprect'` 时，面板左边缘的屏幕 x 要 ≥ 600。

### `ui` 白底计算器

```python
fields = [dict(l='每杯价格', v='30', u='元', t=S.k('三十块', -0.2)), dict(l='一年天数', v='365', u='天', t=...)]
res = [dict(l='一年花费', f='30×365', v=10950, u='元', t=S.k('一万零九百五十块', -0.6), total=True)]
sc.cam(t0, x=960, y=540, s=1.0)
sc.add('ui', t0, x=1290, y=540, w=1180, h=880, lw=420, title='咖啡开销计算器', sub='每天一杯',
       fields=fields, res=res, anim='up', ad=0.6, nodof=True, sfx='whoosh')
show(sc, t0, t1, aroll='piprect')
```

- 字段在时刻 `t` 逐个填入。结果从 `from`（默认 0）滚到 `v`；`dec` 小数位，`pre` 前缀，`u` 单位（默认"元/月"，一定要按场景改），`f` 算式小字，`total=True` 用大号紫色字。
- `lw` 是左侧字段列宽，`rtitle` 是结果区标题。
- 背景用 `{'type': 'paper'}`。

## 片名、章节、片尾

```python
sc = Scene('title', T.t0, {'type': 'title'}, sway=0)
sc.add('titlecard', T.t0 + 0.05, layer='screen', l1='为什么', l2='咖啡', l2b='越来越贵', q='？', en='Why ...', slam=0.7)
sc.fx(T.t0 + 0.75, 'shake', a=16, d=0.32)
```

- 片名：`l1` 小字一行，`l2` 黄色超大字，`l2b` 跟在 `l2` 后的小一号字，`q` 问号，`en` 英文副标题，`slam` 重击时刻（相对秒）。
- 章节：`l1=''`，`l2` 写章节名，`s2` 字号（8 字以内 150，更长 132），`y2`/`ye`/`se` 位置和英文字号；上方加 `tag` 写 `PART 01`。
- 片尾：`Scene('end', t, {'type': 'end'})` 加 `sc.add('endcard', t, layer='screen')`。`project.json` 的 `brand.endToon` 可以给一张透明 PNG，显示在片尾卡右侧。

## 背景 `Scene(name, t0, bg)`

| `type` | 用途 | 选项 |
|---|---|---|
| `dark` | 深色几何底（默认） | `v` 色块布局 0–3；`particles=True` 金色 ¥ 粒子（`seed`）；`shapes=False` 去掉色块；`photo` 换成虚化压暗的照片底（`blur` 默认 10，`bright` 默认 0.35）；`base` 底色 |
| `paper` | 白纸整屏 | `base` 底色 |
| `broll` | 实拍或 AI 图整屏 | `img` 或 `video`（相对 public/），`dim` 压暗，`sat`，`bright`，`bw` 黑白，`pre` 视频起点秒；推拉：`s0`→`s1`、`x0`→`x1`、`y0`→`y1`，在 `t1` 秒内完成 |
| `title` | 片名和章节卡（胶片条、手绘涂鸦） | 无 |
| `end` | 片尾 | 无 |
| `none` | 透明 | 无 |

场景级选项（`Scene(..., sway=0.5, persp=2300, fg=None)`）：`sway` 3D 摇摆幅度，`persp` 透视距离，`fg` 前景虚化道具（`True` 强制显示，`False` 关闭）。

## 镜头和特效

- `sc.cam(t, x=, y=, s=, rx=, ry=, rz=, d=1.0)`：从时刻 t 起，用 d 秒缓入缓出移到新位置。第一条关键帧是起始状态。停稳后画面缓慢推近，最多放大 5%。
- `look(sc, t, cx, cy, s, d, xmin, xmax)`：同上，可以限制镜头不移出纸面。
- `sc.fx(t, 'shake', a=14, d=0.3)` 震动；`sc.fx(t, 'flash', d=0.25)` 闪白。

## 基础元素（els.tsx，v4/v5 留下的，可以和 v6 版式混用）

| kind | 用途 | 主要参数 |
|---|---|---|
| `tag` | 柠檬黄小标签 | `txt` `c` `size` |
| `txt` | 自由文字 | `txt` `size` `font` `grad` `italic` `en` |
| `card` | 数据卡（深蓝底金边） | `label` `value` `unit` `sub` `icon` `theme` `count` |
| `concept` | 大字概念卡 | `word` `en` `icon` `grad` |
| `panel` | 3D 倾斜大面板 | `title` `en` `w` `h` `theme` `photo` |
| `icon` | 2.5D 图标 | `src` `size` `label` `gray` |
| `people` | 小人一排，可点亮 n 个 | `n` `litn` `lt` `src` |
| `formula` | 旧版公式（小） | `items` `focus` |
| `slider` | 刻度滑块 | `min` `max` `a` `b` `unit` `label` |
| `stack` | 堆叠方块 | `n` `nw` |
| `pillar` `roof` | 三支柱和屋顶 | `title` `sub` `icon` `state` / `txt` |
| `flag` `entity` | 国旗、旧版实体卡 | `c` `shape` / `name` `en` |
| `doc` | 旧版小文档 | `lines` `org` `seal` |
| `chart` | 深色折线图 | `pts` `labels` `min` `max` `unit` |
| `bars` | 深色横条 | `rows` `max` |
| `photo` | 照片卡 | `src` `cap` `en` `w` `h` `pos`（裁切焦点）`bw` 黑白；`credit` 卡底署名、`cs` 字号 |
| `meme` | 梗字（粗白字黑边） | `txt` `burst` `tilt` |
| `bubble` `comment` | 对话气泡、弹幕评论卡 | `txt` `side` / `name` `meta` `txt` `av` |
| `stamp` | 印章 | `txt` `c` `tilt` |
| `toon` | 透明 PNG 角色（`public/toon/<src>.png`） | `src` `size` `wig` |
| `spark` `box` | 闪光点、色块 | `c` `size` / `w` `h` `bg` `r` |
| `coinflow` `arrow` `scribble` | 金币流、箭头、手绘圈（屏幕绝对坐标） | `from` `to` `n` / `from` `to` `bend` / `shape` `c` |

模板自带 25 个图标（`icons/*.png`）：baby calculator calendar city coins elderly_couple explode gov gymcard hourglass moneybag office pie piggy piggy_cracked runner safe salary scissors shield shopping sscard treasure wallet_empty young_worker。新图标用图像生成工具生成 2.5D 卡通风格的透明 PNG，放到 `public/icons/`。
