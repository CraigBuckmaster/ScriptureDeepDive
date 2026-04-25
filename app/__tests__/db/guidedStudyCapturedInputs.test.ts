/**
 * Phase 2.2 (#1731) DB-helper tests for the captured_inputs_json /
 * mode_artifact_json / synthesis_strategy columns appended in migration
 * v24. Verifies that pre-migration rows (NULL in the new columns) round
 * trip safely through the readers.
 */
import { getMockUserDb, resetMockUserDb } from '../helpers/mockUserDb';
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
  require('../helpers/mockUserDb').mockUserDatabaseModule(),
);

beforeEach(() => {
  resetMockUserDb();
});

describe('getCapturedInputs', () => {
  it('returns empty when the session row has NULL in the column (pre-migration shape)', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ captured_inputs_json: null });
    expect(await getCapturedInputs(42)).toEqual({});
  });

  it('returns empty when the session row is missing entirely', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce(null);
    expect(await getCapturedInputs(42)).toEqual({});
  });

  it('parses a populated captured_inputs_json column', async () => {
    const inputs: CapturedInputs = { observe: { primary: 'shepherd' } };
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      captured_inputs_json: JSON.stringify(inputs),
    });
    expect(await getCapturedInputs(42)).toEqual(inputs);
  });
});

describe('setCapturedInputs', () => {
  it('serializes inputs and updates the session row', async () => {
    const inputs: CapturedInputs = { synthesize: { takeaway: 'a', open_question: '', key_connection: '' } };
    await setCapturedInputs(7, inputs);
    expect(getMockUserDb().runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE guided_study_sessions'),
      [JSON.stringify(inputs), 7],
    );
  });
});

describe('getModeArtifact', () => {
  it('returns null when the column is NULL', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ mode_artifact_json: null });
    expect(await getModeArtifact(42)).toBeNull();
  });

  it('parses a populated artifact column', async () => {
    const artifact = { kind: 'memory_verse', text: 'Trust in the LORD' };
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      mode_artifact_json: JSON.stringify(artifact),
    });
    expect(await getModeArtifact(42)).toEqual(artifact);
  });

  it('returns null on parse error', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ mode_artifact_json: '{not json' });
    expect(await getModeArtifact(42)).toBeNull();
  });
});

describe('setModeArtifact', () => {
  it('JSON-stringifies an artifact', async () => {
    const artifact = { kind: 'memory_verse' };
    await setModeArtifact(7, artifact);
    expect(getMockUserDb().runAsync).toHaveBeenCalledWith(
      expect.stringContaining('mode_artifact_json'),
      [JSON.stringify(artifact), 7],
    );
  });

  it('writes NULL when the artifact is null', async () => {
    await setModeArtifact(7, null);
    expect(getMockUserDb().runAsync).toHaveBeenCalledWith(
      expect.stringContaining('mode_artifact_json'),
      [null, 7],
    );
  });
});

describe('getSynthesisStrategy', () => {
  it('returns null when the column is NULL', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ synthesis_strategy: null });
    expect(await getSynthesisStrategy(42)).toBeNull();
  });

  it.each(['free', 'premium_structured', 'premium_amicus'] as const)(
    'returns %s when the column carries the canonical value',
    async (kind) => {
      getMockUserDb().getFirstAsync.mockResolvedValueOnce({ synthesis_strategy: kind });
      expect(await getSynthesisStrategy(42)).toBe(kind);
    },
  );

  it('returns null for an unknown strategy value (defensive against schema drift)', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ synthesis_strategy: 'garbage' });
    expect(await getSynthesisStrategy(42)).toBeNull();
  });
});

describe('setSynthesisStrategy', () => {
  it('writes the kind to the session row', async () => {
    await setSynthesisStrategy(7, 'premium_amicus');
    expect(getMockUserDb().runAsync).toHaveBeenCalledWith(
      expect.stringContaining('synthesis_strategy'),
      ['premium_amicus', 7],
    );
  });
});
