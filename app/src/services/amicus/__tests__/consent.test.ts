/**
 * Tests for services/amicus/consent.ts (pure helpers).
 */
import { getMockUserDb, resetMockUserDb } from '../../../../__tests__/helpers/mockUserDb';
import {
  AMICUS_OPT_IN_KEY,
  acceptAmicusOptIn,
  hasAcceptedAmicusOptIn,
  resetAmicusOptIn,
} from '../consent';

jest.mock('@/db/userDatabase', () =>
  require('../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

beforeEach(() => {
  resetMockUserDb();
});

describe('hasAcceptedAmicusOptIn', () => {
  it('returns true when a valid timestamp is stored', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({
      value: '2026-04-17T10:00:00.000Z',
    });
    expect(await hasAcceptedAmicusOptIn()).toBe(true);
  });

  it('returns false when the pref is absent', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce(null);
    expect(await hasAcceptedAmicusOptIn()).toBe(false);
  });

  it('returns false when the pref has been reset (empty string)', async () => {
    getMockUserDb().getFirstAsync.mockResolvedValueOnce({ value: '' });
    expect(await hasAcceptedAmicusOptIn()).toBe(false);
  });
});

describe('acceptAmicusOptIn', () => {
  it('writes the current timestamp under the opt-in key', async () => {
    await acceptAmicusOptIn();
    const calls = getMockUserDb().runAsync.mock.calls;
    const writeCall = calls.find((c: unknown[]) =>
      typeof c[0] === 'string' && c[0].includes('user_preferences'),
    );
    expect(writeCall).toBeTruthy();
    const params = writeCall?.[1] as [string, string];
    expect(params[0]).toBe(AMICUS_OPT_IN_KEY);
    expect(Date.parse(params[1])).not.toBeNaN();
  });
});

describe('resetAmicusOptIn', () => {
  it('writes an empty string to the opt-in key', async () => {
    await resetAmicusOptIn();
    const writeCall = getMockUserDb().runAsync.mock.calls.find(
      (c: unknown[]) =>
        typeof c[0] === 'string' && c[0].includes('user_preferences'),
    );
    const params = writeCall?.[1] as [string, string];
    expect(params[0]).toBe(AMICUS_OPT_IN_KEY);
    expect(params[1]).toBe('');
  });
});
