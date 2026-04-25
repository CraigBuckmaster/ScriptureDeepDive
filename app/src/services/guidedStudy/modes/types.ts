import type { GuidedPrompt, GuidedStudyMode, GuidedStudyStep } from '../types';

export type EvidenceTrailKind = 'context' | 'structure' | 'language' | 'scripture' | 'debate';

export interface ModeStepConfig {
  prompts: GuidedPrompt[];
  helperText?: string;
  carryForward?: ReadonlyArray<'scene' | 'observe' | 'explore' | 'synthesize'>;
}

export type SynthesisTemplateKind =
  | 'paragraph_plus_verse'
  | 'claim_evidence_tension'
  | 'teaching_outline'
  | 'prayer_and_carry';

export type ReviewArtifactType =
  | 'memory_verse'
  | 'analytical_claim'
  | 'teaching_outline'
  | 'returning_prayer';

export interface ModeDefinition {
  key: GuidedStudyMode;
  label: string;
  shortLabel: string;
  estimatedMinutes: number;
  blurb: string;
  marketingPromise: string;
  steps: Record<GuidedStudyStep, ModeStepConfig>;
  trailOrder: ReadonlyArray<EvidenceTrailKind>;
  recommendationLimit: number;
  panelWeights: Readonly<Record<string, number>>;
  synthesisTemplate: SynthesisTemplateKind;
  reviewArtifact: ReviewArtifactType;
}
