/**
 * Phase 4.5 (#1748) — end-to-end integration tests for the
 * premium_amicus path. Uses the swappable runner override so the suite
 * exercises real prompt construction + parser behaviour without
 * touching the network.
 */
import { getMockUserDb, resetMockUserDb } from '../../../../../__tests__/helpers/mockUserDb';
import {
  __setAmicusStreamRunnerForTests,
  premiumAmicusStrategy,
} from '../premiumAmicusStrategy';
import { chooseStrategy } from '../strategy';
import { freeStrategy } from '../freeStrategy';
import { premiumStructuredStrategy } from '../premiumStructuredStrategy';
import { buildGuidedStudySystemPrompt } from '../../../amicus/prompts/guidedStudy';
import type { CapturedInputs } from '../../capturedInputs';
import type { GuidedStudyMode, GuidedStudyPlan } from '../../types';
import type { CitationRef } from '../strategy';

jest.mock('@/db/userDatabase', () =>
  require('../../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

beforeEach(() => {
  resetMockUserDb();
  __setAmicusStreamRunnerForTests(null);
});

afterAll(() => {
  __setAmicusStreamRunnerForTests(null);
});

function planFor(mode: GuidedStudyMode, title = 'Romans 8'): GuidedStudyPlan {
  return {
    chapterId: 'rom_8',
    title,
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
    deferredTrail: [],
  };
}

const MODE_FAKE_RESPONSES: Record<GuidedStudyMode, string> = {
  quick: 'A 60-word takeaway about the chapter.\nVerse to carry: Rom 8:1.',
  deep: `CLAIM: Paul argues no condemnation.

EVIDENCE: 8:1, the Spirit's witness in 8:14-16.

TENSION: present suffering vs declared adoption.`,
  teaching: `HOOK: courtroom imagery.
MAIN POINT: No condemnation; full adoption.
SUPPORTING MOVES:
- Verse 1.
- Verses 14-16.
APPLICATION: bring this into your week.
DISCUSSION QUESTION: where does condemnation still echo for you?`,
  devotional: `WHAT GOD MAY BE SAYING: that even today, you are held.
PRAYER: lord, you walk with me.
CARRY-FORWARD: 'no condemnation'`,
};

const MODE_EXPECTED_TYPES: Record<GuidedStudyMode, string> = {
  quick: 'memory_verse',
  deep: 'analytical_claim',
  teaching: 'teaching_outline',
  devotional: 'returning_prayer',
};

describe('premium_amicus end-to-end per mode', () => {
  it.each<GuidedStudyMode>(['quick', 'deep', 'teaching', 'devotional'])(
    '%s: prompt builds, runner streams, parser produces the right artifact shape',
    async (mode) => {
      // Capture the system prompt the strategy hands to the runner.
      let receivedPrompt = '';
      __setAmicusStreamRunnerForTests({
        async run(args) {
          receivedPrompt = args.systemPrompt;
          args.callbacks?.onAmicusDelta?.(MODE_FAKE_RESPONSES[mode]);
          args.callbacks?.onAmicusComplete?.();
          return MODE_FAKE_RESPONSES[mode];
        },
      });

      const captured: CapturedInputs = {
        scene: { audience: 'small group', setting: 'small group', arrival: 'tired' },
        observe: { primary: 'meeting word', main_point: 'No condemnation.' },
      };

      const result = await premiumAmicusStrategy.run({
        plan: planFor(mode),
        captured,
        sessionId: 42,
        bookId: 'rom',
        chapterNum: 8,
      });

      // Prompt is the same one the prompts module produces — proves the
      // strategy doesn't drift from #1744.
      expect(receivedPrompt).toBe(
        buildGuidedStudySystemPrompt({
          mode,
          chapterRef: 'Romans 8',
          captured,
          panelsOpened: [],
          modeSpecificContext:
            mode === 'teaching'
              ? { audience: 'small group', setting: 'small group' }
              : mode === 'devotional'
                ? { arrival: 'tired' }
                : {},
        }),
      );

      // Artifact is the right discriminated shape.
      expect(result.artifact?.type).toBe(MODE_EXPECTED_TYPES[mode]);
      expect(result.kind).toBe('premium_amicus');
    },
  );
});

describe('cap fallback at the chooseStrategy gate', () => {
  it('isPremium + flag on + canUse=false → premium_structured (NOT premium_amicus)', () => {
    const strategy = chooseStrategy({
      isPremium: true,
      amicusFlagEnabled: true,
      amicusCanUse: false,
    });
    expect(strategy).toBe(premiumStructuredStrategy);
    expect(strategy).not.toBe(premiumAmicusStrategy);
  });

  it('isPremium + flag on + canUse=true → premium_amicus', () => {
    expect(
      chooseStrategy({ isPremium: true, amicusFlagEnabled: true, amicusCanUse: true }),
    ).toBe(premiumAmicusStrategy);
  });

  it('non-premium short-circuits to free regardless of flag/cap', () => {
    expect(
      chooseStrategy({ isPremium: false, amicusFlagEnabled: true, amicusCanUse: true }),
    ).toBe(freeStrategy);
  });
});

describe('cancellation mid-stream', () => {
  it('rejects without persisting when ctx.abortSignal aborts before the stream resolves', async () => {
    const controller = new AbortController();
    __setAmicusStreamRunnerForTests({
      async run({ abortSignal }) {
        // Simulate the runner respecting the caller's abort signal.
        await new Promise<void>((_resolve, reject) => {
          if (abortSignal?.aborted) return reject(new Error('aborted'));
          abortSignal?.addEventListener('abort', () => reject(new Error('aborted')));
        });
        return 'should not happen';
      },
    });

    const promise = premiumAmicusStrategy.run({
      plan: planFor('deep'),
      captured: {},
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
      abortSignal: controller.signal,
    });
    controller.abort();
    await expect(promise).rejects.toThrow();

    // No persistence calls landed.
    expect(getMockUserDb().runAsync).not.toHaveBeenCalled();
  });

  it('rejects with the canonical aborted error when abort fires after stream resolution', async () => {
    const controller = new AbortController();
    __setAmicusStreamRunnerForTests({
      async run() {
        controller.abort();
        return 'CLAIM: A.';
      },
    });
    await expect(
      premiumAmicusStrategy.run({
        plan: planFor('deep'),
        captured: {},
        sessionId: 42,
        bookId: 'rom',
        chapterNum: 8,
        abortSignal: controller.signal,
      }),
    ).rejects.toThrow(/aborted/);
    // No persistence after the abort check.
    expect(getMockUserDb().runAsync).not.toHaveBeenCalled();
  });
});

describe('citation parsing into the amicus_text block', () => {
  it('citations forwarded by the runner land on the amicus_text output block', async () => {
    const expectedCitations: CitationRef[] = [
      { panelType: 'panel', snippet: 'Romans 8 — historical context' },
      { panelType: 'panel', snippet: 'Romans 8 — cross references' },
    ];
    __setAmicusStreamRunnerForTests({
      async run({ callbacks, onCitation }) {
        callbacks?.onAmicusDelta?.('CLAIM: A.\n\nEVIDENCE: B.');
        for (const c of expectedCitations) onCitation?.(c);
        callbacks?.onAmicusComplete?.();
        return 'CLAIM: A.\n\nEVIDENCE: B.';
      },
    });
    const result = await premiumAmicusStrategy.run({
      plan: planFor('deep'),
      captured: {},
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });
    const amicusBlock = result.output.find((b) => b.type === 'amicus_text');
    expect(amicusBlock).toBeTruthy();
    if (amicusBlock && amicusBlock.type === 'amicus_text') {
      expect(amicusBlock.citations).toEqual(expectedCitations);
    }
  });
});
