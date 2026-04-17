/**
 * Tests for the profile generator — hashing + cache invalidation semantics.
 *
 * We stub collectSignals() rather than driving the real SQL path, so the
 * tests exercise generator-level logic (hashing, cache hit, cache expiry,
 * force refresh) without depending on mock-call ordering.
 */
import { clearProfile, generateProfile, hashRawSignals } from '../generator';
import type { RawSignals } from '../types';
import {
  getMockUserDb,
  resetMockUserDb,
} from '../../../../../__tests__/helpers/mockUserDb';
import { resetMockDb } from '../../../../../__tests__/helpers/mockDb';

jest.mock(
  '@/db/userDatabase',
  () => require('../../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);
jest.mock(
  '@/db/database',
  () => require('../../../../../__tests__/helpers/mockDb').mockDatabaseModule(),
);

// Stub collectSignals so we can control exactly what generateProfile sees.
const STUB_SIGNALS: RawSignals = {
  total_chapters_read: 120,
  last_30_day_chapters: 30,
  top_scholars_opened: [
    { scholar_id: 'calvin', open_count: 40 },
    { scholar_id: 'sarna', open_count: 25 },
  ],
  tradition_distribution: { Reformed: 0.6, Jewish: 0.3 },
  genre_distribution: { epistle: 0.4, narrative: 0.4, wisdom: 0.2 },
  completed_journeys: ['garden_to_city'],
  active_journey: 'holy_week',
  recent_chapters: [
    { book_id: 'romans', chapter_num: 9, last_visit: '2026-04-17T12:00:00.000Z' },
  ],
  current_focus: { book_id: 'romans', chapters_in_range: 7, days_in_range: 14 },
};

jest.mock('../signals', () => {
  const actual = jest.requireActual<typeof import('../signals')>('../signals');
  return {
    ...actual,
    collectSignals: jest.fn(),
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockedSignals = require('../signals') as { collectSignals: jest.Mock };

beforeEach(() => {
  resetMockUserDb();
  resetMockDb();
  mockedSignals.collectSignals.mockResolvedValue(STUB_SIGNALS);
});

describe('hashRawSignals', () => {
  it('is deterministic for identical signal objects', async () => {
    const a = await hashRawSignals(STUB_SIGNALS);
    const b = await hashRawSignals(STUB_SIGNALS);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when any field changes', async () => {
    const base = await hashRawSignals(STUB_SIGNALS);
    const mutated = await hashRawSignals({
      ...STUB_SIGNALS,
      total_chapters_read: 121,
    });
    expect(base).not.toBe(mutated);
  });

  it('is key-order-independent', async () => {
    const reordered: RawSignals = {
      current_focus: STUB_SIGNALS.current_focus,
      active_journey: STUB_SIGNALS.active_journey,
      recent_chapters: STUB_SIGNALS.recent_chapters,
      completed_journeys: STUB_SIGNALS.completed_journeys,
      genre_distribution: STUB_SIGNALS.genre_distribution,
      tradition_distribution: STUB_SIGNALS.tradition_distribution,
      top_scholars_opened: STUB_SIGNALS.top_scholars_opened,
      last_30_day_chapters: STUB_SIGNALS.last_30_day_chapters,
      total_chapters_read: STUB_SIGNALS.total_chapters_read,
    };
    expect(await hashRawSignals(STUB_SIGNALS)).toBe(await hashRawSignals(reordered));
  });
});

describe('generateProfile', () => {
  it('writes and returns a fresh profile on cache miss', async () => {
    const user = getMockUserDb();
    user.getFirstAsync.mockResolvedValue(null);

    const profile = await generateProfile();
    expect(profile.prose).toMatch(/chapters total/);
    expect(profile.preferred_scholars).toContain('calvin');
    expect(profile.preferred_traditions).toContain('Reformed');
    expect(profile.raw_signals_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(user.runAsync).toHaveBeenCalled();
  });

  it('short-circuits on cache hit with matching hash', async () => {
    const hash = await hashRawSignals(STUB_SIGNALS);
    const user = getMockUserDb();
    user.getFirstAsync.mockResolvedValue({
      profile_prose: 'cached prose',
      raw_signals_hash: hash,
      raw_signals_json: JSON.stringify(STUB_SIGNALS),
      generated_at: new Date().toISOString(),
    });

    const profile = await generateProfile();
    expect(profile.prose).toBe('cached prose');
    expect(user.runAsync).not.toHaveBeenCalled();
  });

  it('regenerates on hash mismatch', async () => {
    const user = getMockUserDb();
    user.getFirstAsync.mockResolvedValue({
      profile_prose: 'stale prose',
      raw_signals_hash: 'different-hash-value',
      raw_signals_json: '{}',
      generated_at: new Date().toISOString(),
    });

    const profile = await generateProfile();
    expect(profile.prose).not.toBe('stale prose');
    expect(user.runAsync).toHaveBeenCalled();
  });

  it('regenerates on expired cache (>7 days)', async () => {
    const hash = await hashRawSignals(STUB_SIGNALS);
    const user = getMockUserDb();
    user.getFirstAsync.mockResolvedValue({
      profile_prose: 'very old prose',
      raw_signals_hash: hash,
      raw_signals_json: JSON.stringify(STUB_SIGNALS),
      generated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const profile = await generateProfile();
    expect(profile.prose).not.toBe('very old prose');
    expect(user.runAsync).toHaveBeenCalled();
  });

  it('force=true bypasses the cache even on match', async () => {
    const hash = await hashRawSignals(STUB_SIGNALS);
    const user = getMockUserDb();
    user.getFirstAsync.mockResolvedValue({
      profile_prose: 'cached prose',
      raw_signals_hash: hash,
      raw_signals_json: JSON.stringify(STUB_SIGNALS),
      generated_at: new Date().toISOString(),
    });

    const profile = await generateProfile(true);
    expect(profile.prose).not.toBe('cached prose');
  });

  it('stores the signals JSON so inspection can round-trip', async () => {
    const user = getMockUserDb();
    user.getFirstAsync.mockResolvedValue(null);
    await generateProfile();
    const [, bindings] = user.runAsync.mock.calls[0]!;
    // bindings = [prose, hash, json, ts]
    const stored = JSON.parse(bindings[2] as string) as RawSignals;
    expect(stored.total_chapters_read).toBe(120);
  });
});

describe('clearProfile', () => {
  it('deletes the singleton row', async () => {
    await clearProfile();
    const user = getMockUserDb();
    expect(user.runAsync).toHaveBeenCalledWith(
      expect.stringMatching(/DELETE FROM partner_profile_cache/),
    );
  });
});
