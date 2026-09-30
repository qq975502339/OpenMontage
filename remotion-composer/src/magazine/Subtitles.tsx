// ---------------------------------------------------------------------------
// Burned-in subtitles for a page. Cue times are seconds relative to the page;
// rendered bottom-center with a dark scrim so it reads on both paper pages
// and live footage. Includes a short opacity fade at each cue boundary.
// ---------------------------------------------------------------------------

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { SubtitleCue } from "./types";

export const PageSubtitles: React.FC<{
  cues?: SubtitleCue[];
  vertical?: boolean;
}> = ({ cues, vertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!cues || cues.length === 0) return null;

  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t <= c.end);
  if (!cue) return null;

  const duration = cue.end - cue.start;
  // Shrink the fade for very short cues so the input range stays strictly
  // increasing (fade-in end must not cross fade-out start).
  const FADE = Math.min(0.12, duration / 4);
  const fadeInEnd = cue.start + FADE;
  const fadeOutStart = cue.end - FADE;
  const opacity =
    fadeInEnd >= fadeOutStart
      ? 1
      : interpolate(
          t,
          [cue.start, fadeInEnd, fadeOutStart, cue.end],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: vertical ? 260 : 64,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          opacity,
          maxWidth: vertical ? 900 : 1300,
          padding: vertical ? "16px 34px" : "18px 44px",
          background: "rgba(24,20,16,0.72)",
          color: "#F7F2E6",
          fontFamily: "NotoSansSC, sans-serif",
          fontSize: vertical ? 42 : 38,
          lineHeight: 1.4,
          letterSpacing: 1,
          textAlign: "center",
          borderRadius: 8,
        }}
      >
        {cue.text}
      </span>
    </div>
  );
};
