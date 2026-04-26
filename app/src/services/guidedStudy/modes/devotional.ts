import type { ModeDefinition } from './types';

export const DEVOTIONAL_MODE: ModeDefinition = {
  key: 'devotional',
  label: 'Devotional',
  shortLabel: 'Devotional',
  estimatedMinutes: 12,
  blurb: 'Observe the text carefully before moving toward prayerful response.',
  marketingPromise: "A prayer in the chapter's own language.",
  steps: {
    scene: {
      prompts: [
        {
          key: 'devotional-scene-arrival',
          text: 'How did you arrive at this chapter today? What are you bringing with you?',
        },
      ],
    },
    observe: {
      prompts: [
        {
          key: 'devotional-observe-meeting',
          text: 'What word, phrase, or image is meeting you in this chapter?',
        },
      ],
      carryForward: ['scene'],
    },
    explore: {
      prompts: [
        {
          key: 'devotional-explore-deepen',
          text: "Which panel deepens what's meeting you?",
        },
      ],
    },
    synthesize: {
      prompts: [
        {
          key: 'devotional-synthesize-prayer',
          text: 'What might God be saying? Pray it back in your own words.',
        },
      ],
      carryForward: ['scene', 'observe'],
    },
    review: {
      prompts: [
        {
          key: 'devotional-review-carry',
          text: 'What will you carry into the rest of your day?',
        },
      ],
      carryForward: ['synthesize'],
    },
  },
  trailOrder: ['context', 'scripture', 'language'],
  recommendationLimit: 3,
  // Devotional — context + canonical echo + scholar reflection. Technical
  // panels actively pushed down so the experience stays receptive.
  panelWeights: {
    ctx: 10,
    cross: 9,
    com: 8,
    src: 7,
    hist: 6,
    lit: 3,
    trans: -1,
    heb: -3,
    greek: -3,
    tx: -3,
  },
  synthesisTemplate: 'prayer_and_carry',
  reviewArtifact: 'returning_prayer',
};
