import { getMockUserDb, resetMockUserDb } from '../../../../../__tests__/helpers/mockUserDb';
import { premiumStructuredStrategy, buildPremiumStructuredBlocks } from '../premiumStructuredStrategy';
import type { CapturedInputs } from '../../capturedInputs';
import type { GuidedStudyMode, GuidedStudyPlan } from '../../types';

jest.mock('@/db/userDatabase', () =>
  require('../../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

beforeEach(() => {
  resetMockUserDb();
});

function planFor(mode: GuidedStudyMode): GuidedStudyPlan {
  return {
    chapterId: 'rom_8',
    title: 'Romans 8',
    mode,
    modeLabel: 'Mode',
    sceneRows: [],
    stepPrompts: { scene: [], observe: [], explore: [], synthesize: [], review: [] },
    legacyPrompts: [],
    recommendations: [],
    evidenceTrail: [],
    betterQuestionPrompt: '',
    conceptChips: [],
    observationChips: [],
  };
}

describe('premiumStructuredStrategy.run', () => {
  const captured: CapturedInputs = {
    synthesize: { takeaway: 'No condemnation.', key_connection: 'Rom 8:1', open_question: '' },
  };

  it('reports kind=premium_structured + returns the typed artifact', async () => {
    const result = await premiumStructuredStrategy.run({
      plan: planFor('quick'),
      captured,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    expect(result.kind).toBe('premium_structured');
    expect(result.artifact).toEqual({
      type: 'memory_verse',
      verseRef: 'Romans 8',
      verseText: 'Rom 8:1',
      takeaway: 'No condemnation.',
    });
  });

  it('persists mode_artifact_json + synthesis_strategy + review rows on the session', async () => {
    await premiumStructuredStrategy.run({
      plan: planFor('quick'),
      captured,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    const calls = getMockUserDb().runAsync.mock.calls;
    const sql = calls.map((c) => (typeof c[0] === 'string' ? c[0] : '')).join('\n');
    expect(sql).toContain('SET mode_artifact_json');
    expect(sql).toContain('SET synthesis_strategy');
    // Idempotent review-queue replace deletes existing rows first
    expect(sql).toContain('DELETE FROM guided_review_items WHERE source_session_id');
    // ...then inserts new rows for the artifact
    expect(sql).toContain('INSERT INTO guided_review_items');
  });

  it('does not touch the database when sessionId is null (no persistence yet)', async () => {
    await premiumStructuredStrategy.run({
      plan: planFor('quick'),
      captured,
      sessionId: null,
      bookId: 'rom',
      chapterNum: 8,
    });
    expect(getMockUserDb().runAsync).not.toHaveBeenCalled();
  });

  it('emits recap_section blocks + confirmation + view_my_study CTA (no upgrade footer)', async () => {
    const result = await premiumStructuredStrategy.run({
      plan: planFor('quick'),
      captured,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    const types = result.output.map((b) => b.type);
    expect(types).toEqual([
      'recap_section',
      'recap_section',
      'confirmation',
      'cta_button',
    ]);
    expect(types).not.toContain('footer_note');
    const cta = result.output.find((b) => b.type === 'cta_button');
    expect(cta && cta.type === 'cta_button' && cta.action).toBe('view_my_study');
  });

  it('returns empty output when nothing is captured (renderer hides the card)', () => {
    expect(buildPremiumStructuredBlocks('quick', {})).toEqual([]);
  });
});

describe('premiumStructured idempotency on re-run', () => {
  const captured: CapturedInputs = {
    synthesize: { takeaway: 'A.', key_connection: 'B.', open_question: 'C.' },
  };

  it('a second run on the same session DELETEs prior review-queue rows before re-inserting', async () => {
    await premiumStructuredStrategy.run({
      plan: planFor('deep'),
      captured,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    const firstCalls = getMockUserDb().runAsync.mock.calls.length;

    await premiumStructuredStrategy.run({
      plan: planFor('deep'),
      captured,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    const secondCalls = getMockUserDb().runAsync.mock.calls.length;
    // Two runs => two DELETEs (one per run, replacing the prior rows)
    const deleteCalls = getMockUserDb().runAsync.mock.calls.filter((c) =>
      typeof c[0] === 'string' && c[0].startsWith('DELETE FROM guided_review_items'),
    );
    expect(deleteCalls).toHaveLength(2);
    expect(secondCalls).toBeGreaterThan(firstCalls);
  });
});
