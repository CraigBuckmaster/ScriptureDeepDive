import type { SectionPanel } from '../../types';
import type {
  ConfidenceLevel,
  GuidedConceptChip,
  GuidedEvidenceTrailItem,
  GuidedPanelRecommendation,
  GuidedPrompt,
  GuidedStudyMode,
  GuidedStudyPlan,
  GuidedStudyPlanInput,
} from './types';
import { GUIDED_STUDY_MODE_OPTIONS } from './types';

const DEFAULT_MODE: GuidedStudyMode = 'deep';

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
  lit: 'Literary Structure',
  thread: 'Intertextual Threading',
  discourse: 'Argument Flow',
};

const MODE_RECOMMENDATION_LIMIT: Record<GuidedStudyMode, number> = {
  quick: 3,
  deep: 5,
  teaching: 5,
  devotional: 3,
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

type EvidenceTrailKind = 'context' | 'structure' | 'language' | 'scripture' | 'debate';

interface EvidenceTrailDefinition {
  kind: EvidenceTrailKind;
  title: string;
  subtitle: string;
  badge: GuidedEvidenceTrailItem['badge'];
  candidatePanelTypes: string[];
  confidence?: ConfidenceLevel;
}

const EVIDENCE_TRAIL_DEFINITIONS: Record<EvidenceTrailKind, EvidenceTrailDefinition> = {
  context: {
    kind: 'context',
    title: 'Start with context',
    subtitle: 'Ancient audience, genre, and setting',
    badge: 'Required',
    candidatePanelTypes: ['hist', 'ctx'],
  },
  structure: {
    kind: 'structure',
    title: 'Trace the structure',
    subtitle: 'How the chapter is arranged and argued',
    badge: 'Helpful',
    candidatePanelTypes: ['lit', 'discourse'],
  },
  language: {
    kind: 'language',
    title: 'Check the language',
    subtitle: 'Key words, translation choices, and repeated phrases',
    badge: 'Helpful',
    candidatePanelTypes: ['heb', 'greek', 'trans', 'tx'],
  },
  scripture: {
    kind: 'scripture',
    title: 'Compare Scripture',
    subtitle: 'Echoes, cross-references, and canonical connections',
    badge: 'Helpful',
    candidatePanelTypes: ['cross', 'src', 'thread'],
  },
  debate: {
    kind: 'debate',
    title: 'If unclear, weigh debate',
    subtitle: 'Where careful interpreters differ',
    badge: 'Debated',
    candidatePanelTypes: ['debate', 'com'],
    confidence: 'debated',
  },
};

const MODE_TRAIL_ORDER: Record<GuidedStudyMode, EvidenceTrailKind[]> = {
  quick: ['context', 'language', 'scripture'],
  deep: ['context', 'language', 'scripture', 'debate'],
  teaching: ['context', 'structure', 'scripture', 'debate'],
  devotional: ['context', 'scripture', 'language'],
};

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

function normalizeMode(mode?: GuidedStudyMode): GuidedStudyMode {
  return GUIDED_STUDY_MODE_OPTIONS.some((option) => option.key === mode)
    ? mode ?? DEFAULT_MODE
    : DEFAULT_MODE;
}

function modeLabel(mode: GuidedStudyMode): string {
  return GUIDED_STUDY_MODE_OPTIONS.find((option) => option.key === mode)?.label ?? 'Deep study';
}

function genrePrompt(genreLabel?: string): string {
  if (!genreLabel) {
    return 'What does the passage emphasize before you open any study panels?';
  }
  return (
    GENRE_PROMPTS[genreLabel] ??
    'What does the passage emphasize before you open any study panels?'
  );
}

function betterQuestionPrompt(input: GuidedStudyPlanInput, mode: GuidedStudyMode): string {
  const first = input.sections[0];
  if (mode === 'quick') {
    return 'What is the one question you should answer before moving on?';
  }
  if (mode === 'teaching') {
    return 'What would someone need clarified before they could teach this passage responsibly?';
  }
  if (mode === 'devotional') {
    return 'What does the chapter emphasize before you ask how it applies to me?';
  }
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
    if (recs.length >= 7) break;
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

  return recs;
}

function buildEvidenceTrail(
  mode: GuidedStudyMode,
  recommendations: GuidedPanelRecommendation[],
): GuidedEvidenceTrailItem[] {
  return MODE_TRAIL_ORDER[mode]
    .map((kind) => {
      const definition = EVIDENCE_TRAIL_DEFINITIONS[kind];
      const recommendation = recommendations.find((rec) =>
        definition.candidatePanelTypes.includes(rec.panelType),
      );
      if (!recommendation) return null;
      return {
        key: `${kind}:${recommendation.key}`,
        title: definition.title,
        subtitle: definition.subtitle,
        panelType: recommendation.panelType,
        sectionNum: recommendation.sectionNum,
        badge: definition.badge,
        confidence: definition.confidence ?? recommendation.confidence,
      } satisfies GuidedEvidenceTrailItem;
    })
    .filter((item): item is GuidedEvidenceTrailItem => item != null);
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
  const mode = normalizeMode(input.mode);
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
  const allRecommendations = buildRecommendations(input);
  const betterQuestion = betterQuestionPrompt(input, mode);

  const prompts: GuidedPrompt[] = [
    {
      key: 'genre-observation',
      text: genrePrompt(input.book?.genre_label ?? input.bookIntro?.at_a_glance?.genre),
    },
    { key: 'better-question', text: betterQuestion },
  ];

  return {
    chapterId: input.chapter.id,
    title: chapterTitle,
    mode,
    modeLabel: modeLabel(mode),
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
    recommendations: allRecommendations.slice(0, MODE_RECOMMENDATION_LIMIT[mode]),
    evidenceTrail: buildEvidenceTrail(mode, allRecommendations),
    betterQuestionPrompt: betterQuestion,
    conceptChips: buildConceptChips(input),
  };
}
