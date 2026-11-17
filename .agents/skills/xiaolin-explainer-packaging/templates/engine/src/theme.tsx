// Visual themes. Select in project.json:
//   "theme": "finance" | "press" | "terminal" | "banknote" | "casefile" | "chalk" | "pixelgame"  (styles7/, the active set)
//   legacy: "blueprint" | "desk" | "editorial" | "finance_classic" | "press_classic" | "terminal_classic"
//   or  "theme": {"name": "press", "plates": [...], "titlePlate": "plates/x.jpg", ...any token below}
// Each theme = photographic plates (public/plates) + paper/material textures (public/tex) + tokens that
// every layout reads (cards, panel, document page, app window, big number, title and end cards).
// Old names: "tech" -> "blueprint", "plain" -> "editorial".
import {staticFile} from 'remotion';
import D from './data/shots.json';
import {STYLE7, STYLE7_BASE} from './styles7';

// texture-tinted surface: a light paper scan multiplied over a colour = coloured paper with real fibres
export const tx = (c: string, t = 'tex/fiber.jpg', size = 'cover'): any => ({
  backgroundColor: c, backgroundImage: `url(${staticFile(t)})`, backgroundSize: size, backgroundPosition: 'center', backgroundBlendMode: 'multiply',
});
// the same as a CSS background shorthand, for GText fills (use with blend='multiply')
export const txs = (c: string, t = 'tex/fiber.jpg') => `url(${staticFile(t)}) center/cover, ${c}`;
export const EN = (D as any).en_labels === true; // English sub-labels are off unless a project asks for them

const SANS = "'NSC',sans-serif", SERIF = "'NSERIF','Songti SC',serif", YS = "'YS','NSC',sans-serif";
const NUM = "'BB','DIN','NSC',sans-serif", DIN = "'DIN','BB','NSC',sans-serif", PX = "'PX','NSC',monospace", HAND = "'MSZ','NSC',sans-serif";
const halftone = (c1: string, c2: string, dot = 'rgba(70,8,4,.42)', g = 8) => `radial-gradient(circle, ${dot} 0 ${(g * 0.2).toFixed(1)}px, transparent ${(g * 0.26).toFixed(1)}px) 0 0/${g}px ${g}px, linear-gradient(180deg,${c1},${c2})`;
const hatch = (c1: string, c2: string, w = 7) => `repeating-linear-gradient(135deg, ${c1} 0 ${w}px, ${c2} ${w}px ${w * 2}px)`;

const PRESETS: Record<string, any> = {
  // 剪纸印刷: charcoal art paper, cut coloured paper with real thickness, pink paper banknotes, chalk doodles
  finance: {
    plates: ['plates/fin_dark_a.jpg', 'plates/fin_dark_b.jpg'], titlePlate: 'plates/fin_title.jpg', endPlate: 'plates/fin_end.jpg', paperPlate: 'plates/fin_paper.jpg',
    lux: {light: 0.12, a: '255,214,160', b: '190,160,255', dust: 0.4, warm: true, vig: 0.36, grain: 0.05, bright: 0.97},
    light: false, ink: '#f4f1e8', ink2: 'rgba(244,241,232,.72)', acc: '#e6ee7c', accInk: '#3a4214', fg: 'finance', glyph: '¥',
    f: {title: SANS, card: YS, num: NUM, body: SANS, doc: SERIF, tok: YS},
    num: {grad: txs('linear-gradient(180deg,#fbfde0 0%,#edf38c 50%,#d5e05e 100%)'), blend: 'multiply', ext: true, extc: '#58621f', glow: false, font: NUM},
    card: {r: 8, base: tx('#2e2d33'), lit: tx('#e6ee7c'), dim: [128, 126, 136], on: [48, 56, 16], sdim: [150, 148, 158], son: [72, 82, 30]},
    paper: {bg: tx('#f6efe0'), r: 6, hdr: tx('#2e2d33'), hdrInk: '#efe2b0', kick: '#d8c88e', bar: txs('linear-gradient(180deg,#7d5a8a,#5b3a63)'), blend: 'multiply', val: '#3b2a42', lab: '#4a4650', grid: 'rgba(60,40,70,.12)', axis: 'rgba(60,40,70,.35)', sub: '#9a9187'},
    doc: {bg: tx('#f5eedf'), ink: '#221f1c', meta: '#8f877c', font: SERIF, hl: 'rgba(240,226,70,.85)', hlBlend: 'multiply', box: '#5b3a63', under: '#c8574d'},
    panel: {bg: tx('#5b3a63'), r: 10, border: 'none', strip: 'rgba(28,14,34,.42)', title: '#f1e6cf', tok: '#efe3ff', op: 'rgba(240,226,255,.7)', hiBg: tx('#e6ee7c'), hiInk: '#3a4214', lab: '#eadff5', foot: 'rgba(240,232,255,.85)', arrow: 'rgba(236,224,255,.7)'},
    ui: {mode: 'window', win: tx('#f7f1e4'), bar: tx('#efe6d2'), barInk: '#2e2a26', r: 14, dots: false, field: '#fffaf0', fBorder: '#e2d8c4', focus: '#c8574d', lab: '#7a7268', val: '#221f1c', res: '#fffaf0', resBorder: '#e2d8c4', rt: '#9a9187', num: '#5b3a63', total: '#5b3a63', lit: 'rgba(230,238,124,.7)', font: SANS, numFont: NUM},
    ent: {ring: 'linear-gradient(160deg,#fff1b8 0%,#d9a948 45%,#8a6322 100%)', bg: tx('#5b3a63'), name: 'gold', strip: tx('#f6efe0'), stripInk: '#2a2230'},
    pip: {ring: '#efe0a8', rect: 'rgba(246,239,224,.9)'},
  },
  // 报刊纸本: kraft paper, torn yellowed newsprint, halftone photos, masking tape, vermilion red + ink black
  press: {
    plates: ['plates/press_dark_a.jpg', 'plates/press_dark_b.jpg'], titlePlate: 'plates/press_title.jpg', endPlate: 'plates/press_end.jpg', paperPlate: 'plates/press_paper.jpg',
    lux: {light: 0.1, a: '255,226,180', b: '255,200,150', dust: 0, warm: true, vig: 0.3, grain: 0.06, bright: 1},
    light: true, ink: '#1b1a18', ink2: 'rgba(27,26,24,.7)', acc: '#d9483b', accInk: '#fff6ec', fg: 'none',
    f: {title: SERIF, card: SERIF, num: SERIF, body: SERIF, doc: SERIF, tok: SERIF},
    num: {grad: halftone('#e0533f', '#c23a2d'), ext: false, glow: false, font: SERIF, weight: 900, card: 'clip', ls: -4},
    card: {r: 0, torn: true, tape: true, base: tx('#e2d6bb', 'tex/newsprint.jpg'), lit: tx('#f2e9d2', 'tex/newsprint.jpg'), dim: [120, 110, 96], on: [24, 22, 20], sdim: [140, 130, 115], son: [90, 40, 32], litRing: '#d9483b', icon: 'print'},
    paper: {bg: tx('#efe6cf', 'tex/newsprint.jpg'), r: 2, hdr: '#1d1c1a', hdrInk: '#f2e9d2', kick: '#d9483b', bar: halftone('#df5442', '#c23a2d', 'rgba(70,8,4,.35)', 9), val: '#1b1a18', lab: '#2c2a26', grid: 'rgba(30,28,24,.12)', axis: 'rgba(30,28,24,.6)', sub: '#7e7566', font: SERIF},
    doc: {bg: tx('#efe4cc', 'tex/newsprint.jpg'), ink: '#1b1a18', meta: '#7e7566', font: SERIF, hl: 'rgba(217,72,59,.26)', hlBlend: 'multiply', box: '#d9483b', under: '#d9483b'},
    panel: {bg: tx('#efe4cc', 'tex/newsprint.jpg'), r: 2, border: 'none', torn: true, strip: 'transparent', rules: '#1b1a18', title: '#1b1a18', tok: '#1b1a18', op: '#5c5548', hiBg: 'transparent', hiRing: '#d9483b', hiInk: '#c23a2d', lab: '#2c2a26', foot: '#3a362f', arrow: '#5c5548', icon: 'print'},
    ui: {mode: 'ledger', win: tx('#efe6cf', 'tex/newsprint.jpg'), bar: '#1d1c1a', barInk: '#f2e9d2', r: 2, dots: false, field: 'rgba(255,250,236,.6)', fBorder: '#1b1a18', focus: '#d9483b', lab: '#5c5548', val: '#1b1a18', res: 'transparent', resBorder: '#1b1a18', rt: '#7e7566', num: '#1b1a18', total: '#c23a2d', lit: 'rgba(217,72,59,.18)', font: SERIF, numFont: SERIF},
    ent: {ring: '#1b1a18', bg: tx('#efe4cc', 'tex/newsprint.jpg'), nameInk: '#1b1a18', strip: '#1d1c1a', stripInk: '#f2e9d2'},
    pip: {ring: '#f2e9d2', rect: '#f2e9d2'},
  },
  // 工程蓝图: Prussian-blue cyanotype, white line drawings, grid, safety orange, pinned tracing paper
  blueprint: {
    plates: ['plates/bp_dark_a.jpg', 'plates/bp_dark_b.jpg'], titlePlate: 'plates/bp_title.jpg', endPlate: 'plates/bp_title.jpg', paperPlate: 'plates/bp_paper.jpg',
    lux: {light: 0.08, a: '160,200,255', b: '255,170,110', dust: 0, vig: 0.34, grain: 0.05, bright: 1},
    light: false, ink: '#f3f6fa', ink2: 'rgba(225,235,248,.7)', acc: '#ff7a1a', accInk: '#0e2a4f', fg: 'none',
    f: {title: SANS, card: SANS, num: DIN, body: SANS, doc: SANS, tok: SANS},
    num: {grad: hatch('#ff7a1a', '#f26a0c', 6), ext: false, glow: false, font: DIN, dims: true, ls: 2},
    card: {r: 2, pin: true, frame: true, base: {background: 'rgba(214,228,244,.16)', border: '2px solid rgba(235,242,250,.55)'}, lit: tx('#e9eef3'), dim: [205, 218, 236], on: [16, 52, 98], sdim: [180, 196, 218], son: [255, 122, 26], litRing: '#ff7a1a', icon: 'ink'},
    paper: {bg: tx('#f4f5f2'), r: 2, frame: '#123a6b', hdr: '#123a6b', hdrInk: '#f3f6fa', kick: '#ff7a1a', bar: hatch('#123a6b', '#24508a', 6), val: '#123a6b', lab: '#123a6b', grid: 'rgba(18,58,107,.14)', axis: 'rgba(18,58,107,.7)', sub: '#5a7398'},
    doc: {bg: {...tx('#f4f5f2'), backgroundImage: `linear-gradient(rgba(60,120,200,.09) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(60,120,200,.09) 1.5px, transparent 1.5px), url(${staticFile('tex/fiber.jpg')})`, backgroundSize: '60px 60px, 60px 60px, cover'}, ink: '#10233f', meta: '#5a7398', font: SANS, frame: '#123a6b', hl: 'rgba(255,122,26,.36)', hlBlend: 'multiply', box: '#ff7a1a', under: '#ff7a1a'},
    panel: {bg: 'rgba(18,58,107,.55)', r: 0, border: '2px solid rgba(240,246,252,.85)', ticks: true, strip: 'transparent', cell: '2px solid rgba(240,246,252,.6)', title: '#f3f6fa', tok: '#f3f6fa', op: 'rgba(230,240,250,.8)', hiBg: '#ff7a1a', hiInk: '#0e2a4f', lab: '#e3ecf7', foot: 'rgba(235,242,250,.85)', arrow: 'rgba(235,242,250,.8)', icon: 'ink'},
    ui: {mode: 'window', win: tx('#f4f5f2'), bar: '#123a6b', barInk: '#f3f6fa', r: 2, dots: false, field: '#ffffff', fBorder: '#123a6b', focus: '#ff7a1a', lab: '#5a7398', val: '#10233f', res: '#ffffff', resBorder: '#123a6b', rt: '#5a7398', num: '#123a6b', total: '#ff7a1a', lit: 'rgba(255,122,26,.16)', font: SANS, numFont: DIN},
    ent: {ring: 'rgba(240,246,252,.9)', bg: tx('#e9eef3'), nameInk: '#123a6b', strip: '#ff7a1a', stripInk: '#0e2a4f'},
    pip: {ring: '#f3f6fa', rect: '#f3f6fa'},
  },
  // 复古终端: beige CRT, phosphor amber + green, scanlines, pixel type, dot-matrix paper, 90s windows
  terminal: {
    plates: ['plates/term_crt.jpg'], titlePlate: 'plates/term_crt.jpg', endPlate: 'plates/term_crt.jpg', paperPlate: 'plates/term_gui.jpg',
    bezel: {'plates/term_crt.jpg': 'plates/term_crt_bezel.png', 'plates/term_gui.jpg': 'plates/term_gui_bezel.png'},
    lux: {light: 0, dust: 0, vig: 0.3, grain: 0.07, bright: 1, still: true},
    crt: true, light: false, ink: '#ffb000', ink2: '#33ff88', acc: '#ffb000', accInk: '#140c00', fg: 'none',
    f: {title: PX, card: PX, num: PX, body: PX, doc: PX, tok: PX},
    num: {color: '#ffb000', ext: false, glow: false, font: PX, phosphor: '255,176,0', ls: 0, kc: '#33ff88', cc: '#ffb000'},
    card: {r: 0, base: {background: 'rgba(0,10,4,.55)', border: '6px double rgba(51,255,136,.75)'}, lit: {background: '#ffb000'}, dim: [51, 255, 136], on: [20, 12, 0], sdim: [51, 220, 120], son: [60, 36, 0], glow: '255,176,0', icon: 'phosphor'},
    paper: {bg: 'rgba(0,10,4,.82)', r: 0, border: '4px solid rgba(51,255,136,.8)', hdr: 'transparent', hdrInk: '#ffb000', kick: '#33ff88', bar: 'repeating-linear-gradient(180deg,#ffb000 0 5px,#cc8a00 5px 7px)', val: '#ffb000', lab: '#33ff88', grid: 'rgba(51,255,136,.18)', axis: 'rgba(51,255,136,.7)', sub: 'rgba(51,255,136,.6)', font: PX, phosphor: true},
    doc: {bg: {background: '#f3f1e6'}, ink: '#2b2b2b', meta: '#6b6b6b', font: PX, tractor: true, hl: 'rgba(255,226,60,.8)', hlBlend: 'multiply', box: '#2b2b2b', under: '#2b2b2b'},
    panel: {bg: 'rgba(0,10,4,.6)', r: 0, border: '6px double rgba(51,255,136,.75)', strip: 'transparent', title: '#33ff88', tok: '#ffb000', op: '#33ff88', hiBg: '#ffb000', hiInk: '#140c00', lab: '#33ff88', foot: '#33ff88', arrow: '#33ff88', phosphor: true, icon: 'phosphor'},
    ui: {mode: 'win95', font: PX, numFont: PX},
    ent: {ring: 'rgba(51,255,136,.8)', bg: {background: 'rgba(0,10,4,.7)'}, nameInk: '#ffb000', strip: '#ffb000', stripInk: '#140c00'},
    pip: {ring: '#33ff88', rect: '#33ff88'},
  },
  // 桌面实物: walnut desk top-down, index cards, sticky notes, A4 printouts, a phone, marker handwriting, tomato red
  desk: {
    plates: ['plates/desk_dark_a.jpg', 'plates/desk_dark_b.jpg'], titlePlate: 'plates/desk_title.jpg', endPlate: 'plates/desk_end.jpg', paperPlate: 'plates/desk_paper.jpg',
    lux: {light: 0.1, a: '255,230,190', b: '255,240,210', dust: 0.25, warm: true, vig: 0.3, grain: 0.04, bright: 1},
    light: false, ink: '#fbf7ee', ink2: 'rgba(251,247,238,.8)', acc: '#e2543f', accInk: '#fffaf2', fg: 'none',
    f: {title: HAND, card: HAND, num: HAND, body: SANS, doc: SERIF, tok: HAND},
    num: {color: '#1f1f22', ext: false, glow: false, font: HAND, card: 'index', ls: 0},
    card: {r: 4, ruled: true, tilt: 2.2, base: tx('#f5f0e4'), lit: tx('#e2543f'), dim: [40, 40, 46], on: [255, 250, 242], sdim: [96, 96, 104], son: [255, 236, 226], icon: 'sticker'},
    paper: {bg: tx('#fbfaf6'), r: 3, hdr: 'transparent', hdrInk: '#1f1f22', kick: '#e2543f', bar: txs('linear-gradient(180deg,#e8644d,#d04a36)'), blend: 'multiply', val: '#1f1f22', lab: '#3a3a40', grid: 'rgba(0,0,0,.08)', axis: 'rgba(0,0,0,.45)', sub: '#8a8a90', titleFont: HAND},
    doc: {bg: tx('#fbfaf6'), ink: '#1f1f22', meta: '#8a8a90', font: SERIF, hl: 'rgba(255,225,77,.9)', hlBlend: 'multiply', box: '#e2543f', under: '#e2543f'},
    panel: {bg: tx('#fbfaf6'), r: 3, border: 'none', strip: 'transparent', sticky: tx('#f6e27a'), title: '#1f1f22', tok: '#1f1f22', op: '#1f1f22', hiBg: tx('#e2543f'), hiInk: '#fffaf2', lab: '#3a3a40', foot: '#3a3a40', arrow: '#3a3a40'},
    ui: {mode: 'phone', font: SANS, numFont: SANS},
    ent: {ring: '#fbfaf6', bg: tx('#f5f0e4'), nameInk: '#1f1f22', strip: tx('#e2543f'), stripInk: '#fffaf2'},
    pip: {ring: '#fbfaf6', rect: '#fbfaf6'},
  },
  // 现代杂志: off-white uncoated paper, Swiss grid, Klein blue blocks, huge black type, generous white space
  editorial: {
    plates: ['plates/ed_paper.jpg'], titlePlate: 'plates/ed_title.jpg', endPlate: 'plates/ed_title.jpg', paperPlate: 'plates/ed_paper.jpg',
    lux: {light: 0, dust: 0, vig: 0.1, grain: 0.04, bright: 1},
    light: true, ink: '#111114', ink2: 'rgba(17,17,20,.62)', acc: '#1f3fd1', accInk: '#ffffff', fg: 'none',
    f: {title: SANS, card: SANS, num: SANS, body: SANS, doc: SANS, tok: SANS},
    num: {grad: txs('#1f3fd1'), blend: 'multiply', ext: false, glow: false, font: SANS, weight: 900, ls: -18, scale: 1.0, kc: '#111114', cc: '#111114'},
    card: {r: 0, base: {...tx('#fbfaf7'), boxShadow: 'inset 0 0 0 2px rgba(17,17,20,.08)'}, lit: tx('#1f3fd1'), dim: [24, 24, 28], on: [255, 255, 255], sdim: [90, 90, 96], son: [220, 228, 255], flat: true, icon: 'flat'},
    paper: {bg: tx('#fbfaf7'), r: 0, hdr: 'transparent', hdrInk: '#111114', kick: '#1f3fd1', bar: '#1f3fd1', val: '#111114', lab: '#111114', grid: 'rgba(17,17,20,.08)', axis: '#111114', sub: '#8a8a90', flat: true},
    doc: {bg: tx('#f6f3ec'), ink: '#141418', meta: '#8a8a90', font: SANS, hl: '#1f3fd1', hlInk: '#ffffff', box: '#1f3fd1', under: '#1f3fd1'},
    panel: {bg: 'transparent', r: 0, border: 'none', shadow: 'none', strip: 'transparent', rules: '#111114', title: '#111114', tok: '#111114', op: 'rgba(17,17,20,.45)', hiBg: '#1f3fd1', hiInk: '#ffffff', lab: '#111114', foot: '#3a3a40', arrow: 'rgba(17,17,20,.5)', icon: 'flat'},
    ui: {mode: 'window', win: '#ffffff', bar: '#ffffff', barInk: '#111114', r: 0, dots: false, field: '#f6f5f2', fBorder: '#e2e1dc', focus: '#1f3fd1', lab: '#6b6b74', val: '#111114', res: '#f6f5f2', resBorder: '#e2e1dc', rt: '#8a8a90', num: '#1f3fd1', total: '#1f3fd1', lit: 'rgba(31,63,209,.1)', font: SANS, numFont: SANS, shadow: '0 30px 80px rgba(20,20,40,.18)'},
    ent: {ring: '#111114', bg: tx('#fbfaf7'), nameInk: '#111114', strip: '#1f3fd1', stripInk: '#ffffff'},
    pip: {ring: '#1f3fd1', rect: '#111114'},
  },
};
const ALIAS: any = {tech: 'blueprint', 'tech-flat': 'blueprint', plain: 'editorial'};
// the plate-photo versions of finance / press / terminal from v1.2 stay available as *_classic
const CLASSIC: any = {finance_classic: 'finance', press_classic: 'press', terminal_classic: 'terminal'};
// Topic-neutral plates per style: the style's own world (cut-paper layers, newspaper collage, the CRT, security paper,
// the cork board, the blackboard, the pixel level). No props, symbols or data; episodes add their own on top.
const S7P = (k: string) => `styles7/${k}.jpg`;
const PLATES7: any = {
  finance: {plates: [S7P('fin7_dark_a'), S7P('fin7_dark_b')], titlePlate: S7P('fin7_title'), endPlate: S7P('fin7_title'), paperPlate: 'plates/fin_paper.jpg'},
  press: {plates: [S7P('press7_dark_a')], titlePlate: S7P('press7_title'), endPlate: S7P('press7_title'), paperPlate: 'plates/press_paper.jpg'},
  terminal: {plates: ['plates/term_crt.jpg'], titlePlate: 'plates/term_crt.jpg', endPlate: 'plates/term_crt.jpg', paperPlate: S7P('term7_paper'),
    bezel: {'plates/term_crt.jpg': 'plates/term_crt_bezel.png'}},
  banknote: {plates: [S7P('bank7_dark_a'), S7P('bank7_dark_b')], titlePlate: S7P('bank7_title'), endPlate: S7P('bank7_title'), paperPlate: S7P('bank7_paper')},
  casefile: {plates: [S7P('case7_dark_a'), S7P('case7_dark_b')], titlePlate: S7P('case7_title'), endPlate: S7P('case7_title'), paperPlate: S7P('case7_paper')},
  chalk: {plates: [S7P('chalk7_dark_a'), S7P('chalk7_dark_b')], titlePlate: S7P('chalk7_title'), endPlate: S7P('chalk7_title'), paperPlate: S7P('chalk7_paper')},
  pixelgame: {plates: [S7P('pix7_dark_a'), S7P('pix7_dark_b')], titlePlate: S7P('pix7_title'), endPlate: S7P('pix7_title'), paperPlate: S7P('pix7_paper')},
};
const RAW: any = (D as any).theme ?? 'finance';
const NAME0: string = typeof RAW === 'string' ? RAW : RAW.name ?? 'finance';
const NAME = STYLE7[NAME0] || PRESETS[NAME0] || CLASSIC[NAME0] ? NAME0 : ALIAS[NAME0] ?? 'finance';
const S7 = STYLE7[NAME];
const KEY = CLASSIC[NAME] ?? NAME;
const OPTS: any = typeof RAW === 'string' ? {} : RAW;
const BASE = S7 ? S7.preset(PRESETS[STYLE7_BASE[NAME]], tx) : PRESETS[KEY];
// pal: accent colours used by the tech icon tiles (bg_tech.tsx); a theme or project can override single keys
const PAL = {teal: '#2f7f7a', steel: '#3b5b8c', coral: '#c8574d', lime: '#d9e47e', slate: '#252c3b', cream: '#f2e6b8', gray: '#9aa4b4'};
// prop_look: the drawing style of this episode's props (references/treatment.md section 4); project.json "prop_look" overrides the theme default
const LOOK0: Record<string, string> = {finance: 'sticker25d', press: 'engraving', blueprint: 'lineart_white', terminal: 'pixel16', desk: 'product_photo', editorial: 'flat_editorial',
  banknote: 'engraving', casefile: 'product_photo', chalk: 'chalk', pixelgame: 'pixel16'};
const P7 = S7 && (D as any).style_plates !== false ? PLATES7[NAME] : null;
export const TH: any = {...BASE, ...(P7 ?? {}), ...OPTS, name: KEY, title: KEY, end: KEY, style: NAME, s7: !!S7, s7bd: !!S7 && !P7,
  propLook: (D as any).prop_look ?? OPTS.propLook ?? BASE.propLook ?? LOOK0[KEY] ?? 'sticker25d',
  lux: {...BASE.lux, ...(OPTS.lux ?? {})}, pal: {...PAL, ...(BASE.pal ?? {}), ...(OPTS.pal ?? {})}};
