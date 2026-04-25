import type { ModeDefinition } from './types';

export const QUICK_MODE: ModeDefinition = {
  key: 'quick',
  label: 'Quick pass',
  shortLabel: 'Quick',
  estimatedMinutes: 9,
  blurb: 'Context, one key observation, and a short takeaway.',
  marketingPromise: "A short pass that lands one takeaway you'll remember.",
  steps: {
    scene: { prompts: [] },
    observe: { prompts: [] },
    explore: { prompts: [] },
    synthesize: { prompts: [] },
    review: { prompts: [] },
  },
  trailOrder: ['context', 'language', 'scripture'],
  recommendationLimit: 3,
  panelWeights: {},
  synthesisTemplate: 'paragraph_plus_verse',
  reviewArtifact: 'memory_verse',
};
