import type { SectionPanel } from '../../types';
import { resolveGenre } from '../../utils/genre';
import { getModeDefinition } from './modes/definitions';
import { buildRepetitionChips, mergeObservationChips } from './observationChips';
import {
  GUIDED_STUDY_STEPS,
  type ConfidenceLevel,
  type GuidedConceptChip,
  type GuidedEvidenceTrailItem,
  type GuidedPanelRecommendation,
  type GuidedPrompt,
  type GuidedSceneRow,
  type GuidedStudyMode,
  type GuidedStudyPlan,
  type GuidedStudyPlanInput,
  type GuidedStudyStep,
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
  lit: 'Literary Structure',
  thread: 'Intertextual Threading',
  discourse: 'Argument Flow',
};

// TODO(#1584): Replace with labels from content/meta/concepts.json via
// getAllConcepts(). Hardcoding 15 concepts is a v1 stopgap. This list
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

// Canonical genre to opening-prompt map. Keys must exactly match the
// `genre_label` values produced by the content pipeline (see books.json).
// If a new genre is added to content, extend this table; `genrePrompt`
// falls back to a generic prompt for unknown genres.
// TODO(#1584): Pair this with the concept-list refactor. Both should
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
  return getModeDefinition((mode ?? 'deep') as GuidedStudyMode).key;
}

function modeLabel(mode: GuidedStudyMode): string {
  return getModeDefinition(mode).label;
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

// Mode-specific better-question prompts move into MODE_DEFINITIONS in #1730
// (Phase 2.1). For Phase 1 this is intentionally not mode-aware.
function betterQuestionPrompt(input: GuidedStudyPlanInput): string {
  const first = input.sections[0];
  if (!first) return 'What question would help you understand this chapter on its own terms?';
  return `What do verses ${first.verse_start}-${first.verse_end} ask you to notice about the original audience, not just yourself?`;
}

function recommendationSubtitle(panel: SectionPanel, sectionHeader: string): string {
  return sectionHeader ? `From ${sectionHeader}` : `Section ${panel.section_id}`;
}

export function buildRecommendations(
  input: GuidedStudyPlanInput,
  panelWeights: Readonly<Record<string, number>> = {},
): GuidedPanelRecommendation[] {
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

  if (Object.keys(panelWeights).length > 0) {
    recs.sort((a, b) => (panelWeights[b.panelType] ?? 0) - (panelWeights[a.panelType] ?? 0));
  }

  return recs;
}

function buildEvidenceTrail(
  mode: GuidedStudyMode,
  recommendations: GuidedPanelRecommendation[],
): GuidedEvidenceTrailItem[] {
  const items: GuidedEvidenceTrailItem[] = [];

  for (const kind of getModeDefinition(mode).trailOrder) {
    const definition = EVIDENCE_TRAIL_DEFINITIONS[kind];
    const recommendation = recommendations.find((rec) =>
      definition.candidatePanelTypes.includes(rec.panelType),
    );
    if (!recommendation) continue;

    const confidence = definition.confidence ?? recommendation.confidence;
    items.push({
      key: `${kind}:${recommendation.key}`,
      title: definition.title,
      subtitle: definition.subtitle,
      panelType: recommendation.panelType,
      badge: definition.badge,
      ...(recommendation.sectionNum != null ? { sectionNum: recommendation.sectionNum } : {}),
      ...(confidence ? { confidence } : {}),
    });
  }

  return items;
}

function buildConceptChips(input: GuidedStudyPlanInput): GuidedConceptChip[] {
  const chips: GuidedConceptChip[] = [];
  // #1724 — chapter override wins, then book-level, then bookIntro fallback.
  const resolved = resolveGenre(input.book, input.chapter);
  const genre = resolved?.label ?? compact(input.bookIntro?.at_a_glance?.genre);
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
  // #1724 — chapter override wins, then book-level, then bookIntro fallback.
  const resolvedGenre = resolveGenre(input.book, input.chapter);
  const genre =
    resolvedGenre?.label ??
    compact(input.bookIntro?.at_a_glance?.genre) ??
    'Biblical literature';
  const guidance = resolvedGenre?.guidance;
  const audienceContext =
    compact(input.bookIntro?.era) ?? compact(input.bookIntro?.at_a_glance?.chapters?.toString());
  const def = getModeDefinition(mode);
  const allRecommendations = buildRecommendations(input, def.panelWeights);
  const betterQuestion = betterQuestionPrompt(input);

  const legacyPrompts: GuidedPrompt[] = [
    {
      key: 'genre-observation',
      text: genrePrompt(resolvedGenre?.label ?? input.bookIntro?.at_a_glance?.genre),
    },
    { key: 'better-question', text: betterQuestion },
  ];

  const stepPrompts = GUIDED_STUDY_STEPS.reduce<Record<GuidedStudyStep, GuidedPrompt[]>>(
    (acc, step) => {
      acc[step] = def.steps[step].prompts;
      return acc;
    },
    {} as Record<GuidedStudyStep, GuidedPrompt[]>,
  );

  const sceneRows: GuidedSceneRow[] = [
    { kind: 'display', label: 'Genre', value: guidance ? `${genre}: ${guidance}` : genre },
    { kind: 'display', label: 'Moment', value: moment },
    {
      kind: 'display',
      label: 'Original audience context',
      value:
        audienceContext ??
        'Use the book intro and panels to ask what this first meant in its ancient setting.',
    },
    {
      kind: 'display',
      label: 'Purpose',
      value: purpose ?? 'Read the chapter first, then let the study panels sharpen the context.',
    },
  ];

  if (mode === 'teaching') {
    sceneRows.push(
      {
        kind: 'input',
        label: 'Audience',
        placeholder: 'Who are you teaching? What do they already know?',
        capturedKey: 'audience',
      },
      {
        kind: 'input',
        label: 'Setting',
        placeholder: 'Sermon, small group, classroom, one-on-one…',
        capturedKey: 'setting',
      },
    );
  } else if (mode === 'devotional') {
    sceneRows.push({
      kind: 'input',
      label: 'What you bring',
      placeholder: 'How did you arrive at this chapter today?',
      capturedKey: 'arrival',
    });
  }

  const conceptChips = buildConceptChips(input);

  return {
    chapterId: input.chapter.id,
    title: chapterTitle,
    mode,
    modeLabel: modeLabel(mode),
    sceneRows,
    stepPrompts,
    legacyPrompts,
    recommendations: allRecommendations.slice(0, def.recommendationLimit),
    evidenceTrail: buildEvidenceTrail(mode, allRecommendations),
    betterQuestionPrompt: betterQuestion,
    conceptChips,
    // #1839 (additive field only — see issue card): Observe-step chips.
    observationChips: mergeObservationChips(conceptChips, buildRepetitionChips(input.verses)),
  };
}
