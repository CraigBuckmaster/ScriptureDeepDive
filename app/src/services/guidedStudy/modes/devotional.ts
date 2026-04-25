import type { ModeDefinition } from './types';

export const DEVOTIONAL_MODE: ModeDefinition = {
  key: 'devotional',
  label: 'Devotional',
  shortLabel: 'Devotional',
  estimatedMinutes: 12,
  blurb: 'Observe the text carefully before moving toward prayerful response.',
  marketingPromise: "A prayer in the chapter's own language.",
  steps: {
    scene: { prompts: [] },
    observe: { prompts: [] },
    explore: { prompts: [] },
    synthesize: { prompts: [] },
    review: { prompts: [] },
  },
  trailOrder: ['context', 'scripture', 'language'],
  recommendationLimit: 3,
  panelWeights: {},
  synthesisTemplate: 'prayer_and_carry',
  reviewArtifact: 'returning_prayer',
};
