/**
 * #1843 — getConceptEncounterHistory unit test against fixture rows
 * (the acceptance criterion). The fake db returns fixture rows and the
 * test asserts the SQL shape: verified concept_encounters columns
 * only, excerpt subquery reads guided_study_synthesis (user's words).
 */
const FIXTURE_ROWS = [
  {
    concept_id: 'covenant',
    concept_label: 'Covenant',
    chapter_id: 'genesis_9',
    encounter_count: 3,
    last_seen_at: '2026-06-20 08:00:00',
    prior_response: 'God binds himself to creation before anyone asks.',
  },
  {
    concept_id: 'covenant',
    concept_label: 'Covenant',
    chapter_id: 'genesis_15',
    encounter_count: 1,
    last_seen_at: '2026-06-28 08:00:00',
    prior_response: null,
  },
];

const mockGetAllAsync = jest.fn(async () => FIXTURE_ROWS);
jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({ getAllAsync: mockGetAllAsync }),
}));

import { getConceptEncounterHistory } from '@/db/userQueries';

beforeEach(() => jest.clearAllMocks());

describe('getConceptEncounterHistory (#1843)', () => {
  it('returns [] without touching the db for an empty id list', async () => {
    await expect(getConceptEncounterHistory([])).resolves.toEqual([]);
    expect(mockGetAllAsync).not.toHaveBeenCalled();
  });

  it('queries concept_encounters by id set and joins the synthesis excerpt', async () => {
    const rows = await getConceptEncounterHistory(['covenant', 'temple']);
    expect(rows).toEqual(FIXTURE_ROWS);

    const [sql, params] = mockGetAllAsync.mock.calls[0] as unknown as [string, unknown[]];
    expect(params).toEqual(['covenant', 'temple']);
    expect(sql).toContain('FROM concept_encounters ce');
    expect(sql).toContain('ce.concept_id IN (?,?)');
    // The excerpt is the user's own synthesis takeaway — never generated.
    expect(sql).toContain('FROM guided_study_synthesis syn');
    expect(sql).toContain("trim(syn.takeaway) != ''");
    // Only columns that exist on the v19 table (no guessed FK columns).
    expect(sql).not.toMatch(/ce\.(session_id|response_id)/);
  });
});
