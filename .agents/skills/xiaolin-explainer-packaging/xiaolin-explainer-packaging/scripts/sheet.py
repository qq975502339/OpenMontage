#!/usr/bin/env python3
"""Build labelled review sheets from rendered stills.
usage: python3 sheet.py <stills_dir> [keyframes.json] [per_sheet=6]
Writes <stills_dir>/sheet_N.jpg (2 columns, 960x540 tiles, label bar on top)."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

d = sys.argv[1]
kf = json.load(open(sys.argv[2] if len(sys.argv) > 2 else 'keyframes.json'))
per = int(sys.argv[3]) if len(sys.argv) > 3 else 6
font = None
for fp in ['/System/Library/Fonts/STHeiti Medium.ttc', '/System/Library/Fonts/PingFang.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 'public/fonts/NotoSC.ttf']:
    try: font = ImageFont.truetype(fp, 30); break
    except Exception: pass
font = font or ImageFont.load_default()
TW, TH, LB = 960, 540, 44
items = [(n, f) for n, f in kf if os.path.exists(f'{d}/f_{f:05d}.png')]
for si in range(0, len(items), per):
    chunk = items[si:si + per]
    rows = (len(chunk) + 1) // 2
    sheet = Image.new('RGB', (TW * 2 + 30, rows * (TH + LB + 10) + 10), (24, 24, 28))
    dr = ImageDraw.Draw(sheet)
    for i, (n, f) in enumerate(chunk):
        x = 10 + (i % 2) * (TW + 10); y = 10 + (i // 2) * (TH + LB + 10)
        im = Image.open(f'{d}/f_{f:05d}.png').convert('RGB').resize((TW, TH), Image.LANCZOS)
        sheet.paste(im, (x, y + LB))
        dr.text((x + 8, y + 6), f'{n}   f{f}  {f / 24:.1f}s', fill=(240, 230, 160), font=font)
    out = f'{d}/sheet_{si // per}.jpg'
    sheet.save(out, quality=88)
    print(out)
