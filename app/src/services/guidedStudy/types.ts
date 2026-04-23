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

export interface StudyDepthEstimate {
  readMin: number;
  guidedMin: number;
  deepMin: number;
}

export interface GuidedSceneRow {
  label: string;
  value: string;
}

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

export interface GuidedConceptChip {
  id: string;
  label: string;
}

export interface GuidedStudyPlan {
  chapterId: string;
  title: string;
  sceneRows: GuidedSceneRow[];
  prompts: GuidedPrompt[];
  recommendations: GuidedPanelRecommendation[];
  conceptChips: GuidedConceptChip[];
}

export interface GuidedStudyPlanInput {
  book: Book | null;
  chapter: Chapter;
  sections: Array<Section & { panels: SectionPanel[] }>;
  chapterPanels: ChapterPanel[];
  verses: Verse[];
  bookIntro?: ParsedBookIntro | null;
}
