// ---------------------------------------------------------------------------
// Generic data-driven magazine template — content/schema types
// A script is a list of "pages". Each page maps to one layout block. The same
// script can be re-skinned (see skins.ts) without touching the content.
// ---------------------------------------------------------------------------

export type PageType =
  | "chapter" // chapter cover: number + serif title + kicker
  | "stat" // one big number card (counts up) + unit + note
  | "body" // article reading page: title + paragraphs, keyword highlight
  | "quote" // full-width highlighted pull-quote bar
  | "list" // ordered/unordered list (3/5 points) or two-column compare
  | "footage" // full-screen live footage with a location tag + slow push
  | "media-text"; // footage/image on one side, text on the other

export interface BrandConfig {
  column: string; // masthead / column name, e.g. 资本市场观察
  issue: string; // issue / date label, e.g. 2026年9月 · 城市特刊
  title: string; // episode title
}

export interface MagazineSkin {
  id: string;
  paper: string; // page background
  paperAlt: string; // alternate surface (cards/insets)
  paperDeep: string; // deeper inset surface (number cards)
  ink: string; // primary text
  mutedInk: string; // secondary text
  accent: string; // red seal / rules
  highlight: string; // pull-quote bar fill
  highlightInk: string; // text on the highlight bar
  rule: string; // hairline color
  headingFont: string;
  bodyFont: string;
  // tone of live-footage treatment label strip
  footageTag: string;
  footageTagInk: string;
}

export interface SubtitleCue {
  start: number; // seconds, relative to page start
  end: number;
  text: string;
}

export interface MagazinePage {
  id: string;
  type: PageType;
  durationSeconds: number;
  narration?: string; // optional per-page voiceover audio path (public/ or url)
  subtitles?: SubtitleCue[]; // optional per-page burned-in subtitles

  // shared text fields
  kicker?: string; // small eyebrow label above a heading
  dek?: string; // standfirst / sub-headline under the title
  title?: string;
  paragraphs?: string[]; // body text; wrap **word** to highlight in accent
  note?: string; // small caption under a stat / image
  tags?: string[]; // small editorial tag chips under a heading

  // chapter
  chapterNumber?: string; // e.g. 第一章 / 01

  // stat
  statValue?: number;
  statDisplay?: string; // overrides the numeric formatting (e.g. 6.56万亿)
  statUnit?: string;
  // small supporting comparison rows under the headline number
  compare?: { value: string; label: string }[];

  // quote
  quote?: string;
  attribution?: string; // small source / speaker line under the quote

  // list
  ordered?: boolean;
  items?: string[];
  // optional one-line annotation under each list item
  itemNotes?: string[];

  // media
  source?: string; // image or video path/url
  sourceIsVideo?: boolean;
  loopVideo?: boolean; // loop the clip when page duration exceeds its length
  location?: string; // footage tag, e.g. 合肥 · 新型显示产业基地
  caption?: string; // editorial figure caption / narration synced with footage
  figure?: string; // figure label, e.g. 图 01 / FIG.
  mediaSide?: "left" | "right";
  // sequential hard-cut clips: when present, these play back-to-back (no loop,
  // no freeze) to cover the whole page; the final clip is trimmed at page end
  clips?: { source: string; durationSeconds: number }[];
}

export interface MagazineProps {
  [key: string]: unknown;
  brand: BrandConfig;
  skin?: string; // skin id
  pages: MagazinePage[];
  audio?: {
    narration?: string;
    music?: string;
    musicVolume?: number;
  };
}
