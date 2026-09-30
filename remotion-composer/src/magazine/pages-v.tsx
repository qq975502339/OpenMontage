import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import type { BrandConfig, MagazinePage, MagazineSkin } from "./types";
import { Dek, PageShell, RichText, TagRow, useRise } from "./primitives";

const PAD = 64;

// 竖版 9:16 页面（1080×1920），与横版共用数据 schema 与皮肤 ----------------

// stat — 大数字居中，关键数字行纵向堆叠 ------------------------------------
const VStatPage: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => {
  const frame = useCurrentFrame();
  // 数字增长固定开场 1.5 秒内完成
  const grow = interpolate(frame, [8, 53], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const value = page.statDisplay ?? String(page.statValue ?? 0);
  const shown =
    page.statDisplay !== undefined || page.statValue === undefined
      ? value
      : Math.round((page.statValue as number) * grow).toLocaleString("zh-CN");
  const head = useRise(0);
  const rows = useRise(16, 24);
  return (
    <div
      style={{
        padding: `60px ${PAD}px 40px`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 36,
      }}
    >
      <div
        style={{
          color: skin.accent,
          fontFamily: skin.bodyFont,
          fontSize: 26,
          letterSpacing: 6,
        }}
      >
        {page.kicker}
      </div>
      <div
        style={{
          ...head,
          background: skin.paperDeep,
          borderLeft: `8px solid ${skin.accent}`,
          padding: "56px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: skin.headingFont,
              fontSize: 168,
              fontWeight: 700,
              color: skin.accent,
              lineHeight: 1,
            }}
          >
            {shown}
          </span>
          <span style={{ fontFamily: skin.bodyFont, fontSize: 46, color: skin.ink }}>
            {page.statUnit}
          </span>
        </div>
        <div style={{ fontFamily: skin.headingFont, fontSize: 40, color: skin.ink, lineHeight: 1.4 }}>
          {page.title}
        </div>
      </div>
      {page.compare && (
        <div style={{ ...rows, display: "flex", flexDirection: "column", gap: 0 }}>
          {page.compare.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 18,
                padding: "22px 4px",
                borderBottom: `1px solid ${skin.rule}`,
              }}
            >
              <span
                style={{
                  fontFamily: skin.headingFont,
                  fontSize: 40,
                  fontWeight: 700,
                  color: skin.accent,
                  minWidth: 240,
                  lineHeight: 1.2,
                }}
              >
                {c.value}
              </span>
              <span
                style={{
                  fontFamily: skin.bodyFont,
                  fontSize: 27,
                  color: skin.mutedInk,
                  lineHeight: 1.45,
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}
      {page.note && (
        <div
          style={{
            marginTop: "auto",
            fontFamily: skin.bodyFont,
            fontSize: 22,
            color: skin.mutedInk,
            lineHeight: 1.5,
          }}
        >
          {page.note}
        </div>
      )}
    </div>
  );
};

// body — 竖排长文 -----------------------------------------------------------
const VBodyPage: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => (
  <div
    style={{
      padding: `64px ${PAD}px 40px`,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 34,
    }}
  >
    {page.kicker && (
      <div
        style={{
          color: skin.accent,
          fontFamily: skin.bodyFont,
          fontSize: 26,
          letterSpacing: 6,
        }}
      >
        {page.kicker}
      </div>
    )}
    <div
      style={{
        fontFamily: skin.headingFont,
        fontSize: 64,
        fontWeight: 700,
        color: skin.ink,
        lineHeight: 1.25,
      }}
    >
      {page.title}
    </div>
    {page.dek && <Dek text={page.dek} skin={skin} />}
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      {page.paragraphs?.map((p, i) => (
        <div
          key={i}
          style={{
            ...useRise(8 + i * 8, 20),
            fontFamily: skin.bodyFont,
            fontSize: i === 0 ? 38 : 35,
            lineHeight: 1.8,
            color: skin.ink,
            fontWeight: i === 0 ? 500 : 400,
          }}
        >
          <RichText text={p} skin={skin} />
        </div>
      ))}
    </div>
    {page.note && (
      <div
        style={{
          marginTop: "auto",
          background: skin.paperDeep,
          borderLeft: `4px solid ${skin.accent}`,
          padding: "18px 24px",
          fontFamily: skin.bodyFont,
          fontSize: 22,
          color: skin.mutedInk,
          lineHeight: 1.5,
        }}
      >
        {page.note}
      </div>
    )}
  </div>
);

// quote — 红底金句 ----------------------------------------------------------
const VQuotePage: React.FC<{ page: MagazinePage; skin: MagazineSkin }> = ({
  page,
  skin,
}) => {
  const r = useRise(4, 30);
  return (
    <AbsoluteFill
      style={{ padding: `0 ${PAD}px`, display: "flex", alignItems: "center" }}
    >
      <div
        style={{
          ...r,
          width: "100%",
          background: skin.highlight,
          color: skin.highlightInk,
          padding: "80px 56px",
        }}
      >
        <div
          style={{
            fontFamily: skin.bodyFont,
            fontSize: 24,
            letterSpacing: 8,
            opacity: 0.8,
            marginBottom: 36,
          }}
        >
          {page.kicker ?? "金句"}
        </div>
        <span
          style={{
            fontFamily: skin.headingFont,
            fontSize: 150,
            lineHeight: 0.7,
            opacity: 0.85,
          }}
        >
          “
        </span>
        <div
          style={{
            fontFamily: skin.headingFont,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.55,
            marginTop: -40,
          }}
        >
          {page.quote}
        </div>
        {page.attribution && (
          <div
            style={{
              marginTop: 40,
              textAlign: "right",
              fontFamily: skin.bodyFont,
              fontSize: 24,
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

// media-text — 竖排：上素材、下文字（FootageMedia 从 pages.tsx 复用） --------
export const VMediaTextPage: React.FC<{
  page: MagazinePage;
  skin: MagazineSkin;
  brand: BrandConfig;
  FootageMedia: React.FC<{
    page: MagazinePage;
    skin: MagazineSkin;
    cover?: boolean;
    brand: BrandConfig;
  }>;
}> = ({ page, skin, brand, FootageMedia }) => {
  const text = useRise(10, 24);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "46%", position: "relative", flexShrink: 0 }}>
        <FootageMedia page={page} skin={skin} cover={false} brand={brand} />
      </div>
      <div
        style={{
          ...text,
          flex: 1,
          padding: `44px ${PAD}px 36px`,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {page.kicker && (
          <div
            style={{
              color: skin.accent,
              fontFamily: skin.bodyFont,
              fontSize: 24,
              letterSpacing: 6,
            }}
          >
            {page.kicker}
          </div>
        )}
        <div
          style={{
            fontFamily: skin.headingFont,
            fontSize: 48,
            fontWeight: 700,
            color: skin.ink,
            lineHeight: 1.3,
          }}
        >
          {page.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {page.paragraphs?.map((p, i) => (
            <div
              key={i}
              style={{
                fontFamily: skin.bodyFont,
                fontSize: 30,
                lineHeight: 1.7,
                color: skin.ink,
              }}
            >
              <RichText text={p} skin={skin} />
            </div>
          ))}
        </div>
        {page.tags && <TagRow tags={page.tags} skin={skin} />}
        {page.note && (
          <div
            style={{
              marginTop: "auto",
              fontFamily: skin.bodyFont,
              fontSize: 21,
              color: skin.mutedInk,
              lineHeight: 1.5,
            }}
          >
            {page.note}
          </div>
        )}
      </div>
    </div>
  );
};

export const VMagazinePageView: React.FC<{
  brand: BrandConfig;
  skin: MagazineSkin;
  page: MagazinePage;
  index: number;
  total: number;
  FootageMedia: React.FC<{
    page: MagazinePage;
    skin: MagazineSkin;
    cover?: boolean;
    brand: BrandConfig;
  }>;
}> = ({ brand, skin, page, index, total, FootageMedia }) => {
  if (page.type === "footage") {
    return (
      <AbsoluteFill>
        <FootageMedia page={page} skin={skin} cover brand={brand} />
      </AbsoluteFill>
    );
  }
  const content = (() => {
    switch (page.type) {
      case "stat":
        return <VStatPage page={page} skin={skin} />;
      case "body":
        return <VBodyPage page={page} skin={skin} />;
      case "quote":
        return <VQuotePage page={page} skin={skin} />;
      case "media-text":
        return (
          <VMediaTextPage
            page={page}
            skin={skin}
            brand={brand}
            FootageMedia={FootageMedia}
          />
        );
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
