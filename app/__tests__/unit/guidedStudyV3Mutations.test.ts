const mockRunAsync = jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
const mockGetFirstAsync = jest.fn().mockResolvedValue(null);
const mockWithTransactionAsync = jest
  .fn()
  .mockImplementation(async (cb: () => Promise<void>) => cb());

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    runAsync: mockRunAsync,
    getFirstAsync: mockGetFirstAsync,
    withTransactionAsync: mockWithTransactionAsync,
  }),
}));

import {
  resetToNewUser,
  resolveGuidedStudyQuestion,
  upsertGuidedStudyQuestion,
} from '@/db/userMutations';

describe('guided study V3 mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upserts a trimmed open question', async () => {
    await upsertGuidedStudyQuestion(12, 'genesis_1', '  What is this chapter emphasizing?  ');

    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO guided_study_questions'),
      [12, 'genesis_1', 'What is this chapter emphasizing?'],
    );
  });

  it('deletes the question row when the text is blank', async () => {
    await upsertGuidedStudyQuestion(12, 'genesis_1', '   ');

    expect(mockRunAsync).toHaveBeenCalledWith(
      'DELETE FROM guided_study_questions WHERE session_id = ?',
      [12],
    );
  });

  it('marks a guided study question resolved', async () => {
    await resolveGuidedStudyQuestion(9);

    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'resolved'"),
      [9],
    );
  });

  it('clears guided study questions during reset', async () => {
    await resetToNewUser();

    expect(mockRunAsync).toHaveBeenCalledWith('DELETE FROM guided_study_questions');
  });
});
