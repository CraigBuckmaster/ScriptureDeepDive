import type { ModeDefinition } from './types';

export const DEEP_MODE: ModeDefinition = {
  key: 'deep',
  label: 'Deep study',
  shortLabel: 'Deep',
  estimatedMinutes: 25,
  blurb: 'A fuller trail through context, language, Scripture, and debate.',
  marketingPromise: 'A structured analysis you can reason from.',
  steps: {
    scene: {
      prompts: [
        {
          key: 'deep-scene-tensions',
          text: "What tensions or movements do you expect from this genre and this chapter's place in the book?",
        },
      ],
    },
    observe: {
      prompts: [
        { key: 'deep-observe-surprise', text: 'What surprises you in this chapter?' },
        {
          key: 'deep-observe-confusion',
          text: 'What confuses you or feels unresolved?',
        },
        {
          key: 'deep-observe-repetition',
          text: 'What words, phrases, or ideas seem to repeat?',
        },
      ],
    },
    explore: {
      prompts: [
        {
          key: 'deep-explore-evidence',
          text: 'Which panels speak to what you noticed above?',
        },
      ],
    },
    synthesize: {
      prompts: [
        {
          key: 'deep-synthesize-claim',
          text: "State your claim. What's the evidence? What tension remains?",
        },
      ],
    },
    review: {
      prompts: [
        {
          key: 'deep-review-connection',
          text: 'Which connection is worth carrying into your next study?',
        },
      ],
    },
  },
  trailOrder: ['context', 'language', 'scripture', 'debate'],
  recommendationLimit: 5,
  // Deep — structure + language + debate lead, context still strong.
  panelWeights: {
    heb: 10,
    greek: 10,
    lit: 9,
    discourse: 9,
    tx: 7,
    debate: 6,
    hist: 5,
    ctx: 5,
    cross: 4,
    trans: 3,
    com: 2,
  },
  synthesisTemplate: 'claim_evidence_tension',
  reviewArtifact: 'analytical_claim',
};
