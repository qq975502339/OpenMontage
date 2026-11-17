#!/usr/bin/env python3
"""Prepare generated prop images for the engine (references/treatment.md section 4).

    python3 prop_prep.py IN.png [IN2.png ...] -o public/props/<topic>/ [--max 800] [--pad 12] [--luma]

- downscales so the longer side is at most --max px (a prop is never shown wider than ~800 px)
- trims fully transparent margins, keeping --pad px around the drawing
- --luma: for light-on-dark line art (lineart_white, chalk, neon) that came back with a dark fill inside the
  silhouette: alpha becomes the brightest RGB channel (dark fill -> transparent, bright lines -> opaque) and the
  colour is kept, so the drawing sits on any dark page and `tint` can recolour it
- prints the share of opaque pixels; under ~0.05 means the drawing is very thin (scale it up or use a bolder style)
"""
import argparse, os, sys
from PIL import Image, ImageChops

ap = argparse.ArgumentParser()
ap.add_argument('src', nargs='+')
ap.add_argument('-o', '--out', required=True)
ap.add_argument('--max', type=int, default=800)
ap.add_argument('--pad', type=int, default=12)
ap.add_argument('--luma', action='store_true')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
for p in a.src:
    im = Image.open(p).convert('RGBA')
    if a.luma:
        r, g, b, al = im.split()
        y = ImageChops.lighter(ImageChops.lighter(r, g), b)  # brightest channel, so coloured neon tubes stay opaque
        # stretch: below 40 -> 0, above 200 -> 255
        y = y.point(lambda v: 0 if v < 40 else 255 if v > 200 else int((v - 40) * 255 / 160))
        al = ImageChops.multiply(al, y)
        im = Image.merge('RGBA', (r, g, b, al))
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if bb is None:
        print(f'{p}: empty image, skipped', file=sys.stderr); continue
    x0, y0, x1, y1 = bb
    im = im.crop((max(0, x0 - a.pad), max(0, y0 - a.pad), min(im.width, x1 + a.pad), min(im.height, y1 + a.pad)))
    im.thumbnail((a.max, a.max), Image.LANCZOS)
    al = im.getchannel('A')
    cov = sum(1 for v in al.getdata() if v > 16) / (im.width * im.height)
    dst = os.path.join(a.out, os.path.basename(p))
    im.save(dst, optimize=True)
    print(f'{dst} {im.size[0]}x{im.size[1]} opaque {cov:.2f}' + ('  (thin drawing)' if cov < 0.05 else ''))
