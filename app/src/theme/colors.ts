/**
 * colors.ts — Complete color token system for Companion Study.
 *
 * All values extracted from the PWA CSS variables (css/base.css, css/styles.css)
 * and data files (scholar-data.js, timeline-data.js).
 *
 * Categories:
 *   base    — 14 UI foundation colors
 *   panels  — 17 panel accent sets (bg, border, accent)
 *   scholars — 42 scholar identity colors
 *   eras    — 9 era timeline colors
 */

// ── Panel Accent Colors ─────────────────────────────────────────────

export interface PanelColors {
  bg: string;
  border: string;
  accent: string;
}

export const panels: Record<string, PanelColors> = {
  heb:     { bg: '#261520', border: '#7a3050', accent: '#e890b8' },
  hist:    { bg: '#101e30', border: '#2a5080', accent: '#70b8e8' },
  ctx:     { bg: '#102418', border: '#2a6040', accent: '#70d098' },
  cross:   { bg: '#1e1808', border: '#6a4a00', accent: '#d4b060' },
  poi:     { bg: '#0e1a0e', border: '#1a6028', accent: '#30a848' },
  tl:      { bg: '#101824', border: '#0a0f18', accent: '#70b8e8' },
  ppl:     { bg: '#241208', border: '#8a3010', accent: '#e86040' },
  trans:   { bg: '#082624', border: '#186058', accent: '#58c8c0' },
  src:     { bg: '#201020', border: '#603058', accent: '#a05890' },
  rec:     { bg: '#240e18', border: '#882040', accent: '#e04080' },
  lit:     { bg: '#1a1e08', border: '#485010', accent: '#b8c858' },
  hebtext: { bg: '#141008', border: '#4a3800', accent: '#d4aa40' },
  thread:  { bg: '#101028', border: '#303070', accent: '#9090e0' },
  com:     { bg: '#1c0810', border: '#6a1828', accent: '#c04050' },
  tx:      { bg: '#101020', border: '#303060', accent: '#8888d0' },
  debate:  { bg: '#201212', border: '#603030', accent: '#d08080' },
  themes:  { bg: '#14120e', border: '#3a3010', accent: '#bfa050' },
  // Second Temple Context — parchment-gold, distinct from ctx (green) / hist (blue)
  // and sibling enough to cross (gold) to signal "intertestamental literature".
  st2:     { bg: '#1c1610', border: '#6a4a20', accent: '#c89858' },
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
  verhoef: '#d0a878',
  waltke: '#e8a0b8',
  webb: '#90c890',
  williamson: '#90a8c8',
  wiseman: '#b0d8e8',
  lundbom: '#d0a068',
  brueggemann: '#88a0c8',
  andersen_freedman: '#b8956c',
  boda: '#a0b8d0',
  hill: '#c8a8d0',
  stuart: '#8db87c',
  zimmerli: '#a8c090',
  moo: '#7898c0',
  schreiner: '#c09868',
  fee: '#6898b8',
  thiselton: '#a088b8',
  harris: '#8ab870',
  bruce: '#a8906c',
  lincoln: '#7ca898',
  obrien: '#b89070',
  silva: '#9888a8',
  wanamaker: '#7898a8',
  mounce: '#a87888',
  towner: '#78a890',
  lane: '#b0c0b0',
  cockerill: '#a0a8c0',
  mccartney: '#9f8fa8',
  davids: '#a8b0b8',
  green: '#b0b8a8',
  yarbrough: '#a8b8a0',
  kruse: '#b0a8b8',
  beale: '#c0a0b8',
  osborne: '#a8b0b8',
} as const;

// ── Era Colors ──────────────────────────────────────────────────────

export const eras: Record<string, string> = {
  primeval: '#523d0b',
  patriarch: '#4b395f',
  exodus: '#26472e',
  judges: '#503d18',
  kingdom: '#304153',
  divided_kingdom: '#5a4535',
  prophets: '#653030',
  exile: '#29444d',
  'post-exilic': '#3a5a4a',
  intertestamental: '#4a3e27',
  nt: '#46370f',
  apostolic: '#3a4a5a',
} as const;

export const eraNames: Record<string, string> = {
  primeval: 'Primeval History',
  patriarch: 'Patriarchal Period',
  exodus: 'Egypt & Exodus',
  judges: 'Conquest & Judges',
  kingdom: 'United Kingdom',
  divided_kingdom: 'Divided Kingdom',
  prophets: 'Prophets',
  exile: 'Exile',
  'post-exilic': 'Post-Exilic',
  intertestamental: 'Intertestamental',
  nt: 'New Testament',
  apostolic: 'Apostolic Age',
} as const;

/** Compact labels for filter pills — short enough for single-line chip display. */
export const eraPillLabels: Record<string, string> = {
  primeval: 'Primeval',
  patriarch: 'Patriarchs',
  exodus: 'Exodus',
  judges: 'Judges',
  kingdom: 'Kingdom',
  divided_kingdom: 'Divided',
  prophets: 'Prophets',
  exile: 'Exile',
  'post-exilic': 'Return',
  intertestamental: 'Intertestam.',
  nt: 'NT',
  apostolic: 'Apostolic',
} as const;

// ── Category Colors (timeline, browse screens) ─────────────────────

export const categoryColors = {
  event: '#bfa050',
  book: '#7a6b5a',
  person: '#6a9fb5',
  world: '#b07d4f',
} as const;

// ── Difficult Passage / Browse Categories ──────────────────────────

export const categories = {
  ethical: '#E57373',
  contradiction: '#FFB74D',
  theological: '#64B5F6',
  historical: '#81C784',
  textual: '#BA68C8',
} as const;

// ── Severity Colors ────────────────────────────────────────────────

export const severity = {
  moderate: '#FFC107',
  major: '#F44336',
} as const;

// ── Tradition Family Colors ────────────────────────────────────────

export const families = {
  evangelical: '#64B5F6',
  critical: '#FFB74D',
  jewish: '#81C784',
  patristic: '#BA68C8',
  reformed: '#4FC3F7',
  catholic: '#E57373',
  // Second Temple Judaism reception (HWGTB epic) — sand/parchment tone
  // evoking ancient manuscripts; distinct from jewish (rabbinic-era) green.
  'second-temple': '#D4A373',
  // Eastern Orthodox tradition — deeper liturgical red, distinct from catholic.
  orthodox: '#B85C5C',
} as const;

// ── Prophecy Category Colors ───────────────────────────────────────

export const prophecyCategories = {
  messianic: '#e8a070',
  covenant: '#70b8e8',
  judgment: '#e07070',
  restoration: '#70d098',
  typological: '#c090e0',
} as const;

// ── Prophecy Role Colors ───────────────────────────────────────────

export const roles = {
  origin: '#8a8040',
  prophecy: '#a08840',
  development: '#b09050',
  type: '#c09858',
  fulfillment: '#d4b060',
  consummation: '#e0c878',
} as const;

// ── Testament Dot Colors (prophecy timeline) ───────────────────────

export const testament = {
  ot: '#c8a040',
  nt: '#a0c8e0',
} as const;

// ── Timeline SVG Colors ────────────────────────────────────────────

export const timelineSvg = {
  axis: '#3a2808',
  tick: '#5a4a28',
} as const;

// ── Discourse Node Colors (DiscoursePanel argument trees) ─────────
// Keyed by discourse node type. Transformed per mode via buildPalette.

export const discourseNodes: Record<string, string> = {
  thesis: '#bfa050',
  premise: '#70b8e8',
  ground: '#70d098',
  inference: '#c090e0',
  conclusion: '#e8a070',
  contrast: '#e07070',
  concession: '#a0a0c0',
  purpose: '#80c8c0',
  result: '#d8b870',
  illustration: '#b8a090',
  exhortation: '#e890b8',
  doxology: '#c8c080',
} as const;

// ── Echo Type Colors (Connections hub EchoesView) ─────────────────

export const echoTypes = {
  direct_quote: '#64B5F6',
  allusion: '#81C784',
  echo: '#FFB74D',
  typological: '#BA68C8',
} as const;

// ── Debate Topic Category Colors (DebateBrowseScreen) ─────────────
// Distinct from `categories` (difficult passages) — same hues, different
// key set, tuned independently. Do not merge without a visual pass.

export const debateCategories = {
  theological: '#64B5F6',
  ethical: '#81C784',
  historical: '#FFB74D',
  textual: '#BA68C8',
  interpretive: '#4FC3F7',
} as const;

// ── Debate Position Analysis Colors (DebatePositionCard) ──────────

export const debatePosition = {
  strengths: '#4CAF50',
  weaknesses: '#F44336',
} as const;

// ── Trust Level Colors (TrustBadge, UserProfileScreen) ────────────

export const trustLevels: Record<number, string> = {
  0: '#888888',
  1: '#bfa050',
  2: '#50b060',
} as const;

// ── Contribution Status Colors (UserProfileScreen) ────────────────

export const contributionStatus: Record<string, string> = {
  draft: '#888888',
  pending: '#d4a843',
  approved: '#50b060',
  rejected: '#cc4444',
  flagged: '#cc6633',
} as const;

// ── Library Shelf Accents (LibrarySections feature cards) ─────────
// Keyed by destination screen name.

export const libraryAccents: Record<string, string> = {
  GenealogyTree: '#e86040',
  Timeline: '#70b8e8',
  Map: '#81C784',
  Periods: '#8a6e3a',
  RedemptiveArc: '#c8a040',
  JourneyBrowse: '#bfa050',
  TopicBrowse: '#c8a040',
  ProphecyBrowse: '#e8a070',
  ThreadBrowse: '#9090e0',
  HarmonyBrowse: '#70d098',
  WordStudyBrowse: '#e890b8',
  Concordance: '#70b8e8',
  DictionaryBrowse: '#c090e0',
  ScholarBrowse: '#a0b8d0',
  DebateBrowse: '#d08080',
  DifficultPassagesBrowse: '#FFB74D',
  HowWeGotTheBibleLanding: '#c89858',
  ContentLibrary: '#b8a0d0',
  LifeTopics: '#81C784',
  LensBrowse: '#BA68C8',
  ArchaeologyBrowse: '#b07d4f',
  TimeTravelBrowse: '#8a6a3a',
  GrammarBrowse: '#7a9ab0',
} as const;

// ── Overlay Colors (mode-invariant by design — never transformed) ──
// For content rendered over photos, dark gradients, gold fills, or as
// RN shadows. These deliberately do NOT change with the theme.

export const overlay = {
  /** RN shadowColor — must stay black for iOS shadows to render correctly. */
  black: '#000000',
  /** Text/dots/icons over photos and dark image gradients. */
  white: '#ffffff',
  /** Dark text on gold buttons/badges — readable on gold in every mode. */
  onGold: '#1a1a1a',
} as const;

// ── Third-Party Brand Colors (auth provider buttons) ──────────────
// Fixed by each provider's brand guidelines — never themed.

export const brand = {
  googleBg: '#ffffff',
  googleText: '#1f1f1f',
  facebookBg: '#1877F2',
  facebookText: '#ffffff',
} as const;

// ── User Highlight Palette (HighlightColorPicker) ──────────────────
// The `name` key is persisted to user.db (verse_highlights.color); the hex
// is presentation. Mode-invariant so saved highlights look stable.

export const userHighlightColors: Record<string, string> = {
  gold: '#bfa050',
  blue: '#5b8fb9',
  green: '#5fa87a',
  purple: '#8b7cb8',
  coral: '#c47a6a',
  teal: '#5ba8a0',
} as const;

// ── Collection Preset Colors (CollectionPicker) ────────────────────
// Persisted verbatim to user.db (highlight_collections.color) — never
// transformed, or saved collections would drift between modes.

export const collectionPresetColors: string[] = [
  '#bfa050', // gold
  '#70b8e8', // blue
  '#70d098', // green
  '#e890b8', // pink
  '#c090e0', // purple
  '#e8a070', // orange
];

// ── Church History Era Colors (Time-Travel Reader) ────────────

export const churchEras: Record<string, string> = {
  patristic: '#7a5c8a',
  medieval: '#5a7a5a',
  reformation: '#8a6a3a',
  modern: '#4a6a8a',
} as const;

export const churchEraLabels: Record<string, string> = {
  patristic: 'Patristic',
  medieval: 'Medieval',
  reformation: 'Reformation',
  modern: 'Modern',
} as const;
