import type { SectionPanel } from '../../types';
import type {
  GuidedConceptChip,
  GuidedPanelRecommendation,
  GuidedPrompt,
  GuidedStudyPlan,
  GuidedStudyPlanInput,
} from './types';

const RECOMMENDATION_ORDER = [
  'hist',
  'ctx',
  'trans',
  'tx',
  'heb',
  'greek',
  'cross',
  'src',
  'com',
  'debate',
];

const PANEL_LABELS: Record<string, string> = {
  hist: 'Historical Context',
  ctx: 'Context',
  trans: 'Translation Decision Notes',
  tx: 'Textual Notes',
  heb: 'Original-Language Study',
  greek: 'Original-Language Study',
  cross: 'Cross-References',
  src: 'Cross-Testament Echoes',
  com: 'Scholar Commentary',
  debate: 'Scholar Debate',
};

// TODO(#1584): Replace with labels from content/meta/concepts.json via
// getAllConcepts(). Hardcoding 15 concepts is a v1 stopgap — this list
// doesn't scale with content and silently excludes concepts the content
// team adds (justification, atonement, incarnation, sanctification, etc.).
const CONCEPT_WORDS = [
  'creation',
  'covenant',
  'spirit',
  'image',
  'temple',
  'kingdom',
  'wisdom',
  'mercy',
  'judgment',
  'resurrection',
  'faith',
  'law',
  'mission',
  'redemption',
  'suffering',
];

function compact(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : null;
}

function firstSentence(value: string | null | undefined): string | null {
  const text = compact(value);
  if (!text) return null;
  const match = text.match(/^(.+?[.!?])\s/);
  return match?.[1] ?? text;
}

function displayChapter(input: GuidedStudyPlanInput): string {
  const bookName = input.book?.name ?? input.chapter.book_id;
  return `${bookName} ${input.chapter.chapter_num}`;
}

// Canonical genre → opening-prompt map. Keys must exactly match the
// `genre_label` values produced by the content pipeline (see books.json).
// If a new genre is added to content, extend this table; `genrePrompt`
// falls back to a generic prompt for unknown genres.
// TODO(#1584): Pair this with the concept-list refactor — both should
// derive from a single source of canonical labels.
const GENRE_PROMPTS: Record<string, string> = {
  'Theological Narrative':
    'What tension, movement, or turning point do you notice in this scene?',
  Narrative: 'What tension, movement, or turning point do you notice in this scene?',
  Poetry: 'What emotional movement do you notice from the opening line to the close?',
  Psalm: 'What emotional movement do you notice from the opening line to the close?',
  Prophecy: 'What covenant problem is the prophet confronting?',
  Prophet: 'What covenant problem is the prophet confronting?',
  Letter: 'What problem or question is this paragraph answering?',
  Epistle: 'What problem or question is this paragraph answering?',
  Wisdom: 'What pattern of wise or foolish living is being exposed?',
};

function genrePrompt(genreLabel?: string): string {
  if (!genreLabel) {
    return 'What does the passage emphasize before you open any study panels?';
  }
  return (
    GENRE_PROMPTS[genreLabel] ??
    'What does the passage emphasize before you open any study panels?'
  );
}

function sectionPrompt(input: GuidedStudyPlanInput): string {
  const first = input.sections[0];
  if (!first) return 'What question would help you understand this chapter on its own terms?';
  return `What do verses ${first.verse_start}-${first.verse_end} ask you to notice about the original audience, not just yourself?`;
}

function recommendationSubtitle(panel: SectionPanel, sectionHeader: string): string {
  return sectionHeader ? `From ${sectionHeader}` : `Section ${panel.section_id}`;
}

function buildRecommendations(input: GuidedStudyPlanInput): GuidedPanelRecommendation[] {
  const recs: GuidedPanelRecommendation[] = [];
  const used = new Set<string>();

  for (const panelType of RECOMMENDATION_ORDER) {
    for (const section of input.sections) {
      const panel = section.panels.find((p) => p.panel_type === panelType);
      const key = `${section.id}:${panelType}`;
      if (!panel || used.has(panelType) || used.has(key)) continue;
      recs.push({
        key,
        title: PANEL_LABELS[panelType] ?? 'Study Panel',
        subtitle: recommendationSubtitle(panel, section.header),
        panelType,
        sectionNum: section.section_num,
        confidence:
          panelType === 'debate' ? 'debated' : panelType === 'com' ? 'majority' : undefined,
      });
      used.add(panelType);
      used.add(key);
      break;
    }
  }

  for (const chapterPanel of input.chapterPanels) {
    if (recs.length >= 5) break;
    const label = PANEL_LABELS[chapterPanel.panel_type];
    if (!label || used.has(`chapter:${chapterPanel.panel_type}`)) continue;
    recs.push({
      key: `chapter:${chapterPanel.panel_type}`,
      title: label,
      subtitle: 'Chapter-level study',
      panelType: chapterPanel.panel_type,
      confidence: chapterPanel.panel_type === 'debate' ? 'debated' : undefined,
    });
    used.add(`chapter:${chapterPanel.panel_type}`);
  }

  return recs.slice(0, 5);
}

function buildConceptChips(input: GuidedStudyPlanInput): GuidedConceptChip[] {
  const chips: GuidedConceptChip[] = [];
  const genre = compact(input.book?.genre_label) ?? compact(input.bookIntro?.at_a_glance?.genre);
  if (genre) {
    chips.push({ id: `genre:${genre.toLowerCase().replace(/\s+/g, '-')}`, label: genre });
  }

  const haystack = [
    input.chapter.title,
    input.chapter.subtitle,
    input.bookIntro?.at_a_glance?.key_theme,
    input.bookIntro?.at_a_glance?.key_word,
    input.bookIntro?.purpose,
    ...input.sections.map((s) => s.header),
  ]
    .join(' ')
    .toLowerCase();

  const lexicalChips = CONCEPT_WORDS.filter((word) => haystack.includes(word))
    .slice(0, Math.max(0, 5 - chips.length))
    .map((word) => ({
      id: word.replace(/\s+/g, '-'),
      label: word.replace(/^\w/, (c) => c.toUpperCase()),
    }));

  return [...chips, ...lexicalChips];
}

export function buildGuidedStudyPlan(input: GuidedStudyPlanInput): GuidedStudyPlan {
  const chapterTitle = input.chapter.title || displayChapter(input);
  const purpose = firstSentence(input.bookIntro?.purpose);
  const moment =
    compact(input.chapter.subtitle) ?? compact(input.chapter.title) ?? displayChapter(input);
  const genre =
    compact(input.book?.genre_label) ??
    compact(input.bookIntro?.at_a_glance?.genre) ??
    'Biblical literature';
  const guidance = compact(input.book?.genre_guidance);
  const audienceContext =
    compact(input.bookIntro?.era) ?? compact(input.bookIntro?.at_a_glance?.chapters?.toString());

  const prompts: GuidedPrompt[] = [
    {
      key: 'genre-observation',
      text: genrePrompt(input.book?.genre_label ?? input.bookIntro?.at_a_glance?.genre),
    },
    { key: 'better-question', text: sectionPrompt(input) },
  ];

  return {
    chapterId: input.chapter.id,
    title: chapterTitle,
    sceneRows: [
      { label: 'Genre', value: guidance ? `${genre}: ${guidance}` : genre },
      { label: 'Moment', value: moment },
      {
        label: 'Original audience context',
        value:
          audienceContext ??
          'Use the book intro and panels to ask what this first meant in its ancient setting.',
      },
      {
        label: 'Purpose',
        value: purpose ?? 'Read the chapter first, then let the study panels sharpen the context.',
      },
    ],
    prompts,
    recommendations: buildRecommendations(input),
    conceptChips: buildConceptChips(input),
  };
}
