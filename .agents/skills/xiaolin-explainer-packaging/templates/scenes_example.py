# Demo storyboard: one scene per v6 layout. Run from the project root:
#   python3 story_core.py timeline.json scenes.py
# All numbers and the report text below are DEMO placeholders, not facts.
# Clamp scene starts with max(S.t0, ...) when the keyword opens the sentence, or the scene overlaps the previous segment.
# Coordinates are world pixels; the camera frames 1920x1080 around (x, y) at scale s.

# Host picture-in-picture over graphics scenes. Turn it on only when the A-roll clips show a real host
# that looks good small (a round window bottom-right, or a tall window on the left beside formula6 / ui).
# The demo clips are flat placeholders, so it stays off and the graphics get the whole frame.
HOST_PIP = False
PIP = dict(aroll='pip', pip='br') if HOST_PIP else {}
RECT = dict(aroll='piprect') if HOST_PIP else {}
FX, UX = (1210, 1290) if HOST_PIP else (1080, 960)   # piprect covers the left of the frame: shift formula6 / ui right

def title():
    T = G('TITLE')
    sc = Scene('title', T.t0, {'type': 'title'}, sway=0)
    sc.add('titlecard', T.t0 + 0.05, layer='screen', l1='为什么', l2='咖啡', l2b='越来越贵', q='？',
           en='Why Is Coffee Getting So Expensive?', slam=0.7)
    sc.fx(T.t0 + 0.75, 'shake', a=16, d=0.32)
    show(sc, T.t0, T.t1)
    KF.append(('title', T.t0 + 2.2))


def chapter():
    C = G('CH1'); name = '涨价的三个原因'
    sc = Scene('ch1', C.t0, {'type': 'title'}, sway=0)
    sc.add('titlecard', C.t0 + 0.02, layer='screen', l1='', l2=name, s2=150, y2=420, en='Three Reasons Behind the Price',
           ye=640, se=36, slam=0.12, sp1x=220, sp2x=1620)
    sc.fx(C.t0 + 0.2, 'shake', a=10, d=0.25); sfx(C.t0 + 0.12, 'whoosh')
    show(sc, C.t0, C.t1)
    KF.append(('chapter', C.t0 + 1.1))


def d01():
    S = G('D01')
    # 1) bignum: one giant number that counts up, cropped by nothing, with kicker + caption
    t0, t1 = max(S.t0, S.k('一杯咖啡', -0.3)), S.k('期货价格', -0.3)
    sc = Scene('price', t0, {'type': 'dark', 'v': 1})
    sc.cam(t0, x=930, y=500, s=1.15).cam(S.k('三十块', -0.2), x=930, y=520, s=1.0, d=1.0)
    sc.add('bignum', t0 + 0.02, x=900, y=455, v='30', count=[15, 30, 0], ct=S.k('三十块', -0.15), cd=0.8, size=560, unit='元',
           kicker='一杯咖啡', cap='演示数据 · 从 15 元涨到 30 元', en='PRICE PER CUP', anim='zoom', ad=0.5, nodof=True, sfx='whoosh')
    show(sc, t0, t1, **PIP)
    KF.append(('bignum', t1 - 0.3))
    # 2) paper col chart: white card on dark, dark title bar, last column lit
    t0, t1 = t1, S.t1
    sc = Scene('futures', t0, {'type': 'dark', 'v': 2})
    sc.cam(t0, x=900, y=540, s=1.0).cam(S.k('翻了一倍多', -0.3), x=980, y=560, s=1.1, d=1.2)
    sc.add('paper', t0 + 0.02, x=880, y=500, w=1640, h=860, kind='col', title='咖啡豆期货价格', en='COFFEE FUTURES INDEX',
           kicker='2024 — 2026', unit='指数（演示）', src='演示数据，仅用于测试版式', bw=180, vs=40, ls=32, stag=0.12,
           cols=[dict(l='2024', v=100), dict(l='2025', v=160), dict(l='2026', v=230)],
           hi=[[t0, -1], [S.k('翻了一倍多'), 2]], anim='up', ad=0.6, rot=-2, nodof=True, sfx='whoosh')
    show(sc, t0, t1, **PIP)
    KF.append(('paper col', t1 - 0.3))


def d02():
    S = G('D02')
    # 3) wall: big cards in a grid wider than the frame; focus moves with the narration
    t0, t1 = max(S.t0, S.k('原因', -0.3)), S.k('美国和日本', -0.3)
    sc = Scene('reasons', t0, {'type': 'dark', 'v': 3})
    X, Y, cw, ch, gap = 960, 560, 640, 560, 50
    cx = [X - (cw + gap), X, X + (cw + gap)]
    sc.cam(t0, x=960, y=560, s=1.0)
    for i, w in enumerate(['第一', '第二', '第三']):
        sc.cam(S.k(w, -0.2), x=cx[i], y=Y, s=1.18, d=0.8)
    sc.add('wall', t0 + 0.02, x=X, y=Y, cols=3, cw=cw, ch=ch, gap=gap, nodof=True, sfx='whoosh', cards=[
        dict(word='天气', size=200, ty=0.12, en='WEATHER', es=26, sub='产地干旱', ss=46, icon='icons/hourglass.png', ih=0.4, iy=0.3),
        dict(word='运费', size=200, ty=0.12, en='SHIPPING', es=26, sub='海运变贵', ss=46, icon='icons/shopping.png', ih=0.4, iy=0.3),
        dict(word='需求', size=200, ty=0.12, en='DEMAND', es=26, sub='大买家一直在买', ss=46, icon='icons/coins.png', ih=0.4, iy=0.3)],
        focus=[[t0, -1], [S.k('第一', -0.2), 0], [S.k('第二', -0.2), 1], [S.k('第三', -0.2), 2]])
    show(sc, t0, t1)
    KF.append(('wall card 2', S.k('第三', -0.4))); KF.append(('wall card 3', t1 - 0.3))
    # 4) ent6: tall purple entity cards with a flag badge, CN name, EN name and a white strip
    t0, t1 = t1, S.t1
    sc = Scene('buyers', t0, {'type': 'dark', 'v': 1})
    sc.cam(t0, x=960, y=540, s=1.0).cam(S.k('大买家', -0.2), x=960, y=520, s=1.08, d=1.5)
    for i, (c, n, en) in enumerate([('us', '美国', 'UNITED STATES'), ('jp', '日本', 'JAPAN')]):
        sc.add('ent6', t0 + 0.02 + i * 0.15, x=700 + i * 520, y=520, w=440, h=620, c=c, name=n, en=en, strip='大买家', ss=60,
               anim='flipy', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1, **PIP)
    KF.append(('ent6', t1 - 0.3))


def d03():
    S = G('D03')
    # 5) docpage: full-bleed white document, serif text, highlighter sweep, camera reads along
    t0, t1 = max(S.t0, S.k('报告原文', -0.3)), S.k('所以', -0.2)
    sc = Scene('report', t0, {'type': 'paper'})
    paras = [('title', '示例报告（演示文本）'), ('meta', 'Example Organization  ·  2026  ·  第二章'), ('gap', ''),
             ('p', '本段为演示文本，只用来测试文档页版式。报告称，受天气影响，今年全球咖啡产量[[0|同比下降百分之八]]，库存降到近十年的低点。')]
    marks = [dict(t=S.k('下降了百分之八', -0.15), kind='hl')]
    D = add_doc(sc, t0, paras, x=1000, y=780, marks=marks, w=2300, size=64, anim='up', ad=0.5, logo='example.org')
    look(sc, t0, 1000, D['lines'][0] + 330, 1.0, 0.1)
    look(sc, S.k('下降了百分之八', -0.45), D['m'][0][0], D['m'][0][1], 1.22, 0.9, D['left'], D['left'] + 2300)
    show(sc, t0, t1, **PIP)
    KF.append(('docpage', t1 - 0.3))
    # 6) formula6: big purple formula bar; each token gets an arrow, icon and label below; current token highlighted
    t0, t1 = t1, S.t1
    sc = Scene('cost', t0, {'type': 'dark', 'v': 2})
    toks = [dict(s='价格', t=t0 + 0.05, icon='icons/coins.png', l='一杯的价格', en='PRICE'),
            dict(s='=', op=True, t=S.k('等于', -0.1)),
            dict(s='豆子', t=S.k('豆子', -0.2), icon='icons/treasure.png', l='原料', en='BEANS'),
            dict(s='+', op=True, t=S.k('房租', -0.3)),
            dict(s='房租', t=S.k('房租', -0.2), icon='icons/office.png', l='门店', en='RENT'),
            dict(s='+', op=True, t=S.k('人工', -0.3)),
            dict(s='人工', t=S.k('人工', -0.2), icon='icons/young_worker.png', l='员工', en='LABOR')]
    # token column width = iw, so iw must be >= len(token) * fs or the token wraps
    sc.cam(t0, x=1080, y=540, s=1.0)
    sc.add('formula6', t0, x=FX, y=520, pw=1280, ph=860, fs=104, gap=6, iw=240, ih=118, lfs=28, title='一杯咖啡的价格',
           en='WHAT YOU PAY FOR', toks=toks, hl=[[S.k('豆子', -0.1), 2], [S.k('房租', -0.1), 4], [S.k('人工', -0.1), 6]],
           anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1, **RECT)
    KF.append(('formula6', t1 - 0.3))


def d04():
    S = G('D04')
    # 7) ui: white app / calculator; fields fill in one by one, the result counts up
    t0, t1 = max(S.t0, S.k('如果你', -0.3)), S.t1
    sc = Scene('calc', t0, {'type': 'paper'})
    fields = [dict(l='每杯价格', v='30', u='元', t=S.k('三十块', -0.2)), dict(l='一年天数', v='365', u='天', t=S.k('三百六十五天', -0.2))]
    res = [dict(l='一年花费', f='30×365', v=10950, u='元', t=S.k('一万零九百五十块', -0.6), total=True)]
    # with piprect on, it covers screen x 110-560. Screen x = world x - cam x + 960 (at s=1), so keep the UI's left edge on screen >= 600
    sc.cam(t0, x=960, y=540, s=1.0)
    sc.add('ui', t0 + 0.05, x=UX, y=540, w=1180, h=880, lw=420, title='咖啡开销计算器', sub='演示 · 每天一杯',
           fields=fields, res=res, anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1, **RECT)
    KF.append(('ui', t1 - 0.3))


def end():
    E = G('END')
    sc = Scene('end', E.t0, {'type': 'end'}, sway=0)
    sc.add('endcard', E.t0, layer='screen')
    show(sc, E.t0, E.t1)
    KF.append(('end', E.t0 + 2.6))


for f in [title, chapter, d01, d02, d03, d04, end]:
    f()
