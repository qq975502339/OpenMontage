import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { BrandConfig, MagazineSkin } from "./types";

// ---- entrance helpers -------------------------------------------------------

export function useRise(delay = 0, distance = 28) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 90, mass: 0.9 },
    durationInFrames: 24,
  });
  return {
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
  };
}

// ---- text with **bold accent** markup --------------------------------------

export function RichText({
  text,
  skin,
  style,
}: {
  text: string;
  skin: MagazineSkin;
  style?: React.CSSProperties;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <span key={i} style={{ color: skin.accent, fontWeight: 700 }}>
            {p.slice(2, -2)}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
}

// ---- small editorial tag chip ----------------------------------------------

export const TagChip: React.FC<{ text: string; skin: MagazineSkin }> = ({
  text,
  skin,
}) => (
  <span
    style={{
      display: "inline-block",
      border: `1px solid ${skin.accent}`,
      color: skin.accent,
      fontFamily: skin.bodyFont,
      fontSize: 19,
      letterSpacing: 3,
      padding: "5px 14px",
      lineHeight: 1,
    }}
  >
    {text}
  </span>
);

export const TagRow: React.FC<{ tags: string[]; skin: MagazineSkin }> = ({
  tags,
  skin,
}) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
    {tags.map((t) => (
      <TagChip key={t} text={t} skin={skin} />
    ))}
  </div>
);

// ---- standfirst / dek -------------------------------------------------------

export const Dek: React.FC<{ text: string; skin: MagazineSkin }> = ({
  text,
  skin,
}) => (
  <div
    style={{
      fontFamily: skin.bodyFont,
      fontSize: 27,
      lineHeight: 1.6,
      color: skin.mutedInk,
      borderLeft: `4px solid ${skin.accent}`,
      paddingLeft: 22,
    }}
  >
    {text}
  </div>
);

// ---- masthead (top of every page) ------------------------------------------

export const Masthead: React.FC<{ brand: BrandConfig; skin: MagazineSkin }> = ({
  brand,
  skin,
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 110,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 90px",
      borderTop: `6px solid ${skin.accent}`,
      borderBottom: `1px solid ${skin.rule}`,
      color: skin.mutedInk,
      fontFamily: skin.bodyFont,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <span
        style={{
          width: 16,
          height: 16,
          background: skin.accent,
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: 26, letterSpacing: 4, color: skin.ink, fontWeight: 700 }}>
        {brand.column}
      </span>
      <TagChip text="专题" skin={skin} />
    </div>
    <span style={{ fontSize: 20, letterSpacing: 2 }}>{brand.issue}</span>
  </div>
);

// ---- footer with page number ------------------------------------------------

export const PageFooter: React.FC<{
  brand: BrandConfig;
  index: number;
  total: number;
  skin: MagazineSkin;
}> = ({ brand, index, total, skin }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 90px",
      color: skin.mutedInk,
      fontFamily: skin.bodyFont,
      fontSize: 18,
      letterSpacing: 2,
      borderTop: `1px solid ${skin.rule}`,
    }}
  >
    <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span
        style={{
          display: "inline-block",
          width: 28,
          height: 4,
          background: skin.accent,
        }}
      />
      {brand.column}
    </span>
    <span>
      {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
  </div>
);

// ---- page shell: paper + masthead + footer ----------------------------------

export const PageShell: React.FC<{
  brand: BrandConfig;
  skin: MagazineSkin;
  index: number;
  total: number;
  children: React.ReactNode;
}> = ({ brand, skin, index, total, children }) => {
  const frame = useCurrentFrame();
  // subtle paper fade-in on each page cut
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: skin.paper, opacity }}>
      <Masthead brand={brand} skin={skin} />
      <div style={{ position: "absolute", top: 110, bottom: 70, left: 0, right: 0 }}>
        {children}
      </div>
      <PageFooter brand={brand} index={index} total={total} skin={skin} />
    </AbsoluteFill>
  );
};
