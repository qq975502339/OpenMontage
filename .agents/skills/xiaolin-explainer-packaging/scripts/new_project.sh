#!/usr/bin/env bash
# Create a packaging project from the skill template.
#   new_project.sh <project_dir> [--demo]
# --demo also writes a 4-segment demo timeline + synthetic A-roll clips so the pipeline can be smoke-tested.
# YouShe.ttf (优设标题黑) is not redistributed with the shared package. If it is missing, this script looks for it
# in $YOUSHE_TTF and the usual font folders; otherwise titles and subtitles fall back to Noto Sans SC.
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"; P=${1:?usage: new_project.sh <project_dir> [--demo]}
command -v node >/dev/null || { echo "node >= 18 required (download a node tarball and put its bin/ on PATH)"; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg required"; exit 1; }
mkdir -p "$P"; cp -R "$SKILL/templates/engine/." "$P/"
mkdir -p "$P/public/clips" "$P/public/broll" "$P/public/footage" "$P/public/photos" "$P/public/music" "$P/stills"
[ -f "$P/project.json" ] || cp "$SKILL/templates/project.example.json" "$P/project.json"
YS="$P/public/fonts/YouShe.ttf"
if [ ! -f "$YS" ]; then
  for c in "${YOUSHE_TTF:-}" "$HOME"/Library/Fonts/*YouShe* "$HOME"/Library/Fonts/*优设标题黑* /Library/Fonts/*YouShe* \
           "$HOME"/.local/share/fonts/*YouShe* "$HOME"/.fonts/*YouShe* /usr/share/fonts/*/*YouShe* "$HOME"/*优设标题黑*.ttf; do
    if [ -n "$c" ] && [ -f "$c" ]; then cp "$c" "$YS"; echo "YouShe font: copied from $c"; break; fi
  done
  [ -f "$YS" ] || echo "NOTE: YouShe.ttf (优设标题黑) not found. Titles/subtitles will use Noto Sans SC Black (no slant). Download it from https://www.uisdc.com/uisdc-first-free-font and save it as public/fonts/YouShe.ttf"
fi
if [ "$2" = "--demo" ]; then
  cp "$SKILL/templates/timeline.example.json" "$P/timeline.json"; cp "$SKILL/templates/scenes_example.py" "$P/scenes.py"
  # layout gallery (v7 layouts): python3 story_core.py timeline_gallery.json scenes_gallery.py
  cp "$SKILL/templates/timeline_gallery.json" "$SKILL/templates/scenes_gallery.py" "$P/"
  # treatment demo (skeleton + per-topic props and photos): python3 story_core.py timeline_treat.json scenes_treat.py
  cp "$SKILL/templates/timeline_treat.json" "$SKILL/templates/scenes_treat.py" "$P/"; cp -R "$SKILL/templates/demo_assets/." "$P/public/"
  # style check (same 9 frames, 3 unrelated topics) for comparing themes: python3 story_core.py timeline_cross.json scenes_cross.py
  cp "$SKILL/templates/timeline_cross.json" "$SKILL/templates/scenes_cross.py" "$P/"
  for id in D01 D02 D03 D04; do
    ffmpeg -v error -y -f lavfi -i "color=c=0x5a6b7a:s=1920x1080:r=24:d=14" -f lavfi -i "sine=f=220:d=14" \
      -vf "drawbox=x=760:y=260:w=400:h=560:color=0xd9c4b0:t=fill" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "$P/public/clips/$id.mp4"
  done
fi
cd "$P" && npm install --no-audit --no-fund --loglevel=error
echo "project ready: $P"
