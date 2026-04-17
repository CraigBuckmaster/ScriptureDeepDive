/**
 * Tests for services/amicus/dailyPrompt.ts — cache + proxy daily prompt.
 */
import {
  getMockUserDb,
  resetMockUserDb,
} from '../../../../__tests__/helpers/mockUserDb';
import {
  getDailyPrompt,
  localDate,
} from '@/services/amicus/dailyPrompt';

jest.mock('@/db/userDatabase', () =>
  require('../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

jest.mock('@/db/database', () =>
  require('../../../../__tests__/helpers/mockDb').mockDatabaseModule(),
);

const mockGenerateProfile = jest.fn();
jest.mock('@/services/amicus/profile/generator', () => ({
  generateProfile: (force?: boolean) => mockGenerateProfile(force),
}));

const FIXED_DATE = new Date('2026-04-17T12:00:00');
const now = () => FIXED_DATE;

beforeEach(() => {
  resetMockUserDb();
  mockGenerateProfile.mockReset();
  mockGenerateProfile.mockResolvedValue({
    prose: 'Reformed-leaning; covenant focus.',
    preferred_scholars: [],
    preferred_traditions: [],
    generated_at: '2026-04-16T00:00:00.000Z',
    raw_signals_hash: 'hash-1',
  });
  process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN = 'tok';
});

function mockCacheRow(row: Partial<{
  date: string;
  profile_hash: string;
  prompt_text: string;
  seed_query: string;
  generated_at: string;
}> | null): void {
  const db = getMockUserDb();
  if (row === null) {
    db.getFirstAsync.mockImplementation(async () => null);
  } else {
    db.getFirstAsync.mockImplementation(async (sql: string) => {
      if (sql.includes('amicus_daily_prompt_cache')) {
        return {
          date: row.date ?? '2026-04-17',
          profile_hash: row.profile_hash ?? 'hash-1',
          prompt_text: row.prompt_text ?? 'cached prompt',
          seed_query: row.seed_query ?? 'cached query',
          generated_at: row.generated_at ?? '2026-04-17T00:00:00.000Z',
        };
      }
      return null;
    });
  }
}

function mockProxyOk(payload = {
  prompt_text: 'fresh from proxy',
  seed_query: 'fresh query',
  cached_until: '2026-04-18T00:00:00.000Z',
}): jest.Mock {
  return jest.fn(async () =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('localDate', () => {
  it('returns YYYY-MM-DD in local time', () => {
    expect(localDate(new Date('2026-04-17T12:00:00'))).toBe('2026-04-17');
  });
  it('zero-pads single-digit months and days', () => {
    expect(localDate(new Date('2026-01-05T00:00:00'))).toBe('2026-01-05');
  });
});

describe('getDailyPrompt', () => {
  it('returns the cached prompt when date + profile_hash still match', async () => {
    mockCacheRow({ date: '2026-04-17', profile_hash: 'hash-1', prompt_text: 'hit' });
    const fetchImpl = mockProxyOk();

    const result = await getDailyPrompt({ now, fetchImpl });

    expect(result).toEqual({ prompt_text: 'hit', seed_query: 'cached query' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('calls the proxy and writes through on cache miss (new day)', async () => {
    mockCacheRow({ date: '2026-04-16', profile_hash: 'hash-1' });
    const fetchImpl = mockProxyOk();

    const result = await getDailyPrompt({ now, fetchImpl });

    expect(result?.prompt_text).toBe('fresh from proxy');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const call = fetchImpl.mock.calls[0]!;
    const body = JSON.parse(call[1]!.body as string) as {
      profile_summary: string;
      client_date: string;
      last_5_chapters: string[];
    };
    expect(body.client_date).toBe('2026-04-17');
    expect(body.profile_summary).toMatch(/covenant focus/);

    const db = getMockUserDb();
    const write = db.runAsync.mock.calls.find((c: unknown[]) =>
      typeof c[0] === 'string' && c[0].includes('amicus_daily_prompt_cache'),
    );
    expect(write).toBeDefined();
    expect(write![1]).toEqual(['2026-04-17', 'hash-1', 'fresh from proxy', 'fresh query']);
  });

  it('invalidates the cache when profile_hash changes', async () => {
    mockCacheRow({ date: '2026-04-17', profile_hash: 'old-hash' });
    const fetchImpl = mockProxyOk();

    const result = await getDailyPrompt({ now, fetchImpl });

    expect(result?.prompt_text).toBe('fresh from proxy');
    expect(fetchImpl).toHaveBeenCalled();
  });

  it('falls back to stale cache when the proxy returns a 5xx', async () => {
    mockCacheRow({ date: '2026-04-10', profile_hash: 'hash-1', prompt_text: 'stale' });
    const fetchImpl = jest.fn(async () =>
      new Response('x', { status: 503 }),
    );

    const result = await getDailyPrompt({ now, fetchImpl });

    expect(result).toEqual({ prompt_text: 'stale', seed_query: 'cached query' });
  });

  it('falls back to stale cache when fetch throws (offline)', async () => {
    mockCacheRow({ date: '2026-04-10', profile_hash: 'hash-1', prompt_text: 'stale' });
    const fetchImpl = jest.fn(async () => {
      throw new Error('Network request failed');
    });

    const result = await getDailyPrompt({ now, fetchImpl });

    expect(result?.prompt_text).toBe('stale');
  });

  it('returns null when there is no cache AND the proxy is unreachable', async () => {
    mockCacheRow(null);
    const fetchImpl = jest.fn(async () => {
      throw new Error('offline');
    });

    const result = await getDailyPrompt({ now, fetchImpl });

    expect(result).toBeNull();
  });

  it('returns null when there is no profile and no cache', async () => {
    mockGenerateProfile.mockRejectedValue(new Error('no profile'));
    mockCacheRow(null);
    const fetchImpl = mockProxyOk();

    const result = await getDailyPrompt({ now, fetchImpl });

    expect(result).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('sends Bearer auth token to the proxy', async () => {
    mockCacheRow(null);
    const fetchImpl = mockProxyOk();
    await getDailyPrompt({ now, fetchImpl, getAuthToken: () => 'my-token' });
    expect(fetchImpl.mock.calls[0]![1]!.headers).toMatchObject({
      Authorization: 'Bearer my-token',
    });
  });

  it('returns null when the proxy response has the wrong shape', async () => {
    mockCacheRow(null);
    const fetchImpl = jest.fn(async () =>
      new Response(JSON.stringify({ prompt_text: '' }), { status: 200 }),
    );
    const result = await getDailyPrompt({ now, fetchImpl });
    expect(result).toBeNull();
  });
});
