import type { ModeDefinition } from './types';

export const TEACHING_MODE: ModeDefinition = {
  key: 'teaching',
  label: 'Teaching prep',
  shortLabel: 'Teaching',
  estimatedMinutes: 25,
  blurb: 'Structure, claims, and what someone else will need clarified.',
  marketingPromise: 'An outline you can teach from confidently.',
  steps: {
    scene: { prompts: [] },
    observe: { prompts: [] },
    explore: { prompts: [] },
    synthesize: { prompts: [] },
    review: { prompts: [] },
  },
  trailOrder: ['context', 'structure', 'scripture', 'debate'],
  recommendationLimit: 5,
  panelWeights: {},
  synthesisTemplate: 'teaching_outline',
  reviewArtifact: 'teaching_outline',
};
