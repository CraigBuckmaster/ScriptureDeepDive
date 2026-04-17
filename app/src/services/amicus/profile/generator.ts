/**
 * services/amicus/profile/generator.ts — Entry point for compressed-profile
 * generation, caching, inspection, and reset.
 *
 * The cache lives in user.db's `partner_profile_cache` table (singleton row,
 * id=1). A regenerated profile is written in place; we never accumulate
 * rows.
 */
import { collectSignals } from './signals';
import { assembleProfile } from './templates';
import type {
  CompressedProfile,
  ProfileForInspection,
  RawSignals,
} from './types';
import { logger } from '@/utils/logger';
import { getUserDb } from '@/db/userDatabase';

const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface CachedRow {
  profile_prose: string;
  raw_signals_hash: string;
  raw_signals_json: string;
  generated_at: string;
}

export async function generateProfile(force = false): Promise<CompressedProfile> {
  const signals = await collectSignals();
  const hash = await hashRawSignals(signals);

  if (!force) {
    const cached = await readCache();
    if (cached && cached.raw_signals_hash === hash && !isExpired(cached.generated_at)) {
      logger.info('AmicusProfile', 'cache hit');
      return rehydrateFromCache(cached);
    }
  }

  const assembled = assembleProfile(signals);
  const now = new Date().toISOString();
  const profile: CompressedProfile = {
    prose: assembled.prose,
    preferred_scholars: assembled.preferred_scholars,
    preferred_traditions: assembled.preferred_traditions,
    generated_at: now,
    raw_signals_hash: hash,
  };

  await writeCache(profile, signals);
  return profile;
}

export async function getProfileForInspection(): Promise<ProfileForInspection> {
  const profile = await generateProfile(false);
  const signals = await loadCachedSignals();
  return {
    prose: profile.prose,
    preferred_scholars: profile.preferred_scholars,
    preferred_traditions: profile.preferred_traditions,
    generated_at: profile.generated_at,
    raw_signals: signals ?? (await collectSignals()),
  };
}

export async function clearProfile(): Promise<void> {
  await getUserDb().runAsync('DELETE FROM partner_profile_cache');
  logger.info('AmicusProfile', 'cache cleared');
}

// ── Internals ─────────────────────────────────────────────────────────

async function readCache(): Promise<CachedRow | null> {
  try {
    const row = await getUserDb().getFirstAsync<CachedRow>(
      'SELECT profile_prose, raw_signals_hash, raw_signals_json, generated_at '
        + 'FROM partner_profile_cache WHERE id = 1',
    );
    return row ?? null;
  } catch {
    return null;
  }
}

async function loadCachedSignals(): Promise<RawSignals | null> {
  const row = await readCache();
  if (!row || !row.raw_signals_json) return null;
  try {
    return JSON.parse(row.raw_signals_json) as RawSignals;
  } catch {
    return null;
  }
}

async function writeCache(
  profile: CompressedProfile,
  signals: RawSignals,
): Promise<void> {
  await getUserDb().runAsync(
    `INSERT INTO partner_profile_cache
       (id, profile_prose, raw_signals_hash, raw_signals_json, generated_at)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       profile_prose    = excluded.profile_prose,
       raw_signals_hash = excluded.raw_signals_hash,
       raw_signals_json = excluded.raw_signals_json,
       generated_at     = excluded.generated_at`,
    [
      profile.prose,
      profile.raw_signals_hash,
      JSON.stringify(signals),
      profile.generated_at,
    ],
  );
}

function rehydrateFromCache(row: CachedRow): CompressedProfile {
  let preferred_scholars: string[] = [];
  let preferred_traditions: string[] = [];
  try {
    const parsed = JSON.parse(row.raw_signals_json) as RawSignals;
    preferred_scholars = (parsed.top_scholars_opened ?? [])
      .filter((s) => s.open_count >= 10)
      .map((s) => s.scholar_id);
    preferred_traditions = pickTraditionsAboveThreshold(parsed.tradition_distribution);
  } catch {
    /* ignore — worst case we omit boosts and regenerate on next cycle */
  }
  return {
    prose: row.profile_prose,
    preferred_scholars,
    preferred_traditions,
    generated_at: row.generated_at,
    raw_signals_hash: row.raw_signals_hash,
  };
}

function pickTraditionsAboveThreshold(
  distribution: Record<string, number> | undefined,
): string[] {
  if (!distribution) return [];
  return Object.entries(distribution)
    .filter(([, share]) => share >= 0.3)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

function isExpired(generatedAt: string): boolean {
  const t = Date.parse(generatedAt);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t > CACHE_MAX_AGE_MS;
}

/**
 * SHA-256 over a canonical JSON encoding of the signals object. Keys are
 * sorted so semantically identical signals produce the same hash.
 */
export async function hashRawSignals(signals: RawSignals): Promise<string> {
  const canonical = canonicalize(signals);
  const data = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function canonicalize(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return '{' + entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`).join(',') + '}';
}
