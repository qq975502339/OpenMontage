#!/usr/bin/env python3
"""Mix voice (from the timeline clips) + music beds + synthesized SFX into mix_raw.wav.

Usage (from the project root, after story_core.py has written sfx.json):
    python3 <skill>/scripts/mix_audio.py [timeline.json] [out.wav]

project.json (optional) keys:
    "music": [{"src": "music/bgm.mp3", "t0": "CH1", "t1": "S15.end+0.3", "off": 0,
               "clip": 0.26, "card": 0.8, "fi": 0.6, "fo": 0.8}, ...]
             clip = gain while someone is speaking, card = gain on cards / pauses.
    "sting": {"src": "music/sting.mp3", "at": "TITLE+0.75"}   strongest onset lands at `at`.
    "voice_db": -19.5                                         per-clip voice RMS target.
Time values: seconds, "SEGID" (segment start), "SEGID.end", each with an optional +/-offset.
Paths are relative to public/ unless absolute.
"""
import json, os, re, subprocess, sys
import numpy as np

ROOT = os.getcwd(); SR = 48000
TLP = sys.argv[1] if len(sys.argv) > 1 else 'timeline.json'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'mix_raw.wav'
sys.path.insert(0, ROOT)
from story_core import load_timeline  # noqa: E402  (template copy lives in the project root)
TL = load_timeline(TLP)
EV = json.load(open(f'{ROOT}/sfx.json'))
CFG = json.load(open(f'{ROOT}/project.json')) if os.path.exists(f'{ROOT}/project.json') else {}
TOTAL = TL[-1]['start'] + TL[-1]['dur']; NS = int(round(TOTAL * SR)) + SR
rng = np.random.default_rng(7)
BY = {s['id']: s for s in TL}


def P(p): return p if os.path.isabs(p) else f'{ROOT}/public/{p}'


def T(v):
    if isinstance(v, (int, float)): return float(v)
    m = re.match(r'^([A-Za-z0-9_]+?)(\.end)?([+-][0-9.]+)?$', v.strip())
    s = BY[m.group(1)]; t = s['start'] + (s['dur'] if m.group(2) else 0)
    return t + float(m.group(3) or 0)


def load(path, mono=False):
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1' if mono else '2', '-ar', str(SR), '-'],
                                     capture_output=True).stdout, np.float32)
    return a if mono else a.reshape(-1, 2)


def rms_db(x, gate=0.01):
    v = x[np.abs(x) > gate] if np.any(np.abs(x) > gate) else x
    return 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-9)


def fade(x, fi=0.008, fo=0.008):
    n1, n2 = int(fi * SR), int(fo * SR)
    if n1: x[:n1] *= np.linspace(0, 1, n1)[:, None] if x.ndim == 2 else np.linspace(0, 1, n1)
    if n2: x[-n2:] *= np.linspace(1, 0, n2)[:, None] if x.ndim == 2 else np.linspace(1, 0, n2)
    return x


# ------------------------------------------------------------ voice
voice = np.zeros(NS, np.float32); voice_active = np.zeros(NS, bool)
for s in TL:
    if s['kind'] != 'clip': continue
    sel = f"between(t\\,{s['tin']}\\,{s['tout']})" + ''.join(f"*not(between(t\\,{a}\\,{b}))" for a, b in s.get('cuts', []))
    src = P(s.get('src', f"clips/{s['id']}.mp4"))
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-af', f"aselect='{sel}',asetpts=N/SR/TB,highpass=f=70",
                                      '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout, np.float32).copy()
    n = int(round(s['dur'] * SR)); a = np.pad(a, (0, max(0, n - len(a))))[:n]
    g = 10 ** ((CFG.get('voice_db', -19.5) - rms_db(a)) / 20) if np.any(a) else 1
    a = fade(a * g * s.get('gain', 1.0), 0.01, 0.02)
    i0 = int(round(s['start'] * SR)); voice[i0:i0 + n] += a; voice_active[i0:i0 + n] = True
pk = np.abs(voice); thr = 0.5
voice = np.where(pk > thr, np.sign(voice) * (thr + (pk - thr) / 3), voice).astype(np.float32)

# ------------------------------------------------------------ music (ducked under speech)
music = np.zeros((NS, 2), np.float32); _cache = {}
for m in CFG.get('music', []):
    if m['src'] not in _cache:
        a = load(P(m['src'])); _cache[m['src']] = a * (10 ** ((-21.0 - rms_db(a, 0.005)) / 20))
    a = _cache[m['src']]; t0, t1 = T(m['t0']), T(m['t1']); n = int((t1 - t0) * SR); src = int(m.get('off', 0) * SR)
    out = np.zeros((n, 2), np.float32); pos = 0
    while pos < n:
        take = min(n - pos, len(a) - src); chunk = a[src:src + take].copy()
        if pos > 0: xf = min(int(1.5 * SR), take); chunk[:xf] *= np.linspace(0, 1, xf)[:, None]
        out[pos:pos + take] += chunk; pos += take; src = min(int(10 * SR), len(a) // 3)
    i0 = int(t0 * SR); act = voice_active[i0:i0 + n].astype(np.float32); act = np.pad(act, (0, n - len(act)))
    k = int(0.25 * SR); env = np.convolve(act, np.ones(k) / k, mode='same')
    out *= (m.get('card', 0.8) + (m.get('clip', 0.26) - m.get('card', 0.8)) * env)[:, None]
    out = fade(out, m.get('fi', 0.6), m.get('fo', 0.8)); music[i0:i0 + n] += out[: max(0, min(n, NS - i0))]
if CFG.get('sting'):
    st = load(P(CFG['sting']['src']))[: 20 * SR]
    mm = np.abs(st).mean(1); k = int(0.02 * SR); env = np.convolve(mm, np.ones(k) / k, mode='same')
    boom = np.argmax(np.diff(env[::k])[: int(12 * SR / k)]) * k / SR; at = T(CFG['sting']['at'])
    s0 = int(max(0, boom - 0.75) * SR); seg = st[s0:s0 + int(4.4 * SR)].copy()
    seg *= 0.5 / (np.abs(seg).max() + 1e-9); seg = fade(seg, 0.05, 1.2)
    i0 = int((at - min(boom, 0.75)) * SR); music[i0:i0 + len(seg)] += seg[: NS - i0]


# ------------------------------------------------------------ sfx bank (all synthesized, no files needed)
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))


def whoosh(d=0.42, g=0.22):
    n = int(d * SR); x = rng.standard_normal(n).astype(np.float32); y = np.zeros(n, np.float32); a_lo = np.linspace(0.02, 0.35, n); acc = 0
    for i in range(n): acc += a_lo[i] * (x[i] - acc); y[i] = acc
    y = y * np.sin(np.linspace(0, np.pi, n)) ** 2
    return np.stack([y, np.roll(y, 120)], 1) * g / (np.abs(y).max() + 1e-9)


def tone(freqs, d, tau, g):
    n = int(d * SR); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * t) * (0.6 ** i) for i, f in enumerate(freqs)) * env_exp(n, tau); y[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return np.stack([y, y], 1).astype(np.float32) * g / (np.abs(y).max() + 1e-9)


def pop(g=0.2):
    n = int(0.09 * SR); f = np.linspace(380, 980, n); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.025)
    return np.stack([y, y], 1).astype(np.float32) * g


def typing(d, g=0.09):
    n = int(d * SR); y = np.zeros(n, np.float32); t = 0.0
    while t < d - 0.02:
        i = int(t * SR); m = int(0.007 * SR); c = rng.standard_normal(m) * env_exp(m, 0.0018)
        c = np.diff(np.concatenate([[0], c])); y[i:i + m] += c[: n - i]; t += rng.uniform(0.055, 0.1)
    return np.stack([y, y], 1) * g / (np.abs(y).max() + 1e-9)


def kaching(g=0.22):
    a = tone([2093, 3136, 4186], 0.7, 0.18, 1); b = tone([2637, 3951], 0.6, 0.15, 1); out = a.copy(); o = int(0.07 * SR)
    m = min(len(b), len(a) - o); out[o:o + m] += b[:m]
    nz = rng.standard_normal(int(0.05 * SR)) * env_exp(int(0.05 * SR), 0.01); out[: len(nz)] += np.stack([nz, nz], 1) * 0.5
    return out * g / (np.abs(out).max() + 1e-9)


def buzz(g=0.1):
    n = int(0.32 * SR); t = np.arange(n) / SR; y = np.sign(np.sin(2 * np.pi * 150 * t)) * env_exp(n, 0.15)
    return np.stack([y, y], 1).astype(np.float32) * g


def marker(g=0.07):
    n = int(0.5 * SR); x = rng.standard_normal(n); y = np.convolve(x, np.ones(6) / 6, 'same') * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 9))
    y *= np.sin(np.linspace(0, np.pi, n))
    return np.stack([y, y], 1).astype(np.float32) * g / (np.abs(y).max() + 1e-9)


def glitch(g=0.13):
    n = int(0.3 * SR); y = np.zeros(n, np.float32); t = 0
    while t < n - 400:
        m = int(rng.uniform(0.012, 0.04) * SR); c = np.round(rng.standard_normal(m) * 3) / 3
        if rng.random() < 0.4: c = np.sign(np.sin(2 * np.pi * rng.uniform(90, 400) * np.arange(m) / SR))
        y[t:t + m] += c[: n - t] * rng.uniform(0.4, 1); t += m + int(rng.uniform(0.005, 0.03) * SR)
    y *= np.linspace(1, 0.5, n)
    return np.stack([y, np.roll(y, 60)], 1) * g / (np.abs(y).max() + 1e-9)


def shimmer(d=0.6, g=0.1):
    n = int(d * SR); t = np.arange(n) / SR; x = rng.standard_normal(n).astype(np.float32); hp = x - np.convolve(x, np.ones(9) / 9, 'same')
    tone_ = sum(np.sin(2 * np.pi * f * t * (1 + 0.15 * t / d)) for f in (1760, 2637, 3520)) / 3
    y = (hp * 0.7 + tone_ * 0.35) * np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return np.stack([y, np.roll(y, 90)], 1).astype(np.float32) * g / (np.abs(y).max() + 1e-9)


BANK = {'whoosh': whoosh(), 'swish': whoosh(0.28, 0.12), 'whip': whoosh(0.34, 0.2), 'glitch': glitch(), 'shimmer': shimmer(),
        'ding': tone([1318.5, 1975.5, 2637], 0.7, 0.22, 0.13), 'pop': pop(0.16), 'kaching': kaching(), 'buzz': buzz(), 'marker': marker()}
sfx = np.zeros((NS, 2), np.float32)


def put(t, a):
    i = int(t * SR)
    if 0 <= i < NS: m = min(len(a), NS - i); sfx[i:i + m] += a[:m]


cnt = 0; last = {}
for t, name in sorted([list(e[:2]) for e in EV]):
    if name in last and t - last[name] < 0.12: continue
    last[name] = t
    if name == 'typing': put(t, typing(1.6)); cnt += 1
    elif name in BANK: put(t - (0.1 if name in ('whoosh', 'swish') else 0), BANK[name]); cnt += 1

mix = voice[:, None] * np.array([1, 1], np.float32) + music + sfx
va = voice_active & (np.abs(voice) > 0.003)


def _db(x): return round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)), 1)


print('sfx events', cnt, '| levels under speech (dBFS RMS): voice', _db(voice[va]), 'music', _db(music[va]), 'sfx', _db(sfx[va]))
print('target: voice about -20, music 12-16 dB below voice, sfx 20+ dB below voice')
mix = mix[: int(round(TOTAL * SR))]; pk = np.abs(mix).max()
mix = np.tanh(mix * 1.1) / np.tanh(1.1) if pk > 0.95 else mix
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'pcm_s24le', OUT], input=mix.astype(np.float32).tobytes())
print('wrote', OUT, round(len(mix) / SR, 2), 's peak', round(float(pk), 3))
