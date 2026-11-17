# Treatment demo: the same skeletons as scenes_gallery.py, drawn for THIS topic.
#   python3 story_core.py timeline_treat.json scenes_treat.py
# Every graphic scene = skeleton (layout) + the topic's real picture behind + props made for the topic + an action.
# G1-G8: coffee (numbers are DEMO placeholders; 1652 / 1908 / 1971 / 2017 are real dates).
# O1-O3: OpenClaw, real facts (Snyk ToxicSkills 2026-02-05; OpenClaw README; PCMag 2026-02-24), to show that a new
#        topic gets new drawings, not the same template with new numbers.
# Props: public/props/<topic>/*.png, generated per episode (references/treatment.md). Photos: public/photos/, credited.
# Demo assets ship in templates/demo_assets/ (copied into public/ by new_project.sh --demo; sources in CREDITS.md).


def photo_bg(src, dim=0.55, blur=3, **kw):
    d = {'type': 'broll', 'img': src, 'dim': dim, 'blur': blur, 's0': 1.06, 's1': 1.13}
    d.update(kw)
    return d


def shot_bg(name, **kw):
    # the report / article screenshot behind the scene; screenshots are not shipped with the skill (page copyright),
    # so without public/shots/<name> the theme's dark plate is used
    import os
    return photo_bg('shots/' + name, **kw) if os.path.exists('public/shots/' + name) else {'type': 'dark'}


def credit(sc, t0, s):
    sc.add('txt', t0, layer='screen', x=960, y=1058, txt='背景图：' + s, size=17, font='heavy', color='rgba(255,255,255,.6)', glow=False, anim='fade')


C = 'props/coffee/'
O = 'props/openclaw/'


def g_line():
    S = G('G1'); t0, t1 = S.t0, S.t1
    # price index: a coffee-bean character climbs the line as it draws
    sc = Scene('g_line', t0, photo_bg('photos/coffee/beans.jpg', dim=0.5, blur=2))
    credit(sc, t0, 'Jameswasswa / CC BY-SA 4.0')
    sc.cam(t0, x=960, y=540, s=1.0).cam(S.k('最高点', -0.3), x=930, y=520, s=1.04, d=1.2).cam(S.k('新高', -0.3), x=1010, y=520, s=1.05, d=1.0)
    sc.add('line6', t0 + 0.02, x=960, y=520, w=1440, h=800, title='咖啡豆价格指数', kicker='2016 — 2025', unit='指数（演示）', src='演示数据',
           xs=[str(y) for y in range(2016, 2026)],
           series=[dict(v=[100, 92, 80, 75, 82, 120, 165, 120, 190, 260], rider=dict(src=C + 'bean_char.png', w=170, orient=0.45))],
           bands=[dict(a=4, b=6, l='疫情期间', t=S.k('一路上涨'))],
           pins=[dict(i=6, s='2022 高点', t=S.k('最高点', -0.1)), dict(i=9, s='新高', t=S.k('新高', -0.1), below=True)],
           reveal=[[t0 + 0.5, 4], [S.k('二零二二', -0.3), 6], [S.k('回落', -0.3), 7], [S.k('新高', -0.7), 9]],
           anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('g_line', S.k('回落', 0.2)))
    KF.append(('g_line', t1 - 0.3))


def g_time():
    S = G('G2'); t0, t1 = S.t0, S.t1
    # history: a 1650s coffee-house engraving behind, each event carries its object
    sc = Scene('g_time', t0, photo_bg('photos/coffee/london1652.jpg', dim=0.5, blur=1.5, sat=0.8))
    credit(sc, t0, '17 世纪伦敦咖啡馆版画，公有领域')
    ks = [S.k('一六五二', -0.2), S.k('一九零八', -0.2), S.k('一九七一', -0.2), S.k('二零一七', -0.2)]
    items = [dict(y='1652', l='第一家咖啡馆', s='伦敦', icon=C + 'coffeehouse.png'), dict(y='1908', l='发明滤纸', s='德国', icon=C + 'filter.png'),
             dict(y='1971', l='星巴克成立', s='西雅图', icon=C + 'cup_green.png'), dict(y='2017', l='瑞幸成立', s='中国', icon=C + 'cup_blue.png')]
    for it, k in zip(items, ks): it['t'] = k
    sc.cam(t0, x=900, y=540, s=1.0).cam(ks[2] - 0.1, x=1240, y=540, s=1.0, d=1.0).cam(ks[3] + 0.6, x=1100, y=540, s=0.9, d=1.0)
    sc.add('timeline6', t0 + 0.02, x=1100, y=540, items=items, gap=520, cw=440, ch=210, gd=0.9,
           focus=[[t0, -1]] + [[k, i] for i, k in enumerate(ks)], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('g_time', t1 - 0.3))


def g_pie():
    S = G('G3'); t0, t1 = S.t0, S.t1
    # cost of a cup: the latte itself is cut into the four wedges; the bean wedge slides out
    sc = Scene('g_pie', t0, photo_bg('photos/coffee/bar.jpg', dim=0.58, blur=4))
    credit(sc, t0, 'Phillip Pessar / CC BY 2.0')
    sc.cam(t0, x=960, y=540, s=1.0).cam(S.k('豆子', -0.3), x=920, y=540, s=1.05, d=1.0)
    sc.add('pie6', t0 + 0.02, x=960, y=520, w=1480, h=840, title='一杯咖啡的钱去了哪', src='演示数据', img=C + 'latte_top.png', tint=0.22,
           slices=[dict(l='房租', v=30, t=S.k('房租', -0.2)), dict(l='人工', v=30, t=S.k('人工', -0.2)),
                   dict(l='豆子', v=10, t=S.k('豆子', -0.2)), dict(l='其他和利润', v=30, t=S.k('剩下', -0.2))],
           donut=0, hi=[[t0, -1], [S.k('豆子', -0.05), 2]], anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('g_pie', t1 - 0.3))


def g_flow():
    S = G('G4'); t0, t1 = S.t0, S.t1
    # supply chain: no boxes, the real things in order on a plantation photo
    sc = Scene('g_flow', t0, photo_bg('photos/coffee/farm.jpg', dim=0.55, blur=3))
    credit(sc, t0, 'Bernard Gagnon / CC BY-SA 4.0')
    words = ['种植', '采摘', '烘焙', '运输', '萃取']
    imgs = ['plant', 'farmer', 'roaster', 'ship', 'cup_latte']
    ks = [S.k(w, -0.2) for w in words]
    steps = [dict(l=w, t=k, img=C + m + '.png') for w, k, m in zip(words, ks, imgs)]
    steps[4]['s'] = '你手里的这一杯'
    sc.cam(t0, x=960, y=560, s=0.95)
    sc.add('flow6', t0, x=960, y=560, steps=steps, bare=True, bw=270, bh=250, gap=80, loop=dict(l='下一批豆子', t=S.k('下一批', -0.4)),
           focus=[[t0, -1]] + [[k, i] for i, k in enumerate(ks)] + [[S.k('下一批', -0.2), -1]], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('g_flow', ks[3] + 0.5))
    KF.append(('g_flow', t1 - 0.3))


def g_tree():
    S = G('G5'); t0, t1 = S.t0, S.t1
    # profit tree: every node carries who or what the money is
    sc = Scene('g_tree', t0, photo_bg('photos/coffee/barista.jpg', dim=0.6, blur=4))
    credit(sc, t0, 'Shixart1985 / CC BY 2.0')
    kr, kc = S.k('收入', -0.2), S.k('成本', -0.2)
    root = dict(id='p', l='利润', icon='icons/moneybag.png', t=S.k('利润', -0.2), c=[
        dict(id='r', l='收入', op='+', icon=C + 'register.png', t=kr, c=[dict(l='咖啡', icon=C + 'cup.png', t=S.k('咖啡和', -0.1)), dict(l='甜点', icon=C + 'dessert.png', t=S.k('甜点', -0.1))]),
        dict(id='c', l='成本', op='−', icon='icons/calculator.png', t=kc, c=[dict(l='原料', icon=C + 'sack.png', t=S.k('原料', -0.1)), dict(l='房租', icon=C + 'landlord.png', t=S.k('房租', -0.1)), dict(l='人工', icon=C + 'barista.png', t=S.k('人工', -0.1))])])
    sc.cam(t0, x=960, y=560, s=0.98)
    sc.add('tree6', t0, x=960, y=545, root=root, bw=320, bh=150, gx=46, lv=300,
           focus=[[t0, 'p'], [S.k('收入来自', -0.2), 'r'], [S.k('成本又', -0.2), 'c']], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('g_tree', t1 - 0.3))


def g_map():
    S = G('G6'); t0, t1 = S.t0, S.t1
    # origin and shipping: sacks sit on the producers, cargo ships sail the routes and draw them
    sc = Scene('g_map', t0, photo_bg('photos/coffee/port.jpg', dim=0.55, blur=3))
    credit(sc, t0, 'Downtowngal / CC BY-SA 4.0')
    kb, kv, kr = S.k('巴西', -0.2), S.k('越南', -0.2), S.k('运往', -0.3)
    sc.cam(t0, x=960, y=540, s=1.0).cam(S.k('运往', -0.3), x=960, y=530, s=1.04, d=1.4)
    ship = dict(src=C + 'ship.png', w=120)
    sc.add('map6', t0 + 0.02, x=960, y=515, w=1640, h=880, title='咖啡从哪里来', view=[-125, -42, 150, 62],
           hi=[dict(id='BRA', t=kb), dict(id='VNM', t=kv)],
           routes=[dict(a=[-38, -13], b=[-74, 40.7], t=kr, d=1.7, bend=-0.25, vehicle=ship),
                   dict(a=[-35, -8], b=[9, 53.5], t=kr + 0.45, d=1.7, bend=0.2, vehicle=ship),
                   dict(a=[109, 12], b=[139.7, 35.7], t=kr + 0.9, d=1.5, bend=-0.3, vehicle=ship)],
           pts=[dict(lon=-50, lat=-11, l='巴西', side='b', t=kb, img=C + 'sack.png', iw=120), dict(lon=107, lat=14, l='越南', side='b', t=kv, img=C + 'sack.png', iw=100),
                dict(lon=-74, lat=40.7, l='美国', side='l', t=kr + 1.6), dict(lon=9, lat=53.5, l='欧洲', side='t', t=kr + 2.05),
                dict(lon=139.7, lat=35.7, l='日本', side='t', t=kr + 2.3)],
           anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('g_map', S.k('运往', 0.9)))
    KF.append(('g_map', t1 - 0.3))


def g_vs():
    S = G('G7'); t0, t1 = S.t0, S.t1
    # boutique vs chain: each card shows its shop; cups per day as a row of cups (1 cup = 100)
    sc = Scene('g_vs', t0, photo_bg('photos/coffee/street.jpg', dim=0.58, blur=4))
    credit(sc, t0, 'Adam Jones / CC BY-SA 2.0')
    ka, kb = S.k('精品店', -0.2), S.k('连锁店', -0.2)
    sc.cam(t0, x=960, y=540, s=1.0)
    sc.add('vs6', t0 + 0.02, x=960, y=515, w=1720, h=780,
           a=dict(l='精品咖啡馆', v='40', u='元', s='一杯拿铁（演示数据）', t=t0 + 0.05, pic=C + 'boutique.png', row=dict(src=C + 'cup.png', n=2, t=S.k('两百杯', -0.2)),
                  pts=[dict(s='一天卖 200 杯', t=S.k('两百杯', -0.2)), dict(s='单品豆、手冲', t=S.k('两百杯', 0.3))]),
           b=dict(l='连锁咖啡店', v='15', u='元', s='一杯拿铁（演示数据）', t=t0 + 0.3, pic=C + 'chain.png', row=dict(src=C + 'cup.png', n=10, t=S.k('一千杯', -0.2)),
                  pts=[dict(s='一天卖 1000 杯', t=S.k('一千杯', -0.2)), dict(s='机器出品', t=S.k('一千杯', 0.3))]),
           focus=[[t0, -1], [ka, 0], [kb, 1]], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('g_vs', t1 - 0.3))


def g_graph():
    S = G('G8'); t0, t1 = S.t0, S.t1
    # who is connected to the brand: characters instead of boxes; sacks run on the supply edge, coins on the fee edge
    sc = Scene('g_graph', t0, photo_bg('photos/coffee/cafe2.jpg', dim=0.6, blur=4))
    credit(sc, t0, 'Shixart1985 / CC BY 2.0')
    ki, ks, kf, ka = S.k('投资方', -0.2), S.k('供应商', -0.2), S.k('加盟店交', -0.2), S.k('授权', -0.3)
    nodes = [dict(id='brand', l='咖啡品牌', x=820, y=430, img=C + 'cup.png', iw=270, t=t0 + 0.05),
             dict(id='inv', l='投资方', x=250, y=170, img=C + 'investor.png', iw=230, t=ki),
             dict(id='sup', l='供应商', x=250, y=720, img=C + 'farmer.png', iw=230, t=ks),
             dict(id='fr', l='加盟店', x=1560, y=430, img=C + 'boutique.png', iw=250, t=kf)]
    edges = [dict(a='inv', b='brand', l='持股 51%', t=ki + 0.4), dict(a='sup', b='brand', l='供豆', t=ks + 0.4, flow=True, dot=C + 'sack.png', dw=60),
             dict(a='fr', b='brand', l='管理费', t=kf + 0.4, bend=0.5, flow=True, dot=C + 'coin.png', dw=52), dict(a='brand', b='fr', l='品牌授权', t=ka, bend=0.5)]
    sc.cam(t0, x=960, y=560, s=1.0)
    sc.add('graph6', t0, x=960, y=570, w=1800, h=900, nodes=nodes, edges=edges,
           focus=[[t0, 'brand'], [ki, 'inv'], [ks, 'sup'], [kf, 'fr'], [ka, 'brand']], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('g_graph', t1 - 0.3))


# ---------------------------------------------------------------- OpenClaw: a different topic, different drawings
def o_iso():
    S = G('O1'); t0, t1 = S.t0, S.t1
    # 3,984 skills scanned, 36.8 % flawed: 100 skill boxes, 37 of them turn toxic (pictogram grid instead of a pie)
    sc = Scene('o_iso', t0, shot_bg('antiy.png', dim=0.68, blur=5))
    kp = S.k('百分之', -0.1)
    sc.cam(t0, x=960, y=540, s=1.0).cam(kp, x=960, y=560, s=1.04, d=1.4)
    sc.add('txt', t0 + 0.05, x=960, y=150, txt='扫描 3,984 个 skill', size=86, anim='up', sfx='whoosh')
    sc.add('txt', t0 + 0.3, x=960, y=228, txt='来源：Snyk ToxicSkills，2026-02-05，ClawHub 和 skills.sh', size=26, font='heavy', glow=False, grad=None, anim='fade')
    sc.add('stack6', t0 + 0.5, x=960, y=575, src=O + 'pkg.png', iw=74, sd=1.4, drop=120,
           grid=dict(n=100, per=20, hi=37, alt=O + 'pkg_bad.png', hiT=kp, hiD=1.6, **{'from': 'random'}), anim='fade', ad=0.2, nodof=True)
    sc.add('txt', kp + 1.2, x=960, y=880, txt='36.8% 至少有一个安全漏洞', size=78, anim='pop', sfx='ding')
    show(sc, t0, t1)
    KF.append(('o_iso', kp + 0.6))
    KF.append(('o_iso', t1 - 0.3))


def o_hub():
    S = G('O2'); t0, t1 = S.t0, S.t1
    # it lives inside the chat apps you already use: the butler lobster in the middle, real logos around, mail flowing in
    sc = Scene('o_hub', t0, shot_bg('gh_weather.png', dim=0.7, blur=6))
    import math, os
    names = [('discord', 'Discord', 'discord.svg'), ('imessage', 'iMessage', 'imessage.png'), ('slack', 'Slack', 'slack.png'), ('teams', 'Teams', 'teams.png'),
             ('telegram', 'Telegram', 'telegram.png'), ('whatsapp', 'WhatsApp', 'whatsapp.png')]
    nodes = [dict(id='claw', l='OpenClaw', x=900, y=400, img=O + 'lobster.png', iw=300, t=t0 + 0.05)]
    edges = []
    n = len(names) + 1
    for i, (k, l, f) in enumerate(names + [('more', '20+', None)]):
        a = math.radians(-90 + i * 360 / n)
        x, y = 900 + 700 * math.cos(a), 400 + 285 * math.sin(a)
        kt = S.k(l, -0.15) if f else S.k('二十多个', -0.2)
        if f and os.path.exists('public/logos/' + f):
            nodes.append(dict(id=k, l=l, x=round(x), y=round(y), img='logos/' + f, iw=118, size=30, t=kt))
        elif f:  # logos are trademarks and not shipped; fetch them with scripts/commons_logo.py
            nodes.append(dict(id=k, l=l, x=round(x), y=round(y), round=True, d=150, size=26, t=kt))
        else:
            nodes.append(dict(id=k, l='20+', s='更多', x=round(x), y=round(y), round=True, d=170, size=54, t=kt))
        edges.append(dict(a=k, b='claw', t=kt + 0.2, flow=True, dot=O + 'envelope.png', dw=46))
    sc.cam(t0, x=960, y=560, s=1.0)
    sc.add('graph6', t0, x=960, y=575, w=1800, h=880, nodes=nodes, edges=edges, focus=[[t0, -1]], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    sc.add('txt', t0 + 0.2, layer='screen', x=960, y=1058, txt='Logo 仅作指称；来源：OpenClaw README', size=17, font='heavy', color='rgba(255,255,255,.6)', glow=False, grad=None, anim='fade')
    show(sc, t0, t1)
    KF.append(('o_hub', t1 - 0.3))


def o_inbox():
    S = G('O3'); t0, t1 = S.t0, S.t1
    # "confirm before acting" -> it speedruns deleting the inbox: the lobster flings mail into a bin, her real words on a card
    sc = Scene('o_inbox', t0, shot_bg('pcmag.png', dim=0.66, blur=5))
    kc, kd = S.k('先确认', -0.2), S.k('一口气', -0.3)
    sc.cam(t0, x=960, y=540, s=1.0).cam(kd, x=1000, y=580, s=1.06, d=1.2)
    sc.add('comment', t0 + 0.1, x=560, y=210, w=820, ac='#1d6ae5', av='S', name='Summer Yue · Meta',
           txt="“Nothing humbles you like telling your OpenClaw ‘confirm before acting’ and watching it speedrun deleting your inbox.”", meta='来源：PCMag，2026-02-24', anim='up', sfx='whoosh')
    sc.add('prop', t0 + 0.4, x=640, y=650, src=O + 'lobster.png', w=420, idle='sway', anim='pop', out=kd - 0.05, od=0.05)
    sc.add('prop', kd - 0.05, x=640, y=650, src=O + 'lobster_shred.png', w=470, idle='wobble', amp=3, anim='none')
    sc.add('prop', t0 + 0.6, x=1420, y=760, src=O + 'trash.png', w=330, anim='pop')
    sc.add('prop', kd + 0.1, x=760, y=560, src=O + 'envelope.png', w=110, to=[640, 170], arc=300, pd=0.75, ease='lin',
           spinTo=420, sTo=0.55, fadeEnd=True, copies=6, dt=0.22, loop=True, gap=0.6, noShadow=False, anim='none', sfx='whoosh')
    sc.add('stamp', S.k('删光', 0.1), x=1420, y=470, txt='删光了', size=110, anim='pop', sfx='pop')
    show(sc, t0, t1)
    KF.append(('o_inbox', kc + 0.3))
    KF.append(('o_inbox', t1 - 0.3))


for f in [g_line, g_time, g_pie, g_flow, g_tree, g_map, g_vs, g_graph, o_iso, o_hub, o_inbox]:
    f()
