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

### `webshot` 真实网页截图（用 `add_web` 添加）

来源本身是网页时（新闻报道、GitHub 仓库或文件、机构报告页、产品官网），优先放真实截图，比 `docpage` 重排更有说服力。截图用 `scripts/web_shot.mjs` 拍（见 `research.md` 的"真实素材"），文件放 `public/shots/`。

```python
PC = 'shots/pcmag.png'
y1 = web_y(PC, 'speedrun deleting your inbox', 0.42)        # 让这句停在视窗 42% 高度的滚动位置
W = add_web(sc, t0, PC, x=960, y=520, w=1640, h=860, url='pcmag.com/news/…',
            sy=[(t0, 0), (S.k('删光了', -0.75), y1, 0.7)],   # 滚动关键帧：(时刻, 截图像素 y, 时长)
            marks=[dict(t=t0 + 0.3, q='Accidentally Deleted Her Emails', kind='under', out=S.k('删光了', -0.8)),
                   dict(t=S.k('删光了', -0.2), q='speedrun deleting your inbox', kind='hl', spot=True),
                   dict(t=S.k('毫无办法', -0.2), q="I couldn't stop it from my phone.", kind='under', spot=True)],
            anim='up', ad=0.45, nodof=True, sfx='whoosh')
sc.cam(t0, x=960, y=520, s=1.0).cam(S.k('删光了', -0.75), x=W['m'][1][0], y=W['m'][1][1], s=1.22, d=0.8)
```

- 画面是带红黄绿三点和锁形地址栏的浏览器外框，`url` 写真实地址（可以截短）。截图在框内按 `sy`（或横向 `sx`）关键帧滚动。
- `marks` 的 `q` 必须是拍截图时 `--boxes` 里写过的短语，坐标从 `<png>.boxes.json` 读；没有文字可定位时（曲线图、图片）用 `r=[[x, y, w, h]]` 直接给截图像素框。
- `kind`：`hl` 荧光笔按行扫过，`under` 红色下划线，`box` 红框，`none` 只做聚光不画线。`spot=True` 把框外压暗（当前项最亮）；同时生效的几个聚光会合成一个区域，新标记出现时聚光框平滑扩过去。`out=` 让标记和聚光在该时刻淡出。
- 返回 `W['m'][i]` 是第 i 个标记在它出现时的世界坐标（已算上滚动），镜头直接推过去。截图正文字小，推到 `s=1.2–1.6` 才看得清；整框 `w=1640` 加推近后被画面边缘裁切，符合 R1。
- 标记的屏幕 y 要在 880 以上，避开字幕。换行处只剩引号之类的窄碎片框（宽 < 24px）会被自动丢掉。
- 背景用深色（`{'type': 'dark'}`），白色网页本身就是这一拍的白页。不要放在 `paper` 上，白框压白底没有层次。

### `logo` 真实 Logo

```python
sc.add('logo', S.k('WhatsApp', -0.15), x=400, y=345, src='logos/whatsapp.png', size=150, label='WhatsApp',
       lc='#2a2730', anim='pop', ad=0.3, nodof=True, sfx='pop')
```

- 白色圆角片上放 Logo，下方 `label` 写名称（`lc` 名称颜色，深色背景上用默认的白色）。`fill` 是 Logo 占片的比例（默认 0.62），`bg` 可换片底。
- Logo 用 `scripts/commons_logo.py` 取，PNG 和 SVG 都可以。不改色、不变形、不和别的元素拼成新标志。
- 多个 Logo 排成规整网格，关键词点到的先单独弹出，其余一起出。印章、标签不要压在 Logo 和名称上。

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

## v7 扩展版式（els7.tsx）

8 个版式都读主题 token，所有主题下都能直接用。它们是**骨架**：直接用只会得到通用图表，每期必须按 `treatment.md` 放上选题的照片背景和道具。每个版式的素材槽写在各小节末尾，完整用法见 `templates/scenes_treat.py`。共同规则：
- 折线图、饼图、地图画在图表纸面上（和 `paper` 同一种材质，有 `title`、`kicker`、`unit`、`src`）。时间轴、流程图、树状图、对比、关系图的方块用卡片墙同款的主题卡片。
- `focus=[[时刻, 序号或 id], ...]` 点亮当前项，其他项变暗。`-1` 表示全部点亮。
- 每一项都可以带自己的 `t`，用 `S.k('关键词', -0.2)` 卡在台词上。
- 只有骨架的示例在 `templates/scenes_gallery.py`（时间线 `templates/timeline_gallery.json`）。骨架加照片和道具的示例在 `templates/scenes_treat.py`（时间线 `templates/timeline_treat.json`，素材在 `templates/demo_assets/`），写分镜时以它为准。
- 卡片底边的屏幕 y 要 ≤ 900，避开字幕。

### `line6` 折线图
```python
sc.add('line6', t, x=960, y=515, w=1640, h=870, title='咖啡豆价格指数', kicker='2016 — 2025', unit='指数', src='来源：……',
       xs=['2016', ..., '2025'], series=[dict(v=[100, 92, 80, ...], l='阿拉比卡')],
       bands=[dict(a=4, b=6, l='疫情期间', t=S.k('疫情'))], pins=[dict(i=6, s='2022 高点', t=S.k('最高点'))],
       reveal=[[t + 0.5, 4], [S.k('二零二二'), 6], [S.k('新高', -0.7), 9]], anim='up', ad=0.6, nodof=True)
```
- 线从左往右画出，耗时 `gd` 秒，从 `t + bt` 开始（`bt` 默认 0.35）。可以有多条线，每条线可设 `t`、`d`、`c`、`l`（线尾的名称）。
- `reveal=[[时刻, 序号], ...]` 让线跟着台词分段画：每个时刻画到第几个点，每段耗时 `rd`（默认 0.9 秒）。讲走势时优先用 `reveal`，不要让线在台词讲到之前就画完。
- 纵轴刻度自动取整（1、2、2.5、5 的倍数）。`min`、`max`、`ystep` 可以手动指定，`yt=False` 隐藏刻度，`xstep` 控制横轴标签的间隔。
- `bands`：按横轴序号 `a` 到 `b` 加底色带，带上方显示 `l`。`pins`：在第 `i` 个点上钉一个标签，`below=True` 时标签在点的下方。
- 第一条线下方默认有浅色填充，`area=False` 关闭。
- 素材槽：`series[i].rider = dict(src, w=150, orient=0.5, hop=7, ay=0.86)`。道具骑在线头上随线前进，`orient` 是跟随线段斜率转动的比例，`ay` 是道具的落脚点（占道具高度的比例）。

### `timeline6` 时间轴
```python
sc.add('timeline6', t, x=1100, y=540, items=[dict(y='1652', l='第一家咖啡馆', s='伦敦', t=S.k('一六五二')), ...],
       gap=520, cw=420, ch=200, gd=0.9, focus=[[t, -1], [k1, 0], [k2, 1], ...], anim='fade', ad=0.3, nodof=True)
```
- 横轴先长出来，事件卡在轴的上下交替出现（`side='up'|'down'` 可以手动指定），年份写在卡的另一侧。
- 宽度是 `2*pad + gap*(n-1)`，5 个以上事件会比画面宽，这时用 `sc.cam` 跟着当前事件平移，最后可以拉远（`s=0.9`）显示整条轴。
- 素材槽：`items[i].icon`，放本期道具（实物）而不是通用图标。

### `pie6` 饼图和环形图
```python
sc.add('pie6', t, x=960, y=515, w=1600, h=870, title='一杯咖啡的成本', src='……',
       slices=[dict(l='房租', v=30, t=S.k('房租')), dict(l='豆子', v=10, t=S.k('豆子')), ...],
       donut=0.55, center=dict(v='30', l='元 / 杯'), hi=[[t, -1], [S.k('豆子'), 1]])
```
- 扇区按顺序扫开，右侧是图例（色块、名称、百分比）。`hi` 把一个扇区往外推出，同时点亮对应的图例行。
- `donut=0` 是实心饼图。`center` 只在环形图里显示。占比小于 `minIn`（默认 7%）的扇区不在扇区上写百分比。
- 百分比按 `v` 的总和自动算，`s` 可以覆盖图例里显示的值，`p` 可以覆盖扇区上的文字。
- 素材槽：`img` 放一张正俯视的圆形实物图（拿铁、披萨、蛋糕、硬币），按扇区切开；`tint`（默认 0.2）是扇区色的叠加强度，`iz` 是图片放大倍数。用 `img` 时一般设 `donut=0`。

### `flow6` 流程图
```python
sc.add('flow6', t, x=960, y=640, steps=[dict(l='种植', t=S.k('种植')), ..., dict(l='萃取', s='你手里的这一杯', t=S.k('萃取'))],
       bw=300, bh=230, gap=100, loop=dict(l='下一批豆子', t=S.k('下一批')), focus=[...])
```
- 每一步出现前，先画出指向它的箭头。`al` 是箭头上的小字。每张卡左上角有步骤号，`num=False` 关闭。
- `loop` 从最后一步画一条弧线回到第一步（`from`、`to` 可以改），弧线下方显示标签。
- 宽度是 `n*bw + (n-1)*gap`，5 步以内能放进一个画面。
- 素材槽：`bare=True` 不画卡片，每步只留 `steps[i].img`（实物道具）、标签和箭头。选题里每一步都对应一个看得见的东西时，优先用 `bare`。

### `tree6` 树状拆解
```python
root = dict(id='p', l='利润', c=[dict(id='r', l='收入', op='+', c=[dict(l='咖啡'), dict(l='甜点')]),
                                 dict(id='c', l='成本', op='−', c=[dict(l='原料'), dict(l='房租'), dict(l='人工')])])
sc.add('tree6', t, x=960, y=545, root=root, bw=320, bh=150, gx=46, lv=300, focus=[[t, 'p'], [k1, 'r'], [k2, 'c']])
```
- 从上往下逐层展开，连线是直角折线。`op` 是分支上的运算符徽章（`+`、`−`、`×`），适合"利润 = 收入 − 成本"这类拆解。
- 节点不写 `t` 时，按层级加同级序号的间隔自动入场。`focus` 可以用节点 `id`，也可以用深度优先顺序的序号。
- 宽度按叶子数算：`叶子数*bw + (叶子数-1)*gx`。最多 3 层、6 片叶子，再多就拆成两个镜头。
- 素材槽：节点 `icon`，放在卡片左侧。

### `map6` 世界地图（示意图）
```python
sc.add('map6', t, x=960, y=515, w=1700, h=900, title='咖啡从哪里来', view=[-125, -42, 150, 62],
       hi=[dict(id='BRA', l='巴西', at=[-52, -10], t=S.k('巴西'))],
       routes=[dict(a=[-38, -13], b=[-74, 40.7], bend=-0.25, flow=True, t=S.k('美国', -0.5))],
       pts=[dict(lon=-74, lat=40.7, l='美国', side='l', t=S.k('美国'))])
```
- 数据：Natural Earth 1:1.1 亿国界（公有领域），已用 Natural Earth I 投影预先算成路径，存在 `src/geo/world110.json`。生成脚本是 `scripts/build_world.py`。台湾并入中国一起着色，南极洲已删除。
- `view=[西经, 南纬, 东经, 北纬]` 裁出要显示的范围，按比例放进纸面。`hi` 用 ISO 3166 三位代码给国家上色，`l` 和 `at`（经纬度）加国名标签。
- `routes` 是带箭头的弧线航线，`bend` 控制弯曲方向和程度，`flow=True` 时画完后有圆点沿线移动，`l` 是线中间的标签。`pts` 是脉冲圆点加标签，`side` 是标签方位（`r`、`l`、`t`、`b`）。
- `surface='none'` 不画纸面，陆地直接画在背景上。
- 素材槽：`routes[i].vehicle = dict(src, w=150, orient=0.5, ay=0.6, stay=False, loop=False, sp=0.22)`，载具（货轮、飞机、卡车）沿航线开，边开边画线，耗时 `d`（有载具时默认 2.4 秒）；到港后淡出，箭头随后出现，`stay=True` 时留在终点。`pts[i].img` 和 `iw` 用道具（麻袋、人物）代替脉冲圆点。多条航线错开 0.4 秒左右出发，最后一条要在场景结束前 1 秒到港。
- **合规**：这是低精度示意图，不符合中国大陆公开出版地图的审核要求。台湾已并入中国着色，但南海诸岛、藏南、阿克赛钦等区域的边界都没有按中国标准地图绘制。凡是涉及中国疆域的地图，必须改用自然资源部标准地图服务系统（bzdt.ch.mnr.gov.cn）的图片，并在画面上标注审图号。

### `vs6` 左右对比
```python
sc.add('vs6', t, x=960, y=515, w=1720, h=760,
       a=dict(l='精品咖啡馆', v='40', u='元', s='一杯拿铁', pts=[dict(s='一天卖 200 杯', t=S.k('两百杯'))]),
       b=dict(l='连锁咖啡店', v='15', u='元', s='一杯拿铁', pts=[...]), focus=[[t, -1], [ka, 0], [kb, 1]])
```
- 两张大卡加中间的 VS 徽章（`vs` 可以换成别的字，比如"≈"或"→"）。每侧有名称（可加 `flag` 国旗或 `icon`）、大数字 `v` 和单位 `u`、说明 `s`、逐条出现的要点 `pts`。
- 适合两国、两家公司、两种方案、前后变化的对比。三项以上用 `wall` 或 `paper`。
- 素材槽：`a/b.pic` 是每侧右上角的插画（店面、产品、人物）；`a/b.row = dict(src, n, t, iw=84, dt=0.07)` 在卡片底部排一排象形图标，用个数表示数量（比如每个杯子代表 100 杯）。

### `graph6` 关系图
```python
nodes = [dict(id='brand', l='咖啡品牌', x=820, y=450, w=400, h=180), dict(id='inv', l='投资方', x=260, y=140, t=ki), ...]
edges = [dict(a='inv', b='brand', l='持股 51%', t=ki + 0.4), dict(a='fr', b='brand', l='管理费', bend=0.5, flow=True), ...]
sc.add('graph6', t, x=960, y=570, w=1800, h=900, nodes=nodes, edges=edges, focus=[[t, 'brand'], [ki, 'inv'], ...])
```
- 节点坐标是元素内部坐标（左上角为 0,0，`x`、`y` 是节点中心）。`round=True` 是圆形节点（直径 `d`）。节点可以放 `logo`（真实 Logo）、`flag`（国旗）或 `icon`。
- 边是带箭头的曲线，`bend` 控制弯曲（两节点之间来回两条边各设 `bend=0.5`，会分到两侧），`two=True` 双向箭头，`dash=True` 虚线，`flow=True` 有圆点沿线流动（适合表示资金流），`l` 是线中间的标签。
- 适合股权结构、资金流向、阵营和联盟、供应链。节点最好不超过 7 个。
- 素材槽：节点 `img` 和 `iw` 把节点画成角色或实物（不画方块，标签在下方）；`mv=[[时刻, x, y], ...]` 让节点移动（公司气泡碰撞、合并）；边 `dot` 和 `dw` 用道具（金币、麻袋、信封）代替流动圆点。

## v8 道具（els8.tsx）

### `prop` 单个道具
```python
sc.add('prop', t, x=640, y=650, src='props/openclaw/lobster.png', w=420, idle='sway', anim='pop', out=t2, od=0.05)
sc.add('prop', t2, x=760, y=560, src='props/openclaw/envelope.png', w=110, to=[640, 170], arc=300, pd=0.75, ease='lin',
       spinTo=420, sTo=0.55, fadeEnd=True, copies=6, dt=0.22, loop=True, gap=0.6, anim='none')
```
- 透明 PNG 道具，`w`（和可选的 `h`）是外框，图片等比放进框里。投影按本期画风（`project.json` 的 `prop_look`，见 treatment.md 第 4 节）自动加：贴纸和实物是悬浮投影，纸类画风是贴纸面的薄阴影，像素是硬阴影，白线稿和霓虹是发光。`look='woodcut'` 给单个道具换阴影方式，`lift`（0–1）调投影深度，`noShadow=True` 关掉，`flip=True` 水平镜像。
- `tint='#33ff88'` 把整张道具染成一种颜色（按图片透明度做遮罩），用于把白线稿染成终端荧光绿或白纸上的蓝墨水。
- 待机动作 `idle`：`sway`（左右摆）、`breathe`（呼吸缩放）、`shake`（抖）、`wobble`（晃）、`spin`（转），`amp` 是幅度，`sp` 是速度。Place 的 `anim`、`out`、`od`、`float`、`dim`、`lit` 照常可用。
- 移动（相对 `x`、`y` 的位移）：`path=[[dx, dy], ...]` 折线路径，或 `to=[dx, dy]` 加 `arc`（抛物线高度，像素）。`pt` 是出发时刻（默认 `t`），`pd` 是耗时，`ease` 是 `io`、`out`、`lin`。`orient=True`（或 0–1 的比例）沿路径转向，`autoflip=True` 向左走时自动镜像，`hop` 加 `stride` 是走路的颠簸。`spinTo` 是全程转过的角度，`sTo` 是终点缩放，`fadeEnd=True` 在最后 15% 淡出。
- `loop=True` 重复整段移动（`gap` 是两次之间的停顿）。`copies=n` 加 `dt` 是同一路径上的 n 个道具，依次出发，适合信封飞进垃圾桶、钞票流走这类场面。
- 换姿势：同一角色的两个版本叠在同一位置，第一个用 `out` 在切换时刻退场，第二个在同一时刻 `anim='none'` 出现。

### `stack6` 象形图
```python
sc.add('stack6', t, x=960, y=560, src='props/coffee/cup.png', unit=100, u='杯', iw=80, per=2,
       cols=[dict(l='精品店', v=200, t=k1), dict(l='连锁店', v=1000, t=k2)], focus=[[k2, 1]])
sc.add('stack6', t, x=960, y=575, src='props/openclaw/pkg.png', iw=74, sd=1.4, drop=120,
       grid=dict(n=100, per=20, hi=37, alt='props/openclaw/pkg_bad.png', hiT=k, hiD=1.6, **{'from': 'random'}))
```
- 柱状模式：每 `unit` 个单位一个道具，逐个掉落堆成一柱（`sd` 是一柱的耗时，一柱超过 6 个道具时调到 1.2 秒以内，数值标签在一柱落完后才出现；`drop` 是掉落高度，`ov` 是上下重叠比例）。`per` 是一柱每行几个，每柱可设自己的 `src`、标签 `l`、数值文字 `s`。`focus` 压暗其他柱，`lab=False` 隐藏标签。
- 网格模式：`n` 个道具排成每行 `per` 个，从 `hiT` 开始在 `hiD` 秒内把其中 `hi` 个换成 `alt` 图（`from='random'` 随机位置，`'start'` 从头开始）。换掉的那些默认加红色光晕（`fx` 可以改），其余的同时变灰（`dim=False` 关闭）。适合"每 100 个里有 37 个"这类占比。
- 道具图要在 80 像素下也认得出：轮廓清楚、两种状态的颜色差别大。

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

### 主题（`project.json` 的 `theme`）

主题是**整套画风**：底图、材质、字体、配色、动效、片名卡和片尾卡一起换。它不绑定选题，同一套主题可以讲 AI、城市、医疗或任何题材；选题相关的东西（照片、道具、图表内容）每期按 `treatment.md` 另做。分镜代码不用改，`project.json` 里换一个词就能整片换风格。

#### 7 套主力风格（v1.6，推荐）

| 主题 | 画风 | 材质和底图 | 字体 | 动效 | 适合的叙事气质 |
|---|---|---|---|---|---|
| `finance`（默认）· 剪纸印刷 | 石墨纸上的撕边彩色剪纸，酸黄套印 | 深石墨艺术纸，四周是撕边色纸叠层；浅色页是未涂布纸 | 优设标题黑 / 思源黑体粗，导语宋体，数字 DIN | 纸片落下带短阴影，套印轻微错位 | 热闹、拆账、讲道理，大多数财经和民生题 |
| `press` · 报刊纸本 | 旧报纸拼贴和牛皮纸 | 新闻纸纤维，撕口纸条，边缘网点和老照片 | 思源宋体粗 | 纸条压印，红线划过 | 历史、人文、社会、国际，带"回看"感 |
| `terminal` · 复古终端 | 磷光命令行和针式打印纸 | CRT 外框和黑色显示面，扫描线；浅色页是带孔边的绿条打印纸 | Fusion Pixel 像素体 | 逐字打出、光标闪烁、轻微闪屏 | 技术、黑客、编程史、系统怎么运转 |
| `banknote` · 纸币雕版 | 钞票安全纸和凹版花纹 | 鼠尾草绿安全纸，雕刻花边和玫瑰线；片名在钞票椭圆框里 | 思源宋体 / 雕版宋体，数字衬线 | 落版、花边描线展开 | 钱、金融、货币、权威、正式 |
| `casefile` · 档案证据墙 | 软木板上的卷宗和照片 | 真实软木，马尼拉纸卡，图钉，红线，台灯光 | 宋体标题、黑体正文、手写红笔批注 | 卡片钉上、红线牵出、红笔圈注 | 调查、揭秘、事件复盘、谁在背后 |
| `chalk` · 黑板粉笔 | 教室黑板和练习纸 | 深绿石板，木框和粉笔槽，擦痕；浅色页是横线练习纸 | 马善政手写体，正文黑体 | 粉笔逐笔写出，下划线描出 | 讲原理、算账、教学、科普入门 |
| `pixelgame` · 像素关卡 | 8-bit 横版闯关 | 草地天空关卡（片名）、城堡砖墙（深色页）、像素边框的米色纸（浅色页） | Fusion Pixel 像素体 | 逐格跳帧、像素位移、通关下划线 | 游戏、互联网、年轻向、"闯关"式叙事 |

选法：先按叙事气质选，再看题材。同一个选题换主题会讲出不同的味道，比如"AI 会抢走谁的工作"，用 `terminal` 像技术解剖，用 `casefile` 像调查报道，用 `chalk` 像课堂讲解。拿不准时用演示工程把 2–3 套候选各渲一组关键帧给对方挑：

```bash
# 演示工程里：templates/timeline_cross.json + scenes_cross.py 是跨题材验证用的 9 个画面（AI、城市、医疗）
python3 story_core.py timeline_cross.json scenes_cross.py && node render.mjs stills stills/x <keyframes.json 里的帧号>
```

#### 旧主题（仍然可用）

| 主题 | 画风 |
|---|---|
| `blueprint` · 工程蓝图 | 蓝晒图纸，白色机械线稿，橙色尺寸线（旧名 `tech`） |
| `desk` · 桌面实物 | 胡桃木桌面，索引卡，便签，手写 |
| `editorial` · 现代杂志 | 米白纸面，超大粗黑体，一块品牌蓝（旧名 `plain`） |
| `finance_classic` `press_classic` `terminal_classic` | v1.2 的剪纸、报刊、终端旧版（钞票边框、照片底图、显示器实物） |

#### 结构和覆盖

- 7 套主力风格的代码在 `src/styles7/<id>.tsx`，每个文件自带主题 token、片名卡、片尾卡和材质部件；底图和纹理在 `public/styles7/`（`<id>7_dark_a/b`、`<id>7_title`、`<id>7_paper`，以及 `newsprint.jpg`、`security.jpg`、`cork.jpg`、`slate.jpg`、`paper_dark.jpg` 纹理）。旧主题的底图在 `public/plates/`，纹理在 `public/tex/`。全部是为这个技能生成的图像，不含任何选题内容。
- 每套主题有 `dark`（`v` 在 `plates` 里轮换）、`title`、`end`、`paper` 四种背景。单个场景可以用 `bg.plate='plates/xxx.jpg'` 换底图，`bg.plate=False` 不用底图，`bg.type='broll'` 压选题照片（见 `treatment.md`）。项目专属的底图要和主题材质一致，否则会跳戏。
- `titlecard` 的 `l1`、`l2`、`l2b`（强调色）、`q` 通用，`s1`、`s2` 是字号上限，`x`、`y`、`w`、`align='left'` 控制位置；长标题自动缩字号。`y1`、`y2`、`spy`、`sp1x` 只对 `finance_classic` 有效。
- 局部覆盖：`"theme": {"name": "chalk", "acc": "#f2d36b"}`。对象里写的字段会覆盖预设里的同名字段，字段表见 `src/theme.tsx`。`pal` 是图标砖块用的强调色。
- 每套主题有默认道具画风（`prop_look`）：`finance` `sticker25d`、`press` `engraving`、`terminal` `pixel16`、`banknote` `engraving`、`casefile` `product_photo`、`chalk` `lineart_white`、`pixelgame` `pixel16`。可以在 `project.json` 里改，见 `treatment.md` 第 4 节。
- 自制新主题：先用图像生成做一张风格板（同一套材质下的片名、深色页、卡片、数字、浅色页 5 个画面），对方认可后再做底图。底图四角或四边放材质物件、中心留空，**不放任何选题物件、文字和 Logo**，材质要具体（纸、木、石板、屏幕玻璃），光照统一，1920×1080 以上；每套至少 `dark` 两张，`title`、`paper` 各一张。代码照 `src/styles7/` 里任意一个文件的结构写，在 `src/styles7/index.ts` 注册。
- `"en_labels": false`（默认）删掉所有英文副标，包括片名 `en`、卡片 `en` 和片尾英文行。

### 图标砖墙 `tiles` 和 tech 图标

```python
sc.add('tiles', t, x=2900, y=520, cols=14, rows=8, ts=118, gap=26, seed=3, pop=[[t + 0.8, 12], [S.k('六千', -0.1), 40]], anim='fade', nodof=True)
```

- 满屏的应用图标方块，表示"很多个"（插件、Skills、应用）。`ts` 方块边长，`gap` 间距，`seed` 随机排列，`stag` 从中心向外依次出现的延迟（默认 0.045），`lo` 未点亮方块的不透明度（默认 0.5），`pop=[[时刻, 个数], ...]` 分批点亮成彩色。中间压一张 `concept` 卡写名称。
- `icon` 元素的 `src='tech:<名字>'` 画图标方块，名字有 `term` `chat` `file` `gear` `key` `lock` `warn` `cloud` `robot` `bolt` `mail` `search`。

## 镜头和特效

- `sc.cam(t, x=, y=, s=, rx=, ry=, rz=, d=1.0)`：从时刻 t 起，用 d 秒缓入缓出移到新位置。第一条关键帧是起始状态。停稳后画面缓慢推近，最多放大 5%。
- `look(sc, t, cx, cy, s, d, xmin, xmax)`：同上，可以限制镜头不移出纸面。
- `sc.fx(t, 'shake', a=14, d=0.3)` 震动；`sc.fx(t, 'flash', d=0.25)` 闪白。

## 基础元素（els.tsx，v4/v5 留下的，可以和 v6 版式混用）

| kind | 用途 | 主要参数 |
|---|---|---|
| `tag` | 柠檬黄小标签 | `txt` `c` `size` |
| `txt` | 自由文字 | `txt` `size` `font` `grad` `italic` `en` |
| `card` | 数据卡（深蓝底金边，`theme` 选配色，不跟随全局主题） | `label` `value` `unit` `sub` `icon` `theme` `count` |
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
