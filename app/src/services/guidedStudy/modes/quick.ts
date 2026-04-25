import type { ModeDefinition } from './types';

export const QUICK_MODE: ModeDefinition = {
  key: 'quick',
  label: 'Quick pass',
  shortLabel: 'Quick',
  estimatedMinutes: 9,
  blurb: 'Context, one key observation, and a short takeaway.',
  marketingPromise: "A short pass that lands one takeaway you'll remember.",
  steps: {
    scene: {
      prompts: [
        {
          key: 'quick-scene-genre',
          text: "What kind of writing is this, and what's happening in this chapter?",
        },
      ],
    },
    observe: {
      prompts: [
        {
          key: 'quick-observe-takeaway',
          text: "What's the one thing you'd want to remember from this chapter?",
        },
      ],
    },
    explore: {
      prompts: [
        {
          key: 'quick-explore-priority',
          text: 'Which of these will help you most in 5 minutes?',
        },
      ],
    },
    synthesize: {
      prompts: [
        {
          key: 'quick-synthesize-summary',
          text: 'In one sentence: what does this chapter say?',
        },
      ],
    },
    review: {
      prompts: [
        {
          key: 'quick-review-carry',
          text: 'What verse or phrase will you carry with you today?',
        },
      ],
    },
  },
  trailOrder: ['context', 'language', 'scripture'],
  recommendationLimit: 3,
  panelWeights: {},
  synthesisTemplate: 'paragraph_plus_verse',
  reviewArtifact: 'memory_verse',
};
