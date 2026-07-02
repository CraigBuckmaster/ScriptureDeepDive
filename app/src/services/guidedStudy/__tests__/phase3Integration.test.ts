/**
 * Phase 3.6 (#1743) — Phase 3 integration tests.
 *
 * Walks the same end-to-end surfaces a session would touch in production
 * (synthesis strategy + spaced review queue + soft upgrade nudge) but
 * against the mock-SQLite layer used elsewhere in the suite.
 */
import { getMockUserDb, resetMockUserDb } from '../../../../__tests__/helpers/mockUserDb';
import { freeStrategy } from '../synthesis/freeStrategy';
import { premiumStructuredStrategy } from '../synthesis/premiumStructuredStrategy';
import { shouldShowSoftPrompt } from '../softPrompt';
import type { CapturedInputs } from '../capturedInputs';
import type { GuidedStudyMode, GuidedStudyPlan } from '../types';

jest.mock('@/db/userDatabase', () =>
  require('../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
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

const SAMPLE_CAPTURED: CapturedInputs = {
  synthesize: { takeaway: 'No condemnation.', key_connection: 'Rom 8:1', open_question: 'How?' },
};

function sqlFromRunCalls(): string {
  return getMockUserDb()
    .runAsync.mock.calls.map((c) => (typeof c[0] === 'string' ? c[0] : ''))
    .join('\n');
}

describe('Free user — completes session, no review-queue persistence', () => {
  it('freeStrategy.run touches no DB, returns artifact=null', async () => {
    const result = await freeStrategy.run({
      plan: planFor('quick'),
      captured: SAMPLE_CAPTURED,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    expect(result.artifact).toBeNull();
    expect(getMockUserDb().runAsync).not.toHaveBeenCalled();
    // No INSERT into guided_review_items either
    expect(sqlFromRunCalls()).not.toContain('guided_review_items');
  });
});

describe('Premium user (flag off) — completes session, queue row written with artifact JSON', () => {
  it('premiumStructured.run writes mode_artifact_json + an INSERT into guided_review_items', async () => {
    const result = await premiumStructuredStrategy.run({
      plan: planFor('quick'),
      captured: SAMPLE_CAPTURED,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    const sql = sqlFromRunCalls();

    // Artifact persisted on the session
    expect(sql).toContain('SET mode_artifact_json');
    // Session-level strategy marker recorded
    expect(sql).toContain('SET synthesis_strategy');
    // Review queue actually populated
    expect(sql).toContain('INSERT INTO guided_review_items');

    // The exact JSON payload that landed in mode_artifact_json should be
    // the typed artifact returned by run(). Find that runAsync call and
    // assert the args contain the serialised artifact.
    const artifactCall = getMockUserDb().runAsync.mock.calls.find(
      (c) => typeof c[0] === 'string' && c[0].includes('mode_artifact_json'),
    );
    expect(artifactCall).toBeTruthy();
    const args = (artifactCall as unknown[][])?.[1] as [string | null, number];
    expect(args[0]).toBe(JSON.stringify(result.artifact));
  });
});

describe('Premium re-runs — existing rows are replaced, not duplicated', () => {
  it('a second run on the same sessionId fires a DELETE before re-INSERTing', async () => {
    await premiumStructuredStrategy.run({
      plan: planFor('deep'),
      captured: SAMPLE_CAPTURED,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    await premiumStructuredStrategy.run({
      plan: planFor('deep'),
      captured: SAMPLE_CAPTURED,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    const deletes = getMockUserDb().runAsync.mock.calls.filter(
      (c) => typeof c[0] === 'string' && c[0].startsWith('DELETE FROM guided_review_items'),
    );
    expect(deletes).toHaveLength(2);
  });
});

describe('Soft "after 3 sessions" prompt timing', () => {
  it('fires for a free user with exactly 3 completed sessions (none seen yet)', async () => {
    getMockUserDb().getFirstAsync
      .mockResolvedValueOnce(null) // softPromptSeen.companionPartner unset
      .mockResolvedValueOnce({ count: 3 });
    expect(await shouldShowSoftPrompt({ isPremium: false })).toBe(true);
  });

  it('does NOT fire on the 4th completion if the prompt has already been seen', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ value: '1' }); // seen
    expect(await shouldShowSoftPrompt({ isPremium: false })).toBe(false);
  });

  it('does not fire for premium users regardless of count', async () => {
    expect(await shouldShowSoftPrompt({ isPremium: true })).toBe(false);
    expect(getMockUserDb().getFirstAsync).not.toHaveBeenCalled();
  });
});
