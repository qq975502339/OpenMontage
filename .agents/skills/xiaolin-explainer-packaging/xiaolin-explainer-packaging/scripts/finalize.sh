#!/usr/bin/env bash
# Mux picture + mix, normalise loudness to -16 LUFS / -1.5 dBTP, then fully decode to verify.
#   finalize.sh <video.mp4> <mix_raw.wav> <out.mp4>
set -e
V=${1:?video}; A=${2:?mix}; OUT=${3:?out}
ffmpeg -v error -y -i "$V" -i "$A" -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000" \
  -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
ffmpeg -v error -i "$OUT" -f null - 2>&1 | head -5; echo "decode-check done (no lines above = clean)"
ffmpeg -hide_banner -i "$OUT" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:|^\s+LRA:|Peak" | tail -3
