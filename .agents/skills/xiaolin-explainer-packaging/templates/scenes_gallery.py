# Layout gallery: one scene per v7 layout. Run from the project root:
#   python3 story_core.py timeline_gallery.json scenes_gallery.py
# Numbers are DEMO placeholders. The timeline dates (1652 London, 1908 paper filter, 1971 Starbucks, 2017 Luckin) are real.
# Coordinates are world pixels; the camera frames 1920x1080 around (x, y) at scale s.


def g_line():
    S = G('G1'); t0, t1 = S.t0, S.t1
    # line6: line draws left to right, a shaded band, callout pins on cue
    sc = Scene('g_line', t0, {'type': 'dark', 'v': 1})
    sc.cam(t0, x=960, y=540, s=1.0).cam(S.k('最高点', -0.3), x=900, y=520, s=1.05, d=1.2).cam(S.k('新高', -0.3), x=1030, y=520, s=1.06, d=1.0)
    sc.add('line6', t0 + 0.02, x=960, y=515, w=1640, h=870, title='咖啡豆价格指数', kicker='2016 — 2025', unit='指数（演示）', src='演示数据，仅用于测试版式',
           xs=[str(y) for y in range(2016, 2026)], series=[dict(v=[100, 92, 80, 75, 82, 120, 165, 120, 190, 260])],
           bands=[dict(a=4, b=6, l='疫情期间', t=S.k('一路上涨'))],
           pins=[dict(i=6, s='2022 高点', t=S.k('最高点', -0.1)), dict(i=9, s='新高', t=S.k('新高', -0.1))],
           reveal=[[t0 + 0.5, 4], [S.k('二零二二', -0.3), 6], [S.k('回落', -0.3), 7], [S.k('新高', -0.7), 9]],
           anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('line6', t1 - 0.3))


def g_time():
    S = G('G2'); t0, t1 = S.t0, S.t1
    # timeline6: axis grows, events alternate above / below, the camera follows the lit event
    sc = Scene('g_time', t0, {'type': 'dark', 'v': 2})
    ks = [S.k('一六五二', -0.2), S.k('一九零八', -0.2), S.k('一九七一', -0.2), S.k('二零一七', -0.2)]
    items = [dict(y='1652', l='第一家咖啡馆', s='伦敦'), dict(y='1908', l='发明滤纸', s='德国'),
             dict(y='1971', l='星巴克成立', s='西雅图'), dict(y='2017', l='瑞幸成立', s='中国')]
    for it, k in zip(items, ks): it['t'] = k
    sc.cam(t0, x=900, y=540, s=1.0).cam(ks[2] - 0.1, x=1240, y=540, s=1.0, d=1.0).cam(ks[3] + 0.6, x=1100, y=540, s=0.9, d=1.0)
    sc.add('timeline6', t0 + 0.02, x=1100, y=540, items=items, gap=520, cw=420, ch=200, gd=0.9,
           focus=[[t0, -1]] + [[k, i] for i, k in enumerate(ks)], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('timeline6', t1 - 0.3))


def g_pie():
    S = G('G3'); t0, t1 = S.t0, S.t1
    # pie6: donut slices sweep in, one slice pulled out on cue, legend on the right
    sc = Scene('g_pie', t0, {'type': 'dark', 'v': 3})
    sc.cam(t0, x=960, y=540, s=1.0).cam(S.k('豆子', -0.3), x=900, y=540, s=1.06, d=1.0)
    sc.add('pie6', t0 + 0.02, x=960, y=515, w=1600, h=870, title='一杯咖啡的成本', src='演示数据，仅用于测试版式',
           slices=[dict(l='房租', v=30, t=S.k('房租', -0.2)), dict(l='人工', v=30, t=S.k('人工', -0.2)),
                   dict(l='豆子', v=10, t=S.k('豆子', -0.2)), dict(l='其他和利润', v=30, t=S.k('剩下', -0.2))],
           donut=0.55, center=dict(v='30', l='元 / 杯'), hi=[[t0, -1], [S.k('豆子', -0.05), 2]], anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('pie6', t1 - 0.3))


def g_flow():
    S = G('G4'); t0, t1 = S.t0, S.t1
    # flow6: steps join with arrows on cue, the current step lit, a loop arrow back to the start
    sc = Scene('g_flow', t0, {'type': 'dark', 'v': 1})
    words = ['种植', '采摘', '烘焙', '运输', '萃取']
    ks = [S.k(w, -0.2) for w in words]
    steps = [dict(l=w, t=k) for w, k in zip(words, ks)]
    steps[4]['s'] = '你手里的这一杯'
    sc.cam(t0, x=960, y=600, s=0.92)
    sc.add('flow6', t0, x=960, y=640, steps=steps, bw=300, bh=230, gap=100, loop=dict(l='下一批豆子', t=S.k('下一批', -0.4)),
           focus=[[t0, -1]] + [[k, i] for i, k in enumerate(ks)] + [[S.k('下一批', -0.2), -1]], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('flow6', t1 - 0.3))


def g_tree():
    S = G('G5'); t0, t1 = S.t0, S.t1
    # tree6: root, then children with the sign on each branch, then leaves; focus by node id
    sc = Scene('g_tree', t0, {'type': 'dark', 'v': 2})
    kr, kc = S.k('收入', -0.2), S.k('成本', -0.2)
    root = dict(id='p', l='利润', t=S.k('利润', -0.2), c=[
        dict(id='r', l='收入', op='+', t=kr, c=[dict(l='咖啡', t=S.k('咖啡和', -0.1)), dict(l='甜点', t=S.k('甜点', -0.1))]),
        dict(id='c', l='成本', op='−', t=kc, c=[dict(l='原料', t=S.k('原料', -0.1)), dict(l='房租', t=S.k('房租', -0.1)), dict(l='人工', t=S.k('人工', -0.1))])])
    sc.cam(t0, x=960, y=560, s=0.98)
    sc.add('tree6', t0, x=960, y=545, root=root, bw=320, bh=150, gx=46, lv=300,
           focus=[[t0, 'p'], [S.k('收入来自', -0.2), 'r'], [S.k('成本又', -0.2), 'c']], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('tree6', t1 - 0.3))


def g_map():
    S = G('G6'); t0, t1 = S.t0, S.t1
    # map6: producer countries fill in, routes draw to the buyers with moving dots, destination pins
    sc = Scene('g_map', t0, {'type': 'dark', 'v': 3})
    kb, kv = S.k('巴西', -0.2), S.k('越南', -0.2)
    sc.cam(t0, x=960, y=540, s=1.0).cam(S.k('运往', -0.3), x=960, y=530, s=1.04, d=1.4)
    sc.add('map6', t0 + 0.02, x=960, y=515, w=1700, h=900, title='咖啡从哪里来', view=[-125, -42, 150, 62],
           hi=[dict(id='BRA', t=kb, l='巴西', at=[-52, -10]), dict(id='VNM', t=kv, l='越南', at=[96, 6])],
           routes=[dict(a=[-38, -13], b=[-74, 40.7], t=S.k('美国', -0.5), bend=-0.25, flow=True),
                   dict(a=[-35, -8], b=[9, 53.5], t=S.k('欧洲', -0.5), bend=0.2, flow=True),
                   dict(a=[109, 12], b=[139.7, 35.7], t=S.k('日本', -0.5), bend=-0.3, flow=True)],
           pts=[dict(lon=-74, lat=40.7, l='美国', side='l', t=S.k('美国', -0.1)), dict(lon=9, lat=53.5, l='欧洲', side='t', t=S.k('欧洲', -0.1)),
                dict(lon=139.7, lat=35.7, l='日本', side='t', t=S.k('日本', -0.1))],
           anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('map6', t1 - 0.3))


def g_vs():
    S = G('G7'); t0, t1 = S.t0, S.t1
    # vs6: two cards, a VS badge, points appear one by one; focus moves left then right
    sc = Scene('g_vs', t0, {'type': 'dark', 'v': 1})
    ka, kb = S.k('精品店', -0.2), S.k('连锁店', -0.2)
    sc.cam(t0, x=960, y=540, s=1.0)
    sc.add('vs6', t0 + 0.02, x=960, y=515, w=1720, h=760,
           a=dict(l='精品咖啡馆', v='40', u='元', s='一杯拿铁（演示数据）', t=t0 + 0.05, pts=[dict(s='一天卖 200 杯', t=S.k('两百杯', -0.2)), dict(s='单品豆、手冲', t=S.k('两百杯', 0.3))]),
           b=dict(l='连锁咖啡店', v='15', u='元', s='一杯拿铁（演示数据）', t=t0 + 0.3, pts=[dict(s='一天卖 1000 杯', t=S.k('一千杯', -0.2)), dict(s='机器出品', t=S.k('一千杯', 0.3))]),
           focus=[[t0, -1], [ka, 0], [kb, 1]], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('vs6', t1 - 0.3))


def g_graph():
    S = G('G8'); t0, t1 = S.t0, S.t1
    # graph6: nodes pop in, labelled arrows draw on cue; money flows as moving dots
    sc = Scene('g_graph', t0, {'type': 'dark', 'v': 2})
    ki, ks, kf, ka = S.k('投资方', -0.2), S.k('供应商', -0.2), S.k('加盟店交', -0.2), S.k('授权', -0.3)
    nodes = [dict(id='brand', l='咖啡品牌', x=820, y=450, w=400, h=180, size=60, t=t0 + 0.05),
             dict(id='inv', l='投资方', x=260, y=140, t=ki), dict(id='sup', l='供应商', x=260, y=760, t=ks),
             dict(id='fr', l='加盟店', x=1580, y=450, t=kf)]
    edges = [dict(a='inv', b='brand', l='持股 51%', t=ki + 0.4), dict(a='sup', b='brand', l='供豆', t=ks + 0.4, flow=True),
             dict(a='fr', b='brand', l='管理费', t=kf + 0.4, bend=0.5, flow=True), dict(a='brand', b='fr', l='品牌授权', t=ka, bend=0.5)]
    sc.cam(t0, x=960, y=560, s=1.0)
    sc.add('graph6', t0, x=960, y=570, w=1800, h=900, nodes=nodes, edges=edges,
           focus=[[t0, 'brand'], [ki, 'inv'], [ks, 'sup'], [kf, 'fr'], [ka, 'brand']], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('graph6', t1 - 0.3))


for f in [g_line, g_time, g_pie, g_flow, g_tree, g_map, g_vs, g_graph]:
    f()
