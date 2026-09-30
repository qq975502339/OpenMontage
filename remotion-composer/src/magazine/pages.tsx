import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { BrandConfig, MagazinePage, MagazineSkin } from "./types";
import { Dek, PageShell, RichText, TagRow, useRise } from "./primitives";
import { resolveAsset } from "../lib/resolveAsset";

const PAD = 90;

// 1. chapter cover — vertical editorial spread -------------------------------
const ChapterPage: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => {
  const left = useRise(0);
  const right = useRise(10, 40);
  return (
    <div
      style={{
        padding: `0 ${PAD}px`,
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        gap: 80,
      }}
    >
      {/* left rail: kicker + giant chapter mark + seal */}
      <div
        style={{
          ...left,
          width: 460,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingRight: 80,
          borderRight: `1px solid ${skin.rule}`,
        }}
      >
        <div
          style={{
            color: skin.accent,
            fontFamily: skin.bodyFont,
            fontSize: 24,
            letterSpacing: 8,
            marginBottom: 34,
          }}
        >
          {page.kicker}
        </div>
        <div
          style={{
            fontFamily: skin.headingFont,
            fontSize: 118,
            fontWeight: 700,
            color: skin.ink,
            lineHeight: 1.1,
          }}
        >
          {page.chapterNumber}
        </div>
        <div
          style={{
            width: 90,
            height: 6,
            background: skin.accent,
            margin: "36px 0",
          }}
        />
      </div>
      {/* right: title + standfirst + tags */}
      <div
        style={{
          ...right,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 34,
        }}
      >
        {page.tags && <TagRow tags={page.tags} skin={skin} />}
        <div
          style={{
            fontFamily: skin.headingFont,
            fontSize: 82,
            fontWeight: 600,
            color: skin.ink,
            lineHeight: 1.28,
            maxWidth: 1180,
          }}
        >
          {page.title}
        </div>
        {page.dek && <Dek text={page.dek} skin={skin} />}
      </div>
    </div>
  );
};

// 2. stat card — inset data panel with supporting figures --------------------
const CompareRow: React.FC<{
  value: string;
  label: string;
  index: number;
  skin: MagazineSkin;
}> = ({ value, label, index, skin }) => {
  const r = useRise(14 + index * 7, 18);
  return (
    <div
      style={{
        ...r,
        display: "flex",
        alignItems: "baseline",
        gap: 20,
        paddingBottom: 20,
        borderBottom: `1px solid ${skin.rule}`,
      }}
    >
      <span
        style={{
          fontFamily: skin.headingFont,
          fontSize: 52,
          fontWeight: 700,
          color: skin.accent,
          minWidth: 300,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      <span style={{ fontFamily: skin.bodyFont, fontSize: 25, color: skin.mutedInk, lineHeight: 1.4 }}>
        {label}
      </span>
    </div>
  );
};

const CompareRows: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 26, flex: 1, justifyContent: "center" }}>
    {page.compare?.map((c, i) => (
      <CompareRow key={i} value={c.value} label={c.label} index={i} skin={skin} />
    ))}
  </div>
);

const StatPage: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => {
  const frame = useCurrentFrame();
  // 数字增长固定在开场 1.5 秒内完成，不随整页时长拉长
  const grow = interpolate(frame, [8, 53], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const value = page.statDisplay ?? String(page.statValue ?? 0);
  // count-up only when a raw numeric value exists and no display override
  const shown =
    page.statDisplay !== undefined || page.statValue === undefined
      ? value
      : Math.round((page.statValue as number) * grow).toLocaleString("zh-CN");
  const head = useRise(0);
  return (
    <div
      style={{
        padding: `48px ${PAD}px 30px`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          ...head,
          background: skin.paperDeep,
          borderLeft: `8px solid ${skin.accent}`,
          padding: "52px 64px",
          display: "flex",
          alignItems: "center",
          gap: 70,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", minWidth: page.compare ? 520 : undefined }}>
          <div
            style={{
              fontFamily: skin.bodyFont,
              color: skin.mutedInk,
              fontSize: 25,
              letterSpacing: 4,
              marginBottom: 20,
            }}
          >
            {page.kicker}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <span
              style={{
                fontFamily: skin.headingFont,
                fontSize: 196,
                fontWeight: 700,
                color: skin.accent,
                lineHeight: 1,
              }}
            >
              {shown}
            </span>
            <span style={{ fontFamily: skin.bodyFont, fontSize: 50, color: skin.ink }}>
              {page.statUnit}
            </span>
          </div>
        </div>
        {page.compare && <CompareRows page={page} skin={skin} />}
      </div>
      <div style={{ padding: `0 12px`, display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            fontFamily: skin.headingFont,
            fontSize: 42,
            color: skin.ink,
            maxWidth: 1400,
            lineHeight: 1.35,
          }}
        >
          {page.title}
        </div>
        {page.note && (
          <div style={{ fontFamily: skin.bodyFont, fontSize: 21, color: skin.mutedInk }}>
            {page.note}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. body reading page --------------------------------------------------------
const BodyParagraph: React.FC<{ text: string; index: number; skin: MagazineSkin }> = ({
  text,
  index,
  skin,
}) => {
  const r = useRise(10 + index * 8, 20);
  // first paragraph is the lede: larger measure
  const lede = index === 0;
  return (
    <div
      style={{
        ...r,
        fontFamily: skin.bodyFont,
        fontSize: lede ? 34 : 31,
        lineHeight: 1.75,
        color: skin.ink,
        maxWidth: 1560,
        fontWeight: lede ? 500 : 400,
      }}
    >
      <RichText text={text} skin={skin} />
    </div>
  );
};

const BodyPage: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => (
  <div
    style={{
      padding: `48px ${PAD}px 30px`,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 26,
    }}
  >
    {page.kicker && (
      <div style={{ color: skin.accent, fontFamily: skin.bodyFont, fontSize: 22, letterSpacing: 6 }}>
        {page.kicker}
      </div>
    )}
    <div
      style={{
        fontFamily: skin.headingFont,
        fontSize: 56,
        fontWeight: 700,
        color: skin.ink,
        lineHeight: 1.22,
      }}
    >
      {page.title}
    </div>
    {page.dek && <Dek text={page.dek} skin={skin} />}
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 4 }}>
      {page.paragraphs?.map((p, i) => (
        <BodyParagraph key={i} text={p} index={i} skin={skin} />
      ))}
    </div>
    {page.note && (
      <div
        style={{
          marginTop: "auto",
          alignSelf: "flex-start",
          background: skin.paperDeep,
          borderLeft: `4px solid ${skin.accent}`,
          padding: "16px 24px",
          fontFamily: skin.bodyFont,
          fontSize: 21,
          color: skin.mutedInk,
          maxWidth: 1500,
        }}
      >
        {page.note}
      </div>
    )}
  </div>
);

// 4. pull-quote bar — red banner, white serif --------------------------------
const QuotePage: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => {
  const r = useRise(4, 30);
  const tag = useRise(0);
  return (
    <AbsoluteFill style={{ padding: `0 ${PAD}px`, display: "flex", alignItems: "center" }}>
      <div
        style={{
          ...r,
          width: "100%",
          background: skin.highlight,
          color: skin.highlightInk,
          padding: "70px 80px",
        }}
      >
        <div style={{ ...tag, display: "flex", justifyContent: "space-between", marginBottom: 34 }}>
          <span
            style={{
              border: `1px solid ${skin.highlightInk}`,
              color: skin.highlightInk,
              fontFamily: skin.bodyFont,
              fontSize: 20,
              letterSpacing: 6,
              padding: "6px 16px",
            }}
          >
            金句
          </span>
          <span style={{ fontFamily: skin.bodyFont, fontSize: 20, letterSpacing: 4, opacity: 0.7 }}>
            {page.kicker}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
          <span style={{ fontFamily: skin.headingFont, fontSize: 130, lineHeight: 0.75, opacity: 0.85 }}>
            “
          </span>
          <span style={{ fontFamily: skin.headingFont, fontSize: 58, fontWeight: 700, lineHeight: 1.45 }}>
            {page.quote}
          </span>
        </div>
        {page.attribution && (
          <div
            style={{
              marginTop: 30,
              textAlign: "right",
              fontFamily: skin.bodyFont,
              fontSize: 22,
              letterSpacing: 2,
              opacity: 0.78,
            }}
          >
            —— {page.attribution}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// 5. list page — red square index + annotations ------------------------------
const ListItem: React.FC<{
  text: string;
  note?: string;
  index: number;
  ordered?: boolean;
  skin: MagazineSkin;
}> = ({ text, note, index, ordered, skin }) => {
  const r = useRise(6 + index * 7, 18);
  return (
    <div
      style={{
        ...r,
        display: "flex",
        alignItems: "flex-start",
        gap: 30,
        paddingBottom: 24,
        borderBottom: `1px solid ${skin.rule}`,
      }}
    >
      {ordered ? (
        <span
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            background: skin.accent,
            color: skin.paper,
            fontFamily: skin.headingFont,
            fontSize: 24,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : (
        <span
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            border: `2px solid ${skin.accent}`,
            marginTop: 4,
          }}
        />
      )}
      <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontFamily: skin.bodyFont, fontSize: 32, lineHeight: 1.5, color: skin.ink }}>
          <RichText text={text} skin={skin} />
        </span>
        {note && (
          <span style={{ fontFamily: skin.bodyFont, fontSize: 23, lineHeight: 1.5, color: skin.mutedInk }}>
            {note}
          </span>
        )}
      </span>
    </div>
  );
};

const ListPage: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => (
  <div
    style={{
      padding: `44px ${PAD}px 28px`,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 22,
    }}
  >
    {page.kicker && (
      <div style={{ color: skin.accent, fontFamily: skin.bodyFont, fontSize: 22, letterSpacing: 6 }}>
        {page.kicker}
      </div>
    )}
    <div style={{ fontFamily: skin.headingFont, fontSize: 52, fontWeight: 700, color: skin.ink, lineHeight: 1.2 }}>
      {page.title}
    </div>
    {page.dek && <Dek text={page.dek} skin={skin} />}
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 8 }}>
      {page.items?.map((it, i) => (
        <ListItem
          key={i}
          text={it}
          note={page.itemNotes?.[i]}
          index={i}
          ordered={page.ordered}
          skin={skin}
        />
      ))}
    </div>
  </div>
);

// footage treatment: warm grade + grain + vignette, slow push-in ---------------
export const FootageMedia: React.FC<{
  page: MagazinePage;
  skin: MagazineSkin;
  cover?: boolean;
  brand: BrandConfig;
}> = ({ page, skin, cover = true, brand }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = 1.04 + progress * 0.1;
  const common = {
    style: { width: "100%", height: "100%", objectFit: "cover" as const, transform: `scale(${scale})` },
  };
  const caption = useRise(8, 24);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      {page.clips && page.clips.length > 0 ? (
        page.clips.map((clip, i) => {
          const clipFrames = Math.max(1, Math.round(clip.durationSeconds * fps));
          const acc = page
            .clips!.slice(0, i)
            .reduce((sum, c) => sum + Math.max(1, Math.round(c.durationSeconds * fps)), 0);
          return (
            <Sequence
              key={`${clip.source}-${i}`}
              from={acc}
              durationInFrames={i === page.clips!.length - 1 ? undefined : clipFrames}
              layout="none"
            >
              <OffthreadVideo src={resolveAsset(clip.source)} muted {...common} />
            </Sequence>
          );
        })
      ) : page.sourceIsVideo ? (
        <OffthreadVideo src={resolveAsset(page.source || "")} muted loop={page.loopVideo} {...common} />
      ) : (
        <Img src={resolveAsset(page.source || "")} {...common} />
      )}
      {/* exposure balance: lift crushed bottoms. The top darkening is
          merged with the upper-third text scrim below — one long gradient
          starting at the frame edge, so evenly-lit daytime skies never
          show a scrim "patch" with a visible starting edge */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 22%, transparent 42%)",
          mixBlendMode: "screen",
        }}
      />
      {/* top darkening + upper-third text scrim, one edge-anchored ramp */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.26) 0%, rgba(18,14,9,0.31) 14%, rgba(20,16,10,0.34) 24%, rgba(20,16,10,0.24) 40%, rgba(20,16,10,0.08) 55%, transparent 62%)",
        }}
      />
      {/* warm grade + vignette to match paper */}
      <AbsoluteFill
        style={{ background: "linear-gradient(rgba(176,50,43,0.10), rgba(176,50,43,0.02))", mixBlendMode: "overlay" }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 125% 105% at 50% 40%, transparent 58%, rgba(0,0,0,0.28) 100%)" }}
      />
      {/* editorial location/figure chips */}
      <div style={{ position: "absolute", top: 56, left: 64, display: "flex", gap: 12, ...caption }}>
        {page.figure && (
          <span
            style={{
              background: skin.accent,
              color: skin.paper,
              fontFamily: skin.bodyFont,
              fontSize: 22,
              letterSpacing: 3,
              padding: "10px 20px",
            }}
          >
            {page.figure}
          </span>
        )}
        <span
          style={{
            background: "rgba(0,0,0,0.4)",
            color: "#F5F1E8",
            fontFamily: skin.bodyFont,
            fontSize: 22,
            letterSpacing: 3,
            padding: "10px 20px",
          }}
        >
          {brand.column} · 现场
        </span>
      </div>
      {(page.location || page.caption) && (
        <>
          <div
            style={{
              position: "absolute",
              left: cover ? 64 : 32,
              right: cover ? 64 : 32,
              top: cover ? 176 : 176,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              ...caption,
            }}
          >
            {page.location && (
              <span
                style={{
                  alignSelf: "flex-start",
                  background: skin.footageTag,
                  color: skin.footageTagInk,
                  fontFamily: skin.bodyFont,
                  fontSize: 24,
                  letterSpacing: 2,
                  padding: "12px 22px",
                }}
              >
                {page.location}
              </span>
            )}
            {page.caption && (
              <span
                style={{
                  fontFamily: skin.headingFont,
                  fontSize: cover ? 30 : 26,
                  lineHeight: 1.5,
                  color: "#F7F2E6",
                  maxWidth: cover ? 1500 : 620,
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {page.caption}
              </span>
            )}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// 6. full-screen footage ------------------------------------------------------
const FootagePage: React.FC<{
  page: MagazinePage;
  skin: MagazineSkin;
  brand: BrandConfig;
}> = ({ page, skin, brand }) => (
  <AbsoluteFill>
    <FootageMedia page={page} skin={skin} brand={brand} />
  </AbsoluteFill>
);

// 7. media + text -------------------------------------------------------------
const MediaTextPage: React.FC<{
  page: MagazinePage;
  skin: MagazineSkin;
  brand: BrandConfig;
}> = ({ page, skin, brand }) => {
  const left = page.mediaSide !== "right";
  const media = (
    <div style={{ width: "46%", height: "100%", position: "relative" }}>
      <FootageMedia page={page} skin={skin} cover={false} brand={brand} />
    </div>
  );
  const text = useRise(8, 24);
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", gap: 64, padding: `0 ${PAD}px` }}>
      {left && media}
      <div style={{ flex: 1, ...text, display: "flex", flexDirection: "column", gap: 20 }}>
        {page.kicker && (
          <div style={{ color: skin.accent, fontFamily: skin.bodyFont, fontSize: 22, letterSpacing: 6 }}>
            {page.kicker}
          </div>
        )}
        <div
          style={{ fontFamily: skin.headingFont, fontSize: 50, fontWeight: 700, color: skin.ink, lineHeight: 1.25 }}
        >
          {page.title}
        </div>
        {page.dek && <Dek text={page.dek} skin={skin} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 4 }}>
          {page.paragraphs?.map((p, i) => (
            <div key={i} style={{ fontFamily: skin.bodyFont, fontSize: 27, lineHeight: 1.7, color: skin.ink }}>
              <RichText text={p} skin={skin} />
            </div>
          ))}
        </div>
        {page.note && (
          <div style={{ fontFamily: skin.bodyFont, fontSize: 20, color: skin.mutedInk, marginTop: 6 }}>
            {page.note}
          </div>
        )}
      </div>
      {!left && media}
    </div>
  );
};

// ---------------------------------------------------------------------------

export const MagazinePageView: React.FC<{
  brand: BrandConfig;
  skin: MagazineSkin;
  page: MagazinePage;
  index: number;
  total: number;
}> = ({ brand, skin, page, index, total }) => {
  // footage pages bleed edge to edge but keep editorial figure chrome
  if (page.type === "footage") {
    return (
      <AbsoluteFill>
        <FootagePage page={page} skin={skin} brand={brand} />
      </AbsoluteFill>
    );
  }
  const content = (() => {
    switch (page.type) {
      case "chapter":
        return <ChapterPage page={page} skin={skin} />;
      case "stat":
        return <StatPage page={page} skin={skin} />;
      case "body":
        return <BodyPage page={page} skin={skin} />;
      case "quote":
        return <QuotePage page={page} skin={skin} />;
      case "list":
        return <ListPage page={page} skin={skin} />;
      case "media-text":
        return <MediaTextPage page={page} skin={skin} brand={brand} />;
      default:
        return null;
    }
  })();
  return (
    <PageShell brand={brand} skin={skin} index={index} total={total}>
      {content}
    </PageShell>
  );
};
