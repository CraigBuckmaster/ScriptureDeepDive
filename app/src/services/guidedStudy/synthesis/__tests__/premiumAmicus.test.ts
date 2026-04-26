import { getMockUserDb, resetMockUserDb } from '../../../../../__tests__/helpers/mockUserDb';
import {
  __setAmicusStreamRunnerForTests,
  buildAmicusOutputBlocks,
  parseLabeledSections,
  parseModeArtifact,
  premiumAmicusStrategy,
} from '../premiumAmicusStrategy';
import type { CapturedInputs } from '../../capturedInputs';
import type { GuidedStudyMode, GuidedStudyPlan } from '../../types';

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
  };
}

const SAMPLE_CAPTURED: CapturedInputs = {
  scene: { audience: 'small group', setting: 'small group', arrival: 'tired' },
  observe: { primary: 'No condemnation.', main_point: 'Order from chaos.' },
};

describe('parseLabeledSections', () => {
  it('extracts each labelled section, trimming whitespace', () => {
    const text = `CLAIM: Paul argues that the Spirit completes what the law could not.

EVIDENCE: He cites the Spirit's witness in 8:14-16 and the suffering pattern of 8:18.

TENSION: How does present suffering square with declared adoption?`;
    const out = parseLabeledSections(text, ['CLAIM', 'EVIDENCE', 'TENSION']);
    expect(out.CLAIM).toMatch(/^Paul argues/);
    expect(out.EVIDENCE).toMatch(/^He cites/);
    expect(out.TENSION).toMatch(/^How does/);
  });

  it('tolerates numbered enumerators and markdown bold around the label', () => {
    const text = `1. **CLAIM** — Paul makes the central claim.

**2. EVIDENCE:** the cross-references show.`;
    const out = parseLabeledSections(text, ['CLAIM', 'EVIDENCE']);
    expect(out.CLAIM).toBe('Paul makes the central claim.');
    expect(out.EVIDENCE).toBe('the cross-references show.');
  });

  it('returns an empty record when no labels match', () => {
    expect(parseLabeledSections('Just some prose.', ['CLAIM'])).toEqual({});
  });
});

describe('parseModeArtifact', () => {
  it('quick — packs the entire takeaway and uses chapterRef as verseRef', () => {
    const text = 'A 60-word takeaway about Romans 8.\nVerse to carry: Rom 8:1.';
    const artifact = parseModeArtifact('quick', text, {}, 'Romans 8');
    expect(artifact).toEqual({
      type: 'memory_verse',
      verseRef: 'Romans 8',
      verseText: 'Verse to carry: Rom 8:1.',
      takeaway: text,
    });
  });

  it('deep — extracts CLAIM / EVIDENCE / TENSION from labelled output', () => {
    const text = `CLAIM: The Spirit completes what the law could not.

EVIDENCE: 8:14-16 (the Spirit's witness); 8:18 (suffering pattern).

TENSION: present suffering vs declared adoption.`;
    const artifact = parseModeArtifact('deep', text, {}, 'Romans 8');
    expect(artifact).toEqual({
      type: 'analytical_claim',
      claim: 'The Spirit completes what the law could not.',
      evidence: "8:14-16 (the Spirit's witness); 8:18 (suffering pattern).",
      tension: 'present suffering vs declared adoption.',
    });
  });

  it('deep — tension is null when missing from the response', () => {
    const text = 'CLAIM: A claim.\n\nEVIDENCE: An evidence point.';
    const artifact = parseModeArtifact('deep', text, {}, 'Romans 8') as Extract<
      ReturnType<typeof parseModeArtifact>,
      { type: 'analytical_claim' }
    >;
    expect(artifact.tension).toBeNull();
  });

  it('teaching — splits SUPPORTING MOVES into individual moves; pulls audience from captured', () => {
    const text = `HOOK: Open with the courtroom image.
MAIN POINT: No condemnation; full adoption.
SUPPORTING MOVES:
- Verse 1 — the verdict.
- Verses 14-16 — the Spirit's witness.
- Verse 31 — the inferential climax.
APPLICATION: Bring this into your week.
DISCUSSION QUESTION: Where does condemnation still echo for you?`;
    const artifact = parseModeArtifact(
      'teaching',
      text,
      SAMPLE_CAPTURED,
      'Romans 8',
    ) as Extract<ReturnType<typeof parseModeArtifact>, { type: 'teaching_outline' }>;
    expect(artifact.audience).toBe('small group');
    expect(artifact.mainPoint).toBe('No condemnation; full adoption.');
    expect(artifact.moves).toEqual([
      'Verse 1 — the verdict.',
      "Verses 14-16 — the Spirit's witness.",
      'Verse 31 — the inferential climax.',
    ]);
    expect(artifact.application).toBe('Bring this into your week.');
    expect(artifact.discussionQuestion).toBe('Where does condemnation still echo for you?');
  });

  it('devotional — pulls arrival + word/phrase from captured; PRAYER + CARRY-FORWARD from text', () => {
    const text = `WHAT GOD MAY BE SAYING: that even today, you are held.
PRAYER: lord, you walk with me through the valley.
CARRY-FORWARD: 'though I walk through the valley'`;
    const artifact = parseModeArtifact(
      'devotional',
      text,
      SAMPLE_CAPTURED,
      'Psalm 23',
    ) as Extract<ReturnType<typeof parseModeArtifact>, { type: 'returning_prayer' }>;
    expect(artifact.arrival).toBe('tired');
    expect(artifact.wordOrPhrase).toBe('No condemnation.');
    expect(artifact.prayer).toBe('lord, you walk with me through the valley.');
    expect(artifact.carryForward).toBe("'though I walk through the valley'");
  });
});

describe('buildAmicusOutputBlocks', () => {
  it('emits amicus_text + confirmation + view_my_study CTA', () => {
    const blocks = buildAmicusOutputBlocks('Some draft.', {
      type: 'memory_verse',
      verseRef: 'Romans 8',
      verseText: '',
      takeaway: 'Some draft.',
    });
    expect(blocks.map((b) => b.type)).toEqual([
      'amicus_text',
      'confirmation',
      'cta_button',
    ]);
    const cta = blocks.find((b) => b.type === 'cta_button');
    expect(cta && cta.type === 'cta_button' && cta.action).toBe('view_my_study');
  });

  it('omits amicus_text when the response was empty', () => {
    const blocks = buildAmicusOutputBlocks('   ', {
      type: 'memory_verse',
      verseRef: 'Romans 8',
      verseText: '',
      takeaway: '',
    });
    expect(blocks.map((b) => b.type)).toEqual(['confirmation', 'cta_button']);
  });
});

describe('premiumAmicusStrategy.run — happy path with mocked stream', () => {
  it('reports kind=premium_amicus + persists artifact + replaces review rows', async () => {
    const fakeText = 'CLAIM: A.\n\nEVIDENCE: B.\n\nTENSION: C.';
    __setAmicusStreamRunnerForTests({
      async run({ callbacks }) {
        callbacks?.onAmicusDelta?.(fakeText);
        callbacks?.onAmicusComplete?.();
        return fakeText;
      },
    });

    const result = await premiumAmicusStrategy.run({
      plan: planFor('deep'),
      captured: SAMPLE_CAPTURED,
      sessionId: 42,
      bookId: 'rom',
      chapterNum: 8,
    });

    expect(result.kind).toBe('premium_amicus');
    expect(result.artifact).toEqual({
      type: 'analytical_claim',
      claim: 'A.',
      evidence: 'B.',
      tension: 'C.',
    });

    const sql = getMockUserDb()
      .runAsync.mock.calls.map((c) => (typeof c[0] === 'string' ? c[0] : ''))
      .join('\n');
    expect(sql).toContain('SET mode_artifact_json');
    expect(sql).toContain('SET synthesis_strategy');
    expect(sql).toContain('DELETE FROM guided_review_items');
    expect(sql).toContain('INSERT INTO guided_review_items');
  });

  it('forwards onAmicusDelta to the caller as tokens arrive', async () => {
    const tokens: string[] = [];
    __setAmicusStreamRunnerForTests({
      async run({ callbacks }) {
        for (const t of ['Hello, ', 'world', '!']) {
          callbacks?.onAmicusDelta?.(t);
        }
        callbacks?.onAmicusComplete?.();
        return 'Hello, world!';
      },
    });
    await premiumAmicusStrategy.run(
      {
        plan: planFor('quick'),
        captured: {},
        sessionId: 1,
        bookId: 'gen',
        chapterNum: 1,
      },
      { onAmicusDelta: (t) => tokens.push(t) },
    );
    expect(tokens.join('')).toBe('Hello, world!');
  });

  it('rejects when the stream errors and does not write to the DB', async () => {
    __setAmicusStreamRunnerForTests({
      async run() {
        throw new Error('network down');
      },
    });
    await expect(
      premiumAmicusStrategy.run({
        plan: planFor('quick'),
        captured: SAMPLE_CAPTURED,
        sessionId: 42,
        bookId: 'rom',
        chapterNum: 8,
      }),
    ).rejects.toThrow(/network down/);
    expect(getMockUserDb().runAsync).not.toHaveBeenCalled();
  });

  it('runs without DB writes when sessionId is null', async () => {
    __setAmicusStreamRunnerForTests({
      async run() {
        return 'Just a draft.';
      },
    });
    const result = await premiumAmicusStrategy.run({
      plan: planFor('quick'),
      captured: {},
      sessionId: null,
      bookId: 'gen',
      chapterNum: 1,
    });
    expect(result.kind).toBe('premium_amicus');
    expect(getMockUserDb().runAsync).not.toHaveBeenCalled();
  });
});
