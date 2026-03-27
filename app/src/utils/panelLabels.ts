/**
 * utils/panelLabels.ts — Map panel_type to human-readable display labels.
 *
 * Used by ButtonRow and PanelContainer for label rendering.
 * Scholar panels (mac, calvin, etc.) fall back to the scholars table.
 */

import { scholars as scholarColors } from '../theme/colors';

// ── Static label map ────────────────────────────────────────────────

const PANEL_LABELS: Record<string, string> = {
  // Section-level
  heb: 'Hebrew',
  hist: 'History',
  ctx: 'Context',
  cross: 'Cross-Ref',
  poi: 'Places',
  tl: 'Timeline',
  places: 'Places',

  // Chapter-level
  lit: 'Literary Structure',
  hebtext: 'Hebrew-Rooted Reading',
  themes: 'Theological Themes',
  ppl: 'People',
  trans: 'Translations',
  src: 'Ancient Sources',
  rec: 'Reception History',
  thread: 'Intertextual Threading',
  tx: 'Textual Notes',
  textual: 'Textual Notes',
  debate: 'Scholarly Debates',
};

// ── Scholar label overrides ─────────────────────────────────────────

const SCHOLAR_LABELS: Record<string, string> = {
  mac: 'MacArthur',
  macarthur: 'MacArthur',
  calvin: 'Calvin',
  net: 'NET Notes',
  netbible: 'NET Notes',
  cat: 'Catena',
  mar: 'Marcus',
  rho: 'Rhoads',
  sarna: 'Sarna',
  alter: 'Alter',
  milgrom: 'Milgrom',
  ashley: 'Ashley',
  hubbard: 'Hubbard',
  waltke: 'Waltke',
  kidner: 'Kidner',
  keener: 'Keener',
  robertson: 'Robertson',
  marcus: 'Marcus',
  catena: 'Catena',
  oswalt: 'Oswalt',
  childs: 'Childs',
  collins: 'Collins',
  longman: 'Longman',
  goldingay: 'Goldingay',
  habel: 'Habel',
  clines: 'Clines',
  fox: 'Fox',
  garrett: 'Garrett',
  tigay: 'Tigay',
  craigie: 'Craigie',
  block: 'Block',
  webb: 'Webb',
  provan: 'Provan',
  hess: 'Hess',
  howard: 'Howard',
  japhet: 'Japhet',
  selman: 'Selman',
  wiseman: 'Wiseman',
  williamson: 'Williamson',
  tsumura: 'Tsumura',
  anderson: 'Anderson',
  bergen: 'Bergen',
  berlin: 'Berlin',
  levenson: 'Levenson',
  rhoads: 'Rhoads',
  vangemeren: 'VanGemeren',
  jobes: 'Jobes',
  oconnor: "O'Connor",
  lundbom: 'Lundbom',
  brueggemann: 'Brueggemann',
  andersen_freedman: 'Andersen & Freedman',
  stuart: 'Stuart',
  zimmerli: 'Zimmerli',
  verhoef: 'Verhoef',
  boda: 'Boda',
  hill: 'Hill',
  moo: 'Moo',
  schreiner: 'Schreiner',
  fee: 'Fee',
  thiselton: 'Thiselton',
  harris: 'Harris',
  bruce: 'Bruce',
  lincoln: 'Lincoln',
  obrien: "O'Brien",
};

// ── Public API ──────────────────────────────────────────────────────

/**
 * Get the display label for any panel type.
 * Known panels → static label. Scholar panels → scholar name.
 * Unknown → title-cased type string as fallback.
 */
export function getPanelLabel(type: string): string {
  if (PANEL_LABELS[type]) return PANEL_LABELS[type];
  if (SCHOLAR_LABELS[type]) return SCHOLAR_LABELS[type];
  // Fallback: title-case the type
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Check if a panel type is a scholar commentary panel.
 */
export function isScholarPanel(type: string): boolean {
  return type in SCHOLAR_LABELS || type in scholarColors;
}

/**
 * Known section-level panel type order for ButtonRow display.
 * Scholar panels inserted after cross, before poi/tl.
 */
export const SECTION_PANEL_ORDER = [
  'heb', 'hist', 'ctx', 'cross',
  // ... scholars inserted dynamically ...
  'poi', 'tl', 'places',
];

/**
 * Chapter-level panel type order for ButtonRow display.
 */
export const CHAPTER_PANEL_ORDER = [
  'lit', 'hebtext', 'themes', 'ppl', 'trans',
  'src', 'rec', 'thread', 'tx', 'textual', 'debate',
];
