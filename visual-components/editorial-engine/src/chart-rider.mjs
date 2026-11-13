// The chart reveal clips horizontally, so interpolate by x, not by arc length.
export function chartRiderPosition(pts, progress, X, Y) {
  if (!pts.length) return null;
  if (pts.length === 1) return {x: X(0), y: Y(pts[0][1])};
  const index = Math.max(0, Math.min(1, progress)) * (pts.length - 1);
  const left = Math.min(Math.floor(index), pts.length - 2);
  const part = index - left;
  return {x: X(left) + (X(left + 1) - X(left)) * part,
    y: Y(pts[left][1]) + (Y(pts[left + 1][1]) - Y(pts[left][1])) * part};
}
