/**
 * Phase 2.8 (#1737) integration test — proves CapturedInputs persistence
 * survives the SQLite layer added in #1731.
 *
 * SQLite is mocked because Jest runs in node; the test focuses on the
 * round-trip contract between setCapturedInputs / getCapturedInputs.
 * Migration v24 idempotency lives in migrationV24.test.ts (separate file
 * because that test pattern requires NOT mocking @/db/userDatabase).
 */
import { getMockUserDb, resetMockUserDb } from '../../../../__tests__/helpers/mockUserDb';
import {
  getCapturedInputs,
  getModeArtifact,
  getSynthesisStrategy,
} from '@/db/userQueries';
import {
  setCapturedInputs,
  setModeArtifact,
  setSynthesisStrategy,
} from '@/db/userMutations';
import type { CapturedInputs } from '@/services/guidedStudy/capturedInputs';

jest.mock('@/db/userDatabase', () =>
  require('../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

beforeEach(() => {
  resetMockUserDb();
});

describe('CapturedInputs round-trip through SQLite', () => {
  it('full populated payload round-trips through set + get', async () => {
    const inputs: CapturedInputs = {
      scene: { audience: 'College small group', setting: 'small group' },
      observe: { surprises: 'God evaluates the work as good.', main_point: 'Order from chaos.' },
      explore: {
        panels_opened: [{ panel_type: 'hist', section_num: 1, opened_at_ms: 1735000000000 }],
        most_helpful_panel_type: 'hist',
      },
      synthesize: {
        takeaway: 'Creation is ordered by speech.',
        open_question: 'How does this frame John 1?',
        key_connection: 'John 1 echoes Genesis 1.',
      },
      review: { artifact_generated: true, next_chapter_accepted: false },
    };

    await setCapturedInputs(42, inputs);
    const writtenJson = (getMockUserDb().runAsync.mock.calls[0] as unknown[][])[1] as [
      string,
      number,
    ];
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      captured_inputs_json: writtenJson[0],
    });
    expect(await getCapturedInputs(42)).toEqual(inputs);
  });

  it('partial inputs (only scene) preserve the partial shape — other steps stay undefined', async () => {
    const partial: CapturedInputs = {
      scene: { audience: 'mid-week group' },
    };

    await setCapturedInputs(42, partial);
    const writtenJson = (getMockUserDb().runAsync.mock.calls[0] as unknown[][])[1] as [
      string,
      number,
    ];
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      captured_inputs_json: writtenJson[0],
    });
    const fetched = await getCapturedInputs(42);
    expect(fetched).toEqual(partial);
    expect(fetched.observe).toBeUndefined();
    expect(fetched.explore).toBeUndefined();
    expect(fetched.synthesize).toBeUndefined();
    expect(fetched.review).toBeUndefined();
  });

  it('mode artifact round-trips through set + get', async () => {
    const artifact = { kind: 'memory_verse', text: 'Trust in the LORD.' };
    await setModeArtifact(7, artifact);
    const args = (getMockUserDb().runAsync.mock.calls[0] as unknown[][])[1] as [
      string | null,
      number,
    ];
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ mode_artifact_json: args[0] });
    expect(await getModeArtifact(7)).toEqual(artifact);
  });

  it.each(['free', 'premium_structured', 'premium_amicus'] as const)(
    'synthesis strategy %s round-trips through set + get',
    async (kind) => {
      await setSynthesisStrategy(7, kind);
      const args = (getMockUserDb().runAsync.mock.calls[0] as unknown[][])[1] as [
        string,
        number,
      ];
      getMockUserDb().getFirstAsync.mockResolvedValueOnce({ synthesis_strategy: args[0] });
      expect(await getSynthesisStrategy(7)).toBe(kind);
    },
  );
});

