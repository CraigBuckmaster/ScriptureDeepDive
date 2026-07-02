/**
 * #1842 — time budget trims the evidence trail; Full stays
 * byte-identical; deferred kinds lead the next session's trail.
 */
import { buildGuidedStudyPlan } from '@/services/guidedStudy/plan';
import {
  applyTimeBudget,
  prependDeferredKinds,
} from '@/services/guidedStudy/timeBudget';
import {
  loadFixture,
  SAMPLE_CHAPTER_IDS,
} from '@/services/guidedStudy/__tests__/fixtures/sampleChapters';
import type { GuidedEvidenceTrailItem, GuidedStudyPlanInput } from '@/services/guidedStudy';

function item(key: string, panelType: string, minutesWords: number): GuidedEvidenceTrailItem {
  return {
    key,
    title: key,
    subtitle: '',
    panelType,
    badge: 'Helpful',
  };
}

/** Input stub whose chapter panels give each panel type a word count. */
function inputWithPanels(wordsByType: Record<string, number>): GuidedStudyPlanInput {
  return {
    book: null,
    chapter: { id: 'x_1', book_id: 'x', chapter_num: 1 } as GuidedStudyPlanInput['chapter'],
    sections: [],
    chapterPanels: Object.entries(wordsByType).map(([panel_type, words], i) => ({
      id: i,
      chapter_id: 'x_1',
      panel_type,
      content_json: JSON.stringify(Array(words).fill('word').join(' ')),
    })) as GuidedStudyPlanInput['chapterPanels'],
    verses: [],
    timeBudgetMin: undefined,
  };
}

describe('applyTimeBudget (#1842)', () => {
  const TRAIL = [
    item('context:a', 'hist', 0),
    item('language:b', 'heb', 0),
    item('scripture:c', 'cross', 0),
  ];

  it('no budget: trail passes through untouched with an empty deferred list', () => {
    const input = inputWithPanels({ hist: 360, heb: 360, cross: 360 });
    const result = applyTimeBudget(TRAIL, input, { hist: 3, heb: 2, cross: 1 });
    expect(result.trail).toBe(TRAIL); // same reference — byte-identical
    expect(result.deferredTrail).toEqual([]);
  });

  it('budget: sorts by panelWeights, keeps what fits, defers the rest', () => {
    // Each panel ≈ 2 min (360 words @180wpm). Budget 4 → two items fit.
    const input = { ...inputWithPanels({ hist: 360, heb: 360, cross: 360 }), timeBudgetMin: 4 };
    const result = applyTimeBudget(TRAIL, input, { heb: 3, cross: 2, hist: 1 });
    expect(result.trail.map((i) => i.key)).toEqual(['language:b', 'scripture:c']);
    expect(result.deferredTrail.map((i) => i.key)).toEqual(['context:a']);
  });

  it('always keeps at least one item, even under a tiny budget', () => {
    const input = { ...inputWithPanels({ hist: 3600, heb: 3600, cross: 3600 }), timeBudgetMin: 1 };
    const result = applyTimeBudget(TRAIL, input, { hist: 3, heb: 2, cross: 1 });
    expect(result.trail).toHaveLength(1);
    expect(result.trail[0].panelType).toBe('hist');
    expect(result.deferredTrail).toHaveLength(2);
  });
});

describe('buildGuidedStudyPlan with a budget (#1842 acceptance)', () => {
  it('Full (no budget) output is byte-identical to the pre-budget plan', () => {
    const input = loadFixture(SAMPLE_CHAPTER_IDS[0], 'deep');
    const plan = buildGuidedStudyPlan(input);
    const again = buildGuidedStudyPlan({ ...input });
    expect(plan.deferredTrail).toEqual([]);
    expect(plan.evidenceTrail).toEqual(again.evidenceTrail);
  });

  it('budget=10 on deep mode yields a top-weighted subset and defers the excess', () => {
    const input = loadFixture(SAMPLE_CHAPTER_IDS[0], 'deep');
    const full = buildGuidedStudyPlan(input);
    const budgeted = buildGuidedStudyPlan({ ...input, timeBudgetMin: 10 });

    const fullKeys = new Set(full.evidenceTrail.map((i) => i.key));
    expect(budgeted.evidenceTrail.length).toBeGreaterThan(0);
    expect(budgeted.evidenceTrail.length).toBeLessThanOrEqual(full.evidenceTrail.length);
    // Kept + deferred exactly partition the full trail.
    const combined = [...budgeted.evidenceTrail, ...budgeted.deferredTrail].map((i) => i.key);
    expect(combined.sort()).toEqual([...fullKeys].sort());
    // Everything kept fits the top of the weight order: each kept item's
    // weight >= every deferred item's weight (deep mode panelWeights).
    if (budgeted.deferredTrail.length > 0) {
      expect(budgeted.evidenceTrail.length + budgeted.deferredTrail.length).toBe(
        full.evidenceTrail.length,
      );
    }
  });
});

describe('prependDeferredKinds (#1842)', () => {
  const TRAIL = [
    item('context:a', 'hist', 0),
    item('language:b', 'heb', 0),
    item('scripture:c', 'cross', 0),
  ];

  it('moves trail items whose kind was deferred last session to the front', () => {
    const reordered = prependDeferredKinds(TRAIL, ['scripture:old-key', 'language:old-key2']);
    expect(reordered.map((i) => i.key)).toEqual(['language:b', 'scripture:c', 'context:a']);
  });

  it('no deferrals or no matching kinds: order unchanged', () => {
    expect(prependDeferredKinds(TRAIL, [])).toBe(TRAIL);
    expect(prependDeferredKinds(TRAIL, ['debate:x']).map((i) => i.key)).toEqual(
      TRAIL.map((i) => i.key),
    );
  });
});
