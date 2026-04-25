import type { ModeDefinition } from './types';

export const DEEP_MODE: ModeDefinition = {
  key: 'deep',
  label: 'Deep study',
  shortLabel: 'Deep',
  estimatedMinutes: 25,
  blurb: 'A fuller trail through context, language, Scripture, and debate.',
  marketingPromise: 'A structured analysis you can reason from.',
  steps: {
    scene: { prompts: [] },
    observe: { prompts: [] },
    explore: { prompts: [] },
    synthesize: { prompts: [] },
    review: { prompts: [] },
  },
  trailOrder: ['context', 'language', 'scripture', 'debate'],
  recommendationLimit: 5,
  panelWeights: {},
  synthesisTemplate: 'claim_evidence_tension',
  reviewArtifact: 'analytical_claim',
};
