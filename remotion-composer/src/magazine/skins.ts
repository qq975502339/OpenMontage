import { loadFont as loadSerif } from "@remotion/google-fonts/NotoSerifSC";
import { loadFont as loadSans } from "@remotion/google-fonts/NotoSansSC";
import type { MagazineSkin } from "./types";

// Chinese serif for headings (the magazine feel), sans for body/numbers.
const serif = loadSerif("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });
const sans = loadSans("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const HEADING_FONT = serif.fontFamily;
export const BODY_FONT = sans.fontFamily;

// ---------------------------------------------------------------------------
// Skins — switch the whole look without changing the content script.
// ---------------------------------------------------------------------------

export const SKINS: Record<string, MagazineSkin> = {
  // Default: cream paper + Chinese red, editorial finance magazine.
  "finance-paper": {
    id: "finance-paper",
    paper: "#F5F1E8",
    paperAlt: "#FBF8F1",
    paperDeep: "#EAE2D0",
    ink: "#211D18",
    mutedInk: "#6F675C",
    accent: "#B0322B",
    highlight: "#B0322B",
    highlightInk: "#F7F2E6",
    rule: "rgba(33,29,24,0.18)",
    headingFont: HEADING_FONT,
    bodyFont: BODY_FONT,
    footageTag: "rgba(33,29,24,0.82)",
    footageTagInk: "#F5F1E8",
  },
  // Alternate: cold dark tech cover.
  "midnight-tech": {
    id: "midnight-tech",
    paper: "#0E1420",
    paperAlt: "#161E2E",
    paperDeep: "#1D2740",
    ink: "#EAF0F8",
    mutedInk: "#8C97A8",
    accent: "#38BDF8",
    highlight: "#38BDF8",
    highlightInk: "#0E1420",
    rule: "rgba(234,240,248,0.16)",
    headingFont: HEADING_FONT,
    bodyFont: BODY_FONT,
    footageTag: "rgba(56,189,248,0.92)",
    footageTagInk: "#0E1420",
  },
  // Alternate: minimal black & white.
  "mono-brief": {
    id: "mono-brief",
    paper: "#FFFFFF",
    paperAlt: "#F4F4F4",
    paperDeep: "#ECECEC",
    ink: "#111111",
    mutedInk: "#6B6B6B",
    accent: "#111111",
    highlight: "#111111",
    highlightInk: "#FFFFFF",
    rule: "rgba(17,17,17,0.2)",
    headingFont: HEADING_FONT,
    bodyFont: BODY_FONT,
    footageTag: "rgba(17,17,17,0.9)",
    footageTagInk: "#FFFFFF",
  },
};

export const DEFAULT_SKIN = SKINS["finance-paper"];

export function resolveSkin(id?: string): MagazineSkin {
  return (id && SKINS[id]) || DEFAULT_SKIN;
}
