#!/usr/bin/env python3
"""Usage (project root): python3 audit.py [video.mp4] [step_frames=72]
Audit: compare rendered video frames with renderStill output at sampled frames.
Flags frames where a local 40x40 block differs strongly (e.g. gradient text rendered as a box)."""
import subprocess, os, glob, json, sys
import numpy as np
from PIL import Image, ImageDraw
P = os.getcwd(); VIDEO = sys.argv[1] if len(sys.argv) > 1 else "video.mp4"; STEP = int(sys.argv[2]) if len(sys.argv) > 2 else 72
VID = VIDEO if os.path.isabs(VIDEO) else f"{P}/{VIDEO}"; D = f"{P}/stills/audit"; os.makedirs(f"{D}/v", exist_ok=True); os.makedirs(f"{D}/s", exist_ok=True)
SKIP = os.environ.get("SKIP") == "1"
TOTALF = int(round(json.load(open(f"{P}/src/data/shots.json"))["total"] * 24))
frames = list(range(0, TOTALF, STEP))
if not SKIP:
  for f in glob.glob(f"{D}/v/*.png") + glob.glob(f"{D}/s/*.png"): os.remove(f)
  subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VID, "-vf", f"select='not(mod(n\\,{STEP}))'", "-fps_mode", "passthrough", f"{D}/v/v_%05d.png"], check=True)
env = dict(os.environ)
for i in (range(0, len(frames), 60) if not SKIP else []):
    subprocess.run(["node", "render.mjs", "stills", f"{D}/s"] + [str(x) for x in frames[i:i + 60]], cwd=P, env=env, capture_output=True)
res = []
for k, fr in enumerate(frames):
    vp, sp = f"{D}/v/v_{k + 1:05d}.png", f"{D}/s/f_{fr:05d}.png"
    if not (os.path.exists(vp) and os.path.exists(sp)): res.append((fr, -1, -1)); continue
    a = np.asarray(Image.open(vp).convert("RGB").resize((960, 540)), np.float32)
    b = np.asarray(Image.open(sp).convert("RGB").resize((960, 540)), np.float32)
    d = np.abs(a - b).mean(2)
    blk = d[: 540 // 20 * 20, : 960 // 20 * 20].reshape(27, 20, 48, 20).mean((1, 3))
    res.append((fr, float(d.mean()), float(blk.max())))
json.dump(res, open(f"{D}/audit.json", "w"))
miss = [r for r in res if r[1] < 0]
bad = sorted([r for r in res if r[2] > 38], key=lambda r: -r[2])
print("frames", len(res), "missing", len(miss), "flagged", len(bad))
print("mean diff median", round(float(np.median([r[1] for r in res if r[1] >= 0])), 2), "block max p95", round(float(np.percentile([r[2] for r in res if r[2] >= 0], 95)), 1))
for r in bad[:24]: print("flag", r[0], f"t={r[0] / 24:.1f}s", round(r[1], 1), round(r[2], 1))
if bad:
    sh = Image.new("RGB", (960, 290 * min(8, len(bad))), "black"); dr = ImageDraw.Draw(sh)
    for i, r in enumerate(bad[:8]):
        k = frames.index(r[0])
        sh.paste(Image.open(f"{D}/v/v_{k + 1:05d}.png").convert("RGB").resize((480, 270)), (0, i * 290))
        sh.paste(Image.open(f"{D}/s/f_{r[0]:05d}.png").convert("RGB").resize((480, 270)), (480, i * 290))
        dr.text((6, i * 290 + 272), f"frame {r[0]}  video | still  blockmax {r[2]:.0f}", fill="yellow")
    sh.save(f"{D}/flagged.jpg", quality=85)
