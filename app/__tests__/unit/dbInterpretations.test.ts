/**
 * Database layer tests for db/content/interpretations.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getAllEras,
  getInterpretationsForVerse,
  getInterpretationsForChapter,
  getInterpretationsByEra,
  getInterpretation,
} from '@/db/content/interpretations';

beforeEach(() => resetMockDb());

describe('getAllEras', () => {
  it('returns eras ordered by display_order', async () => {
    const eras = [
      { id: 'patristic', name: 'Patristic', display_order: 1 },
      { id: 'medieval', name: 'Medieval', display_order: 2 },
    ];
    getMockDb().getAllAsync.mockResolvedValue(eras);
    const result = await getAllEras();
    expect(result).toEqual(eras);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('interpretation_eras ORDER BY display_order'),
    );
  });
});

describe('getInterpretationsForVerse', () => {
  it('queries by verse_ref', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getInterpretationsForVerse('genesis 1:1');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('historical_interpretations WHERE verse_ref = ?'),
      ['genesis 1:1'],
    );
  });
});

describe('getInterpretationsForChapter', () => {
  it('queries by LIKE prefix for chapter', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getInterpretationsForChapter('genesis', 3);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('LIKE'),
      ['genesis 3:%'],
    );
  });
});

describe('getInterpretationsByEra', () => {
  it('filters by era', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getInterpretationsByEra('patristic');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('era = ?'),
      ['patristic'],
    );
  });
});

describe('getInterpretation', () => {
  it('returns a single interpretation by id', async () => {
    const interp = { id: 'int1', era: 'patristic' };
    getMockDb().getFirstAsync.mockResolvedValue(interp);
    const result = await getInterpretation('int1');
    expect(result).toEqual(interp);
  });

  it('returns null when not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    expect(await getInterpretation('missing')).toBeNull();
  });
});
