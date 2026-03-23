/**
 * colors.ts — Complete color token system for Scripture Deep Dive.
 *
 * All values extracted from the PWA CSS variables (css/base.css, css/styles.css)
 * and data files (scholar-data.js, timeline-data.js).
 *
 * Categories:
 *   base    — 11 UI foundation colors
 *   panels  — 17 panel accent sets (bg, border, accent)
 *   scholars — 42 scholar identity colors
 *   eras    — 9 era timeline colors
 */

// ── Base UI Colors ──────────────────────────────────────────────────

export const base = {
  bg: '#0c0a07',
  bgElevated: '#181410',
  bgSurface: '#1f1b14',
  bg3: '#1a1508',
  text: '#f0e8d8',
  textDim: '#b8a888',
  textMuted: '#7a6a50',
  gold: '#c9a84c',
  goldDim: '#8b6914',
  goldBright: '#e8c870',
  border: '#3a2e18',
  borderLight: '#2a2010',
} as const;

// ── Panel Accent Colors ─────────────────────────────────────────────

export interface PanelColors {
  bg: string;
  border: string;
  accent: string;
}

export const panels: Record<string, PanelColors> = {
  heb:     { bg: '#1a0d14', border: '#7a3050', accent: '#e890b8' },
  hist:    { bg: '#0a1220', border: '#2a5080', accent: '#70b8e8' },
  ctx:     { bg: '#0a180e', border: '#2a6040', accent: '#70d098' },
  cross:   { bg: '#140f00', border: '#6a4a00', accent: '#d4b060' },
  poi:     { bg: '#060e06', border: '#1a6028', accent: '#30a848' },
  tl:      { bg: '#0a0f18', border: '#0a0f18', accent: '#70b8e8' },
  ppl:     { bg: '#180800', border: '#8a3010', accent: '#e86040' },
  trans:   { bg: '#001a18', border: '#186058', accent: '#58c8c0' },
  src:     { bg: '#140814', border: '#603058', accent: '#a05890' },
  rec:     { bg: '#180610', border: '#882040', accent: '#e04080' },
  lit:     { bg: '#101400', border: '#485010', accent: '#b8c858' },
  hebText: { bg: '#0a0800', border: '#4a3800', accent: '#d4aa40' },
  thread:  { bg: '#0a0a1a', border: '#303070', accent: '#9090e0' },
  com:     { bg: '#110408', border: '#6a1828', accent: '#c04050' },
  tx:      { bg: '#0a0a14', border: '#303060', accent: '#8888d0' },
  debate:  { bg: '#140a0a', border: '#603030', accent: '#d08080' },
  themes:  { bg: '#0a0a07', border: '#3a3010', accent: '#c9a84c' },
} as const;

// ── Scholar Colors ──────────────────────────────────────────────────

export const scholars: Record<string, string> = {
  alter: '#d4a853',
  anderson: '#c8d0a0',
  ashley: '#f0c080',
  bergen: '#d8a080',
  berlin: '#c08060',
  block: '#e0a070',
  calvin: '#7ba7cc',
  catena: '#b888d8',
  childs: '#6080b0',
  clines: '#b8a0d0',
  collins: '#7a9ab0',
  craigie: '#d8b8f0',
  fox: '#a0b8a0',
  garrett: '#c89898',
  goldingay: '#b0a890',
  habel: '#d0b888',
  hess: '#60d0c0',
  howard: '#90b0e0',
  hubbard: '#a8c870',
  japhet: '#a8c8b8',
  jobes: '#c8a090',
  keener: '#a8c8f8',
  kidner: '#a8c890',
  levenson: '#d0c080',
  longman: '#c0a870',
  macarthur: '#e05a6a',
  marcus: '#70d8d8',
  milgrom: '#78d8a8',
  netbible: '#d8e8d0',
  oconnor: '#c08060',
  oswalt: '#5a9a6a',
  provan: '#d8c0a0',
  rhoads: '#e8c060',
  robertson: '#c8d870',
  sarna: '#4ec9b0',
  selman: '#c0b890',
  tigay: '#e8d090',
  tsumura: '#88b8d8',
  vangemeren: '#88a8c8',
  waltke: '#e8a0b8',
  webb: '#90c890',
  williamson: '#90a8c8',
  wiseman: '#b0d8e8',
} as const;

// ── Era Colors ──────────────────────────────────────────────────────

export const eras: Record<string, string> = {
  primeval: '#523d0b',
  patriarch: '#4b395f',
  exodus: '#26472e',
  judges: '#503d18',
  kingdom: '#304153',
  prophets: '#653030',
  exile: '#29444d',
  intertestamental: '#4a3e27',
  nt: '#46370f',
} as const;

export const eraNames: Record<string, string> = {
  primeval: 'Primeval History',
  patriarch: 'Patriarchal Period',
  exodus: 'Egypt & Exodus',
  judges: 'Conquest & Judges',
  kingdom: 'United Kingdom',
  prophets: 'Divided Kingdom & Prophets',
  exile: 'Exile & Return',
  intertestamental: 'Intertestamental',
  nt: 'New Testament',
} as const;
