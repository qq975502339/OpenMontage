# Cross-topic style check: the same storyboard in AI, city and medical topics, so a style is judged on
# material, type and motion rather than on one episode's props. Run from the project root:
#   python3 story_core.py timeline_cross.json scenes_cross.py
# Every number and document line here is a DEMO placeholder, not a fact.


def title():
    T = G('TITLE')
    sc = Scene('title', T.t0, {'type': 'title'}, sway=0)
    sc.add('titlecard', T.t0 + 0.05, layer='screen', l1='AI', l2='会抢走', l2b='谁的工作', q='？', slam=0.7)
    sc.fx(T.t0 + 0.75, 'shake', a=12, d=0.3)
    show(sc, T.t0, T.t1)
    KF.append(('title', T.t0 + 2.4))


def ai():
    S = G('A1')
    t0, t1 = S.t0, S.k('一个任务', -0.3)
    sc = Scene('ai_num', t0, {'type': 'dark', 'v': 1})
    sc.cam(t0, x=930, y=500, s=1.12).cam(S.k('三小时', -0.2), x=930, y=520, s=1.0, d=1.0)
    sc.add('bignum', t0 + 0.02, x=900, y=455, v='3', count=[0, 3, 0], ct=S.k('三小时', -0.15), cd=0.7, size=560, unit='小时',
           kicker='每周省下的时间', cap='演示数据 · 仅用于测试画风', anim='zoom', ad=0.5, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('ai bignum', t1 - 0.3))
    t0, t1 = t1, S.t1
    sc = Scene('ai_flow', t0, {'type': 'dark', 'v': 2})
    words = ['提问', '检索', '生成', '核对']
    ks = [S.k(w, -0.2) for w in words]
    steps = [dict(l=w, t=k) for w, k in zip(words, ks)]
    steps[3]['s'] = '人来把关'
    sc.cam(t0, x=960, y=600, s=0.94)
    sc.add('flow6', t0, x=960, y=640, steps=steps, bw=320, bh=230, gap=110,
           focus=[[t0, -1]] + [[k, i] for i, k in enumerate(ks)], anim='fade', ad=0.3, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('ai flow6', t1 - 0.3))


def chapter():
    C = G('CH1')
    sc = Scene('ch1', C.t0, {'type': 'title'}, sway=0)
    sc.add('titlecard', C.t0 + 0.02, layer='screen', l1='', l2='城市为什么越来越堵', s2=140, slam=0.12)
    sfx(C.t0 + 0.12, 'whoosh')
    show(sc, C.t0, C.t1)
    KF.append(('chapter', C.t0 + 1.3))


def city():
    S = G('C1')
    t0, t1 = S.t0, S.k('通勤时间', -0.3)
    sc = Scene('city_wall', t0, {'type': 'dark', 'v': 3})
    X, Y, cw, ch, gap = 960, 560, 600, 520, 50
    cx = [X - (cw + gap), X, X + (cw + gap)]
    sc.cam(t0, x=960, y=560, s=1.0)
    for i, w in enumerate(['道路', '公交', '停车']):
        sc.cam(S.k(w, -0.2), x=cx[i], y=Y, s=1.16, d=0.8)
    sc.add('wall', t0 + 0.02, x=X, y=Y, cols=3, cw=cw, ch=ch, gap=gap, nodof=True, sfx='whoosh', cards=[
        dict(word='道路', size=190, ty=0.3, sub='修得没有车多得快', ss=44),
        dict(word='公交', size=190, ty=0.3, sub='班次跟不上', ss=44),
        dict(word='停车', size=190, ty=0.3, sub='找车位也在堵', ss=44)],
        focus=[[t0, -1], [S.k('道路', -0.2), 0], [S.k('公交', -0.2), 1], [S.k('停车', -0.2), 2]])
    show(sc, t0, t1)
    KF.append(('city wall', t1 - 0.3))
    t0, t1 = t1, S.t1
    sc = Scene('city_line', t0, {'type': 'dark', 'v': 1})
    sc.cam(t0, x=960, y=540, s=1.0).cam(S.k('最长', -0.3), x=1000, y=520, s=1.05, d=1.0)
    sc.add('line6', t0 + 0.02, x=960, y=515, w=1640, h=870, title='单程通勤时间', kicker='2016 — 2025', unit='分钟（演示）', src='演示数据，仅用于测试画风',
           xs=[str(y) for y in range(2016, 2026)], series=[dict(v=[32, 33, 35, 36, 30, 34, 37, 39, 41, 43])],
           bands=[dict(a=3, b=5, l='居家办公', t=S.k('回落', -0.2))],
           pins=[dict(i=9, s='最长', t=S.k('最长', -0.1))],
           reveal=[[t0 + 0.4, 3], [S.k('回落', -0.3), 5], [S.k('最长', -0.7), 9]], anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('city line6', t1 - 0.3))


def med():
    S = G('M1')
    t0, t1 = S.t0, S.k('那么', -0.2)
    sc = Scene('med_doc', t0, {'type': 'paper'})
    paras = [('title', '示例诊疗指南（演示文本）'), ('meta', 'Example Hospital  ·  2026  ·  第三节'), ('gap', ''),
             ('p', '本段为演示文本，只用来测试文档页版式。对于轻症复诊，建议[[0|优先使用线上问诊]]，把线下号源留给初诊和急症。')]
    marks = [dict(t=S.k('线上问诊', -0.15), kind='hl')]
    D = add_doc(sc, t0, paras, x=1000, y=780, marks=marks, w=2300, size=64, anim='up', ad=0.5)
    look(sc, t0, 1000, D['lines'][0] + 330, 1.0, 0.1)
    look(sc, S.k('线上问诊', -0.45), D['m'][0][0], D['m'][0][1], 1.2, 0.9, D['left'], D['left'] + 2300)
    show(sc, t0, t1)
    KF.append(('med docpage', t1 - 0.3))
    t0, t1 = t1, S.t1
    sc = Scene('med_ui', t0, {'type': 'paper'})
    fields = [dict(l='每天号源', v='120', u='个', t=S.k('一百二十个', -0.2)), dict(l='每位用时', v='6', u='分钟', t=S.k('六分钟', -0.2))]
    res = [dict(l='一天问诊', f='120×6', v=720, u='分钟', t=S.k('七百二十分钟', -0.6), total=True)]
    sc.cam(t0, x=960, y=540, s=1.0)
    sc.add('ui', t0 + 0.05, x=960, y=540, w=1180, h=880, lw=420, title='门诊时长估算', sub='演示 · 一位医生',
           rtitle='测算结果', fields=fields, res=res, anim='up', ad=0.6, nodof=True, sfx='whoosh')
    show(sc, t0, t1)
    KF.append(('med ui', t1 - 0.3))


def end():
    E = G('END')
    sc = Scene('end', E.t0, {'type': 'end'}, sway=0)
    sc.add('endcard', E.t0, layer='screen', title='下期再见', sub='关注我，一起把复杂的事讲明白')
    show(sc, E.t0, E.t1)
    KF.append(('end', E.t0 + 2.6))


for f in [title, ai, chapter, city, med, end]:
    f()
