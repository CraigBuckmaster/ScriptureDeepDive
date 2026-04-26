import type { Book, Chapter, ChapterPanel, Section, SectionPanel, Verse } from '../../types';
import type { ParsedBookIntro } from '../../types';
import { GUIDED_STUDY_STEPS, type GuidedStudyStep } from '../../types';

export { GUIDED_STUDY_STEPS };
export type { GuidedStudyStep };

/** UI labels for each step. Order follows `GUIDED_STUDY_STEPS`. */
export const GUIDED_STUDY_STEP_LABELS: Record<GuidedStudyStep, string> = {
  scene: 'Scene',
  observe: 'Observe',
  explore: 'Explore',
  synthesize: 'Synthesize',
  review: 'Review',
};

export const GUIDED_STUDY_MODES = ['quick', 'deep', 'teaching', 'devotional'] as const;

export type GuidedStudyMode = (typeof GUIDED_STUDY_MODES)[number];

export interface GuidedStudyModeOption {
  key: GuidedStudyMode;
  label: string;
  estimate: string;
  description: string;
}

export const GUIDED_STUDY_MODE_OPTIONS: GuidedStudyModeOption[] = [
  {
    key: 'quick',
    label: 'Quick pass',
    estimate: '8-10 min',
    description: 'Context, one key observation, and a short takeaway.',
  },
  {
    key: 'deep',
    label: 'Deep study',
    estimate: '20-30 min',
    description: 'A fuller trail through context, language, Scripture, and debate.',
  },
  {
    key: 'teaching',
    label: 'Teaching prep',
    estimate: '25 min',
    description: 'Structure, claims, and what someone else will need clarified.',
  },
  {
    key: 'devotional',
    label: 'Devotional',
    estimate: '12 min',
    description: 'Observe the text carefully before moving toward prayerful response.',
  },
];

export interface StudyDepthEstimate {
  readMin: number;
  guidedMin: number;
  deepMin: number;
}

/**
 * Subset of `CapturedInputs['scene']` keys whose stored shape is a string
 * (and therefore can back a single-line `TextInput`). Phase 2.5 (#1734)
 * scene input rows bind to one of these.
 */
export type SceneInputKey = 'audience' | 'setting' | 'arrival';

export type GuidedSceneRow =
  | { kind: 'display'; label: string; value: string }
  | {
      kind: 'input';
      label: string;
      placeholder: string;
      capturedKey: SceneInputKey;
    };

export interface GuidedPrompt {
  key: string;
  text: string;
}

export type ConfidenceLevel = 'consensus' | 'majority' | 'debated' | 'minority';

export interface GuidedPanelRecommendation {
  key: string;
  title: string;
  subtitle: string;
  panelType: string;
  sectionNum?: number;
  confidence?: ConfidenceLevel;
}

export interface GuidedEvidenceTrailItem {
  key: string;
  title: string;
  subtitle: string;
  panelType: string;
  sectionNum?: number;
  badge: 'Required' | 'Helpful' | 'Optional' | 'Debated';
  confidence?: ConfidenceLevel;
}

export interface GuidedConceptChip {
  id: string;
  label: string;
}

export interface GuidedStudyPlan {
  chapterId: string;
  title: string;
  mode: GuidedStudyMode;
  modeLabel: string;
  sceneRows: GuidedSceneRow[];
  /**
   * Mode-specific prompts keyed by step. Filled from
   * `MODE_DEFINITIONS[mode].steps[step].prompts`.
   */
  stepPrompts: Record<GuidedStudyStep, GuidedPrompt[]>;
  /**
   * Pre-Phase-2 genre-observation + better-question pair. Retired by
   * #1736 (Phase 2.7) once the screen consumes `stepPrompts` directly.
   */
  legacyPrompts: GuidedPrompt[];
  recommendations: GuidedPanelRecommendation[];
  evidenceTrail: GuidedEvidenceTrailItem[];
  betterQuestionPrompt: string;
  conceptChips: GuidedConceptChip[];
}

export interface GuidedStudyPlanInput {
  book: Book | null;
  chapter: Chapter;
  sections: Array<Section & { panels: SectionPanel[] }>;
  chapterPanels: ChapterPanel[];
  verses: Verse[];
  bookIntro?: ParsedBookIntro | null;
  mode?: GuidedStudyMode;
}
