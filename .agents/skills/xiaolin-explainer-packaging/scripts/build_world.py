# Natural Earth 1:110m admin-0 countries (public domain) -> Natural Earth I projected SVG paths.
# Antarctica dropped; Taiwan merged into CHN. Output: src/geo/world110.json {S, ox, oy, W, H, c: {ISO3: "d"}}
import json, math, sys, os
src, out = sys.argv[1], sys.argv[2]
def ne1(lon, lat):
    l, p = math.radians(lon), math.radians(lat); p2 = p * p; p4 = p2 * p2
    x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)))
    y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)))
    return x, y
xmax = ne1(180, 0)[0]; ymax = ne1(0, 85)[1]; ymin = ne1(0, -58)[1]
W = 2000; S = W / (2 * xmax); ox = W / 2; oy = ymax * S; H = round((ymax - ymin) * S)
d = json.load(open(src)); C = {}
for f in d['features']:
    p = f['properties']; iso = p['ADM0_A3']
    if iso == 'ATA': continue
    if iso == 'TWN': iso = 'CHN'
    g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    parts = []
    for poly in polys:
        for ring in poly[:1]:  # outer rings only at this scale
            pts = []
            for lon, lat in ring:
                x, y = ne1(lon, lat); X = round(ox + x * S, 1); Y = round(oy - y * S, 1)
                if not pts or (abs(X - pts[-1][0]) + abs(Y - pts[-1][1]) > 0.6): pts.append((X, Y))
            if len(pts) >= 3: parts.append('M' + 'L'.join(f'{a:g} {b:g}' for a, b in pts) + 'Z')
    C[iso] = C.get(iso, '') + ''.join(parts)
json.dump({'S': round(S, 4), 'ox': ox, 'oy': round(oy, 2), 'W': W, 'H': H, 'c': C}, open(out, 'w'), separators=(',', ':'))
print(len(C), 'countries', os.path.getsize(out) // 1024, 'KB', 'H', H)
