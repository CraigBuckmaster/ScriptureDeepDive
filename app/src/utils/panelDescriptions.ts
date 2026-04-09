/**
 * utils/panelDescriptions.ts — Human-readable descriptions for panel types.
 *
 * Used by PanelInfoSheet for long-press tooltips (#1050).
 * Content panels have static descriptions. Scholar panels pull
 * their description from scholars.json at runtime.
 */

export interface PanelDescription {
  label: string;
  description: string;
}

export const PANEL_DESCRIPTIONS: Record<string, PanelDescription> = {
  // Section-level content panels
  heb:       { label: 'Hebrew Word Study',      description: 'Key Hebrew and Greek words in this passage — their etymology, range of meaning, and theological significance.' },
  hist:      { label: 'Historical Context',      description: 'What was happening in the ancient world when this was written — politics, culture, and daily life that shaped the original audience.' },
  ctx:       { label: 'Literary Context',        description: 'How this passage fits into the larger narrative flow — what comes before, what comes after, and why it matters here.' },
  cross:     { label: 'Cross-References',        description: 'Other passages that quote, echo, or parallel this text — showing how Scripture interprets itself.' },
  poi:       { label: 'Places of Interest',      description: 'Geographic locations mentioned in this passage with historical and archaeological context.' },
  tl:        { label: 'Timeline',                description: 'Where this passage falls in biblical chronology and what was happening in the wider ancient world.' },
  places:    { label: 'Places',                  description: 'Geographic locations mentioned in this passage with maps and historical context.' },

  // Chapter-level content panels
  lit:       { label: 'Literary Structure',      description: 'The architecture of this chapter — chiasms, inclusios, parallelism, and other structural patterns the author used.' },
  hebtext:   { label: 'Hebrew-Rooted Reading',   description: 'Reading through the lens of the original Hebrew — wordplay, alliteration, and nuances lost in English translation.' },
  themes:    { label: 'Theological Themes',      description: 'Major theological ideas running through this chapter and how they connect to the rest of Scripture.' },
  ppl:       { label: 'People',                  description: 'Key figures in this chapter — who they are, their role in the narrative, and their significance.' },
  trans:     { label: 'Translation Comparison',  description: 'How different Bible translations handle difficult phrases — and why the differences matter.' },
  src:       { label: 'Ancient Sources',         description: 'Ancient Near Eastern texts, inscriptions, and traditions that illuminate or parallel this passage.' },
  rec:       { label: 'Reception History',       description: 'How this chapter has been read and interpreted across 2,000 years of church history.' },
  thread:    { label: 'Intertextual Threading',  description: 'Thematic threads that run from this passage through other books — tracing ideas across the canon.' },
  tx:        { label: 'Textual Notes',           description: 'Manuscript variants, scribal traditions, and text-critical issues — what the earliest copies actually say.' },
  textual:   { label: 'Textual Notes',           description: 'Manuscript variants, scribal traditions, and text-critical issues — what the earliest copies actually say.' },
  debate:    { label: 'Scholarly Debates',        description: 'Points where respected scholars disagree about this passage — with each position and its reasoning.' },
  discourse: { label: 'Argument Flow',           description: "The logical structure of the author's argument — how each point builds on the last." },
  mac:       { label: 'Application',             description: 'Pastoral commentary focused on practical life application, grounded in grammatical-historical interpretation.' },
};
