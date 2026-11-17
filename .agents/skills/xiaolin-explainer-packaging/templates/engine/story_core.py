#!/usr/bin/env python3
"""xiaolin-explainer-packaging storyboard core.

Usage (from the project root):
    python3 story_core.py timeline.json scenes.py [more_scenes.py ...]

Reads timeline.json (see references/storyboard-api.md), executes the scene files
(they call G / Scene / show / sfx / look / add_doc and append to KF), and writes:
    src/data/shots.json   Remotion input
    sfx.json              [[t, name], ...] for the audio mix
    keyframes.json        [[label, frame], ...] for review stills
"""
import sys, os, re, json, collections

FPS = 24
ROOT = os.getcwd()
SCENES, BLOCKS, SFX, KF = {}, [], [], []
CFG = {}

# ------------------------------------------------------------ timing helpers
_PUNCT = r"[，。？！：；、\s“”]"


def kw_time(say, word, t_a, t_b, default=None):
    """Seconds into the segment at which `word` is spoken (char-position interpolation)."""
    s = re.sub(_PUNCT, "", say); w = re.sub(_PUNCT, "", word)
    i = s.find(w)
    if i < 0:
        if default is None: raise KeyError(f"keyword {word!r} not in {say!r}")
        return t_a + (t_b - t_a) * default
    return t_a + (t_b - t_a) * i / max(1, len(s))


def split_phrases(txt):
    parts = [p for p in re.split(r"(?<=[，。？！：；])", txt) if p.strip()]
    out = []
    for p in parts:
        if len(p) > 19:
            m = len(p) // 2
            cut = max([i for i, ch in enumerate(p) if ch in "、，的和是" and 6 < i < len(p) - 4] or [m], key=lambda i: -abs(i - m))
            out += [p[:cut + 1], p[cut + 1:]]
        else:
            out.append(p)
    return out


def clean_sub(p):
    p = re.sub(r"[，。；：、]", " ", p).strip()
    return re.sub(r"\s+", " ", p)


def sub_timeline(say, sub, t_a, t_b):
    """[(start, end, text)] for one segment; time shared by phrase length."""
    sp, dp = split_phrases(say), split_phrases(sub)
    if len(sp) == len(dp):
        weights = [len(re.sub(r"[，。？！：；、\s]", "", x)) for x in sp]
    else:
        weights = [len(re.sub(r"[，。？！：；、\s]", "", x)) + 0.6 * len(re.findall(r"\d", x)) for x in dp]
    tot = sum(weights) or 1; t = t_a; out = []
    for w, txt in zip(weights, dp):
        d = (t_b - t_a) * w / tot; out.append((t, t + d, clean_sub(txt))); t += d
    return out


# ------------------------------------------------------------ timeline
def load_timeline(path):
    segs = json.load(open(path))
    t = 0.0
    for s in segs:
        s.setdefault('kind', 'clip')
        if s['kind'] == 'clip':
            s.setdefault('tin', 0.0)
            if 'tout' not in s: s['tout'] = s['tin'] + s['dur'] + sum(b - a for a, b in s.get('cuts', []))
            if 'dur' not in s: s['dur'] = round(s['tout'] - s['tin'] - sum(b - a for a, b in s.get('cuts', [])), 4)
        if 'start' not in s: s['start'] = round(t, 4)
        t = s['start'] + s['dur']
        s.setdefault('say', ''); s.setdefault('sub', s['say'])
    return segs


SEGS, SEG, TOTAL = [], {}, 0.0


class G:
    """Handle on one timeline segment. G('S12').k('关键词') -> absolute seconds when it is spoken."""
    def __init__(self, sid):
        self.s = SEG[sid]; self.id = sid; self.t0 = self.s['start']; self.d = self.s['dur']
        self.t1 = round(self.t0 + self.d, 4); self.say = self.s.get('say', '')

    def k(self, w, off=0.0):
        return round(self.t0 + kw_time(self.say, w, 0.10, self.d - 0.16) + off, 3)

    def at(self, frac):
        return round(self.t0 + 0.10 + (self.d - 0.26) * frac, 3)


class Scene:
    """A world (3840x2160 canvas viewed by a 1920x1080 camera) with timed elements."""
    def __init__(self, name, t0, bg=None, **kw):
        self.name = name; self.t0 = t0
        self.d = dict(t0=round(t0, 3), bg=bg or {'type': 'dark'}, els=[], cam=[], fx=[], **kw)
        SCENES[name] = self.d

    def add(self, k, t, **kw):
        snd = kw.pop('sfx', None)
        e = dict(k=k, t=round(t, 3), **kw); self.d['els'].append(e)
        if snd: SFX.append([round(t + (-0.06 if snd in ('whoosh', 'swish') else 0.02), 3), snd])
        return e

    def cam(self, t, **kw):
        self.d['cam'].append(dict(t=round(t, 3), **kw)); return self

    def fx(self, t, k, **kw):
        self.d['fx'].append(dict(t=round(t, 3), k=k, **kw)); return self


def show(sc, t0, t1, aroll='hide', **kw):
    """Put scene `sc` on screen from t0 to t1.
    aroll: 'hide' (no presenter) | 'pip' (round gold-rim PiP; pip='br'|'bl'|'tr', pipd=330 diameter) |
           'piprect' (tall rounded rect on the left, screen x 110-560; px/py/pw/ph override) | 'full'."""
    BLOCKS.append(dict(t0=round(t0, 3), t1=round(t1, 3), scene=sc.name if sc else None, aroll=aroll, **kw))


def sfx(t, name): SFX.append([round(t, 3), name])


# ------------------------------------------------------------ document / camera helpers (spliced from v6)
import re as _re
_CJK = _re.compile(r'[\u2e80-\u9fff\u3000-\u303f\uff00-\uffef\u2014\u2026\u201c\u201d\u2018\u2019\u2192]')
NOSTART = '，。；：、？！）”’,.;:)%'


def _cw(ch, size):
    if _CJK.match(ch): return size
    if ch == ' ': return size * 0.26
    if ch == '%': return size * 0.82
    if ch in ".,:;'\"()": return size * 0.3
    if ch.isdigit(): return size * 0.56
    if ch.isupper(): return size * 0.68
    return size * 0.5


def doc_layout(paras, w=2300, size=60, mx=150, my=120, lh=1.9):
    """paras: [(cls, text)] with inline marks [[i|text]]. Returns lines, mark fragments {i: [(line, x0, x1, yc)]}, line centers, height."""
    width = w - 2 * mx
    lines, pos, centers, y = [], {}, [], my
    for cls, text in paras:
        if cls == 'gap':
            lines.append({'cls': 'gap', 'segs': []}); centers.append(y + size * 0.3); y += size * 0.6; continue
        fs = size * 1.25 if cls == 'title' else size * 0.5 if cls == 'meta' else size
        lineH = fs * (1.6 if cls == 'title' else 2.2 if cls == 'meta' else lh)
        toks = []
        for m in _re.finditer(r'\[\[(\d+)\|(.+?)\]\]|([^\[]+|\[)', text):
            if m.group(1) is not None: toks += [(ch, int(m.group(1))) for ch in m.group(2)]
            else: toks += [(ch, None) for ch in m.group(3)]
        rows, cur, x = [], [], 0
        for ch, mk in toks:
            wd = _cw(ch, fs)
            if cls == 'p' and x + wd > width and cur and ch not in NOSTART:
                rows.append(cur); cur, x = [], 0
            cur.append((ch, mk, x, wd)); x += wd
        if cur: rows.append(cur)
        for r in rows:
            segs = []
            for ch, mk, x0, wd in r:
                if segs and segs[-1]['m'] == mk: segs[-1]['s'] += ch; segs[-1]['x1'] = x0 + wd
                else: segs.append({'s': ch, 'm': mk, 'x0': x0, 'x1': x0 + wd})
            tot = r[-1][2] + r[-1][3]
            off = 0 if cls == 'p' else (width - tot) / 2
            for sg in segs:
                if sg['m'] is not None: pos.setdefault(sg['m'], []).append((len(lines), mx + off + sg['x0'], mx + off + sg['x1'], y + lineH / 2))
            lines.append({'cls': cls, 'segs': segs}); centers.append(y + lineH / 2)
            y += lineH
    return lines, pos, centers, y


def web_y(src, q, frac=0.42, w=1640, h=860):
    """Scroll y (screenshot px) that puts phrase q of public/<src>.boxes.json at frac of the add_web viewport height."""
    import json as _j, struct as _s
    with open('public/' + src, 'rb') as f:
        iw, ih = _s.unpack('>II', f.read(24)[16:24])
    r = _j.load(open('public/' + src + '.boxes.json'))[q]
    k = w / iw
    yc = (min(b[1] for b in r) + max(b[1] + b[3] for b in r)) / 2
    return round(max(0, min(ih - h / k, yc - frac * h / k)))


def add_web(sc, t, src, x=960, y=520, w=1640, h=860, url='', sy=None, marks=(), bar=56, **kw):
    """Real screenshot (scripts/web_shot.mjs output under public/) in a browser frame.
    sy: scroll keyframes [(t, y_px), (t, y_px, dur), ...] in screenshot pixels; default stays at the top.
    marks: dict(t=, q='phrase' from <src>.boxes.json | r=[[x, y, w, h], ...], kind='hl'|'under'|'box',
           spot=False (darken the rest), c=None, d=0.55, out=None).
    Returns {'m': [(world_cx, world_cy) of each mark at its time], 'k': frame px per screenshot px,
             'y_for': fn(phrase | rects, frac=0.4) -> scroll y that puts it at frac of the viewport height}."""
    import json as _j, os as _o, struct as _s
    p = _o.path.join('public', src)
    with open(p, 'rb') as f:
        hd = f.read(24)
    assert hd[:8] == b'\x89PNG\r\n\x1a\n', 'add_web expects a PNG: ' + p
    iw, ih = _s.unpack('>II', hd[16:24])
    bj = p + '.boxes.json'
    B = _j.load(open(bj)) if _o.path.exists(bj) else {}
    k = w / iw
    sy = [list(a) for a in (sy or [(t, 0)])]

    def rects(m):
        r = m.get('r') or B.get(m.get('q'))
        if not r:
            raise ValueError('add_web: no box for %r in %s (re-run web_shot.mjs --boxes)' % (m.get('q'), bj))
        return r

    def sy_at(tt):
        v = sy[0][1]
        for a in sy[1:]:
            if tt >= a[0]:
                v = a[1]
        return v
    ms, out = [], []
    for m in marks:
        r = rects(m)
        r = [b for b in r if b[2] >= 24] or r      # drop slivers, e.g. a lone opening quote on the line above
        x0 = min(b[0] for b in r); y0 = min(b[1] for b in r)
        x1 = max(b[0] + b[2] for b in r); y1 = max(b[1] + b[3] for b in r)
        ms.append(dict(t=round(m['t'], 3), r=r, kind=m.get('kind', 'hl'), spot=m.get('spot', False), c=m.get('c'),
                       d=m.get('d', 0.55), out=m.get('out')))
        out.append((x - w / 2 + (x0 + x1) / 2 * k, y - (h + bar) / 2 + bar + ((y0 + y1) / 2 - sy_at(m['t'])) * k))
    sc.add('webshot', t, x=x, y=y, src=src, iw=iw, ih=ih, w=w, h=h, bar=bar, url=url, sy=sy, marks=ms, **kw)

    def y_for(q, frac=0.4):
        r = B.get(q) if isinstance(q, str) else q
        yc = (min(b[1] for b in r) + max(b[1] + b[3] for b in r)) / 2
        return round(max(0, min(ih - h / k, yc - frac * h / k)))
    return {'m': out, 'k': k, 'y_for': y_for}


def add_doc(sc, t, paras, x, y, marks, w=2300, size=60, **kw):
    """Adds a full-bleed document page. Returns world coords: {'m': {i: (cx, cy, x0, x1)}, 'lines': [cy...], 'top': y_top}."""
    lines, pos, centers, H = doc_layout(paras, w, size)
    h = H + 700
    # sequential highlight sweep across the fragments of each mark
    for mi, frs in pos.items():
        tot = sum(f[2] - f[1] for f in frs) or 1
        d = marks[mi].get('d', 0.35 + tot / 2600)
        acc = 0
        for ln in lines:
            for sg in ln['segs']:
                if sg.get('m') == mi:
                    wd = sg['x1'] - sg['x0']; sg['dt'] = round(d * acc / tot, 3); sg['d'] = round(max(0.12, d * wd / tot), 3); acc += wd
    for ln in lines:
        for sg in ln['segs']:
            sg.pop('x0', None); sg.pop('x1', None)
            if sg.get('m') is None: sg.pop('m', None)
    sc.add('docpage', t, x=x, y=y, w=w, h=h, size=size, lines=lines, marks=marks, nodof=True, **kw)
    L, T = x - w / 2, y - h / 2
    M = {}
    for mi, frs in pos.items():
        x0 = min(f[1] for f in frs); x1 = max(f[2] for f in frs); cy = sum(f[3] for f in frs) / len(frs)
        M[mi] = (L + (x0 + x1) / 2, T + cy, L + x0, L + x1)
    return {'m': M, 'lines': [T + c for c in centers], 'top': T, 'left': L}


def look(sc, t, cx, cy, s=1.18, d=0.8, xmin=None, xmax=None):
    """Camera to (cx, cy) at scale s; optionally clamp x so the frame stays on the page."""
    half = 960 / s
    if xmin is not None: cx = max(cx, xmin + half)
    if xmax is not None: cx = min(cx, xmax - half)
    sc.cam(t, x=round(cx, 1), y=round(cy, 1), s=s, d=d)


def _two(X, cw, gap): return X - (cw + gap) / 2, X + (cw + gap) / 2


# ------------------------------------------------------------ transitions
TDUR = {'whip': 0.36, 'zoom': 0.5, 'zoomspin': 0.56, 'flash': 0.55, 'glitch': 0.3, 'push': 0.45, 'iris': 0.55}
TSFX = {'whip': ('whip', -0.2), 'zoom': ('whoosh', -0.3), 'zoomspin': ('whoosh', -0.32), 'flash': ('shimmer', -0.3),
        'glitch': ('glitch', -0.15), 'push': ('swish', -0.24), 'iris': ('swish', -0.25)}
# boundary kind pairs: A=A-roll, S=explainer scene, B=B-roll, T=title/chapter, E=end. Rotating cycles; 'cut' = hard cut.
TCYCLE = {'AS': ['zoom', 'cut', 'push', 'whip', 'cut'], 'SA': ['push', 'cut', 'glitch', 'cut', 'cut'],
          'SS': ['whip', 'zoom', 'whip', 'flash', 'iris'], 'AB': ['flash', 'whip'], 'SB': ['whip', 'flash'],
          'BB': ['whip'], 'BA': ['glitch', 'flash', 'cut'], 'BS': ['zoom', 'whip'], 'TS': ['zoom'], 'TA': ['zoom'], 'TB': ['zoom'],
          'AT': ['zoomspin'], 'ST': ['zoomspin'], 'BT': ['zoomspin'], 'AE': ['flash'], 'SE': ['flash']}


def assign_trans(blocks):
    def kind(b):
        sc = SCENES.get(b['scene']) if b['scene'] else None
        ty = sc['bg'].get('type') if sc else None
        return {'dark': 'S', 'paper': 'S', 'broll': 'B', 'title': 'T', 'end': 'E'}.get(ty, 'A')
    cnt, out, sgn = {}, [], 1
    for i in range(1, len(blocks)):
        p, q = blocks[i - 1], blocks[i]
        if p['scene'] == q['scene'] and p['scene'] is not None: continue
        key = kind(p) + kind(q)
        if key not in TCYCLE: continue
        n = cnt.get(key, 0); cnt[key] = n + 1
        k = TCYCLE[key][n % len(TCYCLE[key])]
        if k == 'cut': continue
        d = min(TDUR[k], 2 * (q['t1'] - q['t0']) * 0.45, 2 * (p['t1'] - p['t0']) * 0.45)
        if d < 0.2: continue
        sgn = -sgn
        out.append(dict(t=q['t0'], i=i, k=k, d=round(d, 3), dir=sgn))
    return out


# ------------------------------------------------------------ assemble
def build():
    vsegs, subs = [], []
    clips = [s for s in SEGS if s['kind'] == 'clip']
    for s in clips:
        t, a = s['start'], s['tin']
        pieces = []
        for c0, c1 in s.get('cuts', []):
            pieces.append((a, c0)); a = c1
        pieces.append((a, s['tout']))
        for p0, p1 in pieces:
            d = p1 - p0
            vsegs.append(dict(t0=round(t, 4), dur=round(d, 4), src=s.get('src', f"clips/{s['id']}.mp4"), **{'from': round(p0, 4)}))
            t += d
        if s.get('sub'):
            for a_, b_, txt in sub_timeline(s['say'] or s['sub'], s['sub'], 0.10, s['dur'] - 0.16):
                subs.append(dict(t0=round(s['start'] + a_, 3), t1=round(s['start'] + b_, 3), text=txt))
    # fill every clip time not covered by a scene with full-frame A-roll; alternate a 1.13x punch-in on each return
    ov = sorted(BLOCKS, key=lambda b: b['t0'])
    out, zi = [], 0
    for s in clips:
        t0, t1 = s['start'], round(s['start'] + s['dur'], 4)
        cur = t0
        for b in ov:
            if b['t1'] <= t0 or b['t0'] >= t1: continue
            if b['t0'] > cur + 0.005:
                if b['t0'] - cur < 0.35: z = 1.0 if (zi - 1) % 2 == 0 else 1.13
                else: z = 1.0 if zi % 2 == 0 else 1.13; zi += 1
                out.append(dict(t0=round(cur, 3), t1=round(b['t0'], 3), scene=None, aroll='full', zoom=[[cur, z, 50, 34]]))
            cur = max(cur, b['t1'])
        if cur < t1 - 0.005:
            if t1 - cur < 0.35: z = 1.0 if (zi - 1) % 2 == 0 else 1.13
            else: z = 1.0 if zi % 2 == 0 else 1.13; zi += 1
            out.append(dict(t0=round(cur, 3), t1=t1, scene=None, aroll='full', zoom=[[cur, z, 50, 34]]))
    blocks = sorted(out + ov, key=lambda b: b['t0'])
    # documents / charts / photos / rising panels fly in from off-screen in 3D, alternating sides
    fd = 1
    for sc in SCENES.values():
        for e in sc['els']:
            if e['k'] in ('doc', 'chart', 'photo') or (e['k'] == 'panel' and e.get('anim', 'up') == 'up'):
                e['anim'] = 'fly3d'; e['ad'] = max(e.get('ad', 0.5), 0.75); e['fdir'] = fd; fd = -fd
    trans = assign_trans(blocks)
    for tr in trans:
        snd = TSFX.get(tr['k'])
        if snd:
            SFX[:] = [x for x in SFX if not (abs(x[0] - tr['t']) < 0.2 and x[1] in ('whoosh', 'swish'))]
            SFX.append([round(tr['t'] + snd[1], 3), snd[0]])
    def _strip_en(o):  # project.json "en_labels": false -> drop English sub-labels everywhere
        if isinstance(o, dict):
            o.pop('en', None)
            for v in o.values(): _strip_en(v)
        elif isinstance(o, list):
            for v in o: _strip_en(v)
    for sc in SCENES.values():
        for e in sc['els']:
            if 'from_' in e: e['from'] = e.pop('from_')
            if CFG.get('en_labels', True) is False: _strip_en(e)
    data = dict(total=TOTAL, vsegs=vsegs, subs=subs, blocks=blocks, scenes=SCENES, trans=trans, brand=CFG.get('brand', {}),
                theme=CFG.get('theme', 'finance'), en_labels=CFG.get('en_labels', True), prop_look=CFG.get('prop_look'))
    os.makedirs(f'{ROOT}/src/data', exist_ok=True)
    json.dump(data, open(f'{ROOT}/src/data/shots.json', 'w'), ensure_ascii=False)
    json.dump(sorted(SFX), open(f'{ROOT}/sfx.json', 'w'))
    json.dump([(n, int(round(t * FPS))) for n, t in KF], open(f'{ROOT}/keyframes.json', 'w'), ensure_ascii=False)
    print('total', TOTAL, 'frames', int(round(TOTAL * FPS)), 'blocks', len(blocks), 'scenes', len(SCENES), 'sfx', len(SFX), 'subs', len(subs))
    gaps = [(round(blocks[i]['t1'], 3), round(blocks[i + 1]['t0'], 3)) for i in range(len(blocks) - 1) if abs(blocks[i]['t1'] - blocks[i + 1]['t0']) > 0.01]
    print('gaps/overlaps', gaps[:10])
    print('transitions', len(trans), dict(collections.Counter(x['k'] for x in trans)))
    print('keyframes', ' '.join(str(int(round(t * FPS))) for _, t in KF))


if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit(__doc__)
    SEGS = load_timeline(sys.argv[1]); SEG = {s['id']: s for s in SEGS}
    TOTAL = round(sum(s['dur'] for s in SEGS), 4)
    if os.path.exists(f'{ROOT}/project.json'): CFG.update(json.load(open(f'{ROOT}/project.json')))
    for f in sys.argv[2:]:
        exec(open(f).read(), globals())
    build()
