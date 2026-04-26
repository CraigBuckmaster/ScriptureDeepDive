import type { ModeDefinition } from './types';

export const TEACHING_MODE: ModeDefinition = {
  key: 'teaching',
  label: 'Teaching prep',
  shortLabel: 'Teaching',
  estimatedMinutes: 25,
  blurb: 'Structure, claims, and what someone else will need clarified.',
  marketingPromise: 'An outline you can teach from confidently.',
  steps: {
    scene: {
      prompts: [
        {
          key: 'teaching-scene-audience',
          text: 'Who are you teaching? What do they already know about this passage?',
        },
        {
          key: 'teaching-scene-setting',
          text: "What's the setting — sermon, small group, classroom, one-on-one?",
        },
      ],
    },
    observe: {
      prompts: [
        {
          key: 'teaching-observe-main-point',
          text: "What's the main point you'd want a listener to leave with?",
        },
        {
          key: 'teaching-observe-misread',
          text: "What would they get wrong if you didn't clarify it?",
        },
      ],
    },
    explore: {
      prompts: [
        {
          key: 'teaching-explore-supports',
          text: 'Which structural and contextual panels support your main point?',
        },
      ],
    },
    synthesize: {
      prompts: [
        {
          key: 'teaching-synthesize-outline',
          text: 'Build the outline: hook, main point, two or three moves, application, a clarifying question for discussion.',
        },
      ],
    },
    review: {
      prompts: [
        {
          key: 'teaching-review-check',
          text: "What's one question you'll ask your audience to check understanding?",
        },
      ],
    },
  },
  trailOrder: ['context', 'structure', 'scripture', 'debate'],
  recommendationLimit: 5,
  // Teaching — structure leads (you teach a shape), debate for fairness.
  panelWeights: {
    lit: 10,
    discourse: 9,
    hist: 8,
    ctx: 8,
    cross: 7,
    debate: 6,
    com: 5,
    src: 5,
    heb: 4,
    greek: 4,
    trans: 4,
  },
  synthesisTemplate: 'teaching_outline',
  reviewArtifact: 'teaching_outline',
};
