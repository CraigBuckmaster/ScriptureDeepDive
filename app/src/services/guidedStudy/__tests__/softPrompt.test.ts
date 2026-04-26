import { getMockUserDb, resetMockUserDb } from '../../../../__tests__/helpers/mockUserDb';
import {
  SOFT_PROMPT_PREF_KEY,
  markSoftPromptSeen,
  shouldShowSoftPrompt,
} from '../softPrompt';

jest.mock('@/db/userDatabase', () =>
  require('../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

beforeEach(() => {
  resetMockUserDb();
});

describe('shouldShowSoftPrompt', () => {
  it('returns false for premium users (no DB calls needed)', async () => {
    expect(await shouldShowSoftPrompt({ isPremium: true })).toBe(false);
    expect(getMockUserDb().getFirstAsync).not.toHaveBeenCalled();
  });

  it('returns false when the seen flag is already 1', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ value: '1' });
    expect(await shouldShowSoftPrompt({ isPremium: false })).toBe(false);
    // Stops at the preference check; no count query needed.
    expect(getMockUserDb().getFirstAsync).toHaveBeenCalledTimes(1);
  });

  it('returns false when the user has fewer than 3 completed sessions', async () => {
    getMockUserDb().getFirstAsync
      .mockResolvedValueOnce(null) // preference unset
      .mockResolvedValueOnce({ count: 2 });
    expect(await shouldShowSoftPrompt({ isPremium: false })).toBe(false);
  });

  it('returns true when free user has completed 3 sessions and never seen the prompt', async () => {
    getMockUserDb().getFirstAsync
      .mockResolvedValueOnce(null) // preference unset
      .mockResolvedValueOnce({ count: 3 });
    expect(await shouldShowSoftPrompt({ isPremium: false })).toBe(true);
  });

  it('returns true at higher session counts (threshold is a floor)', async () => {
    getMockUserDb().getFirstAsync
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ count: 27 });
    expect(await shouldShowSoftPrompt({ isPremium: false })).toBe(true);
  });

  it('returns false when COUNT(*) row is missing entirely', async () => {
    getMockUserDb().getFirstAsync
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    expect(await shouldShowSoftPrompt({ isPremium: false })).toBe(false);
  });
});

describe('markSoftPromptSeen', () => {
  it('writes the canonical preference value', async () => {
    await markSoftPromptSeen();
    expect(getMockUserDb().runAsync).toHaveBeenCalledWith(
      expect.stringContaining('user_preferences'),
      expect.arrayContaining([SOFT_PROMPT_PREF_KEY, '1']),
    );
  });
});
