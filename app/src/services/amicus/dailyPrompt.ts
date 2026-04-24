/**
 * services/amicus/dailyPrompt.ts — Daily proactive "Amicus noticed..." prompt.
 *
 * Client-triggered on app open. Cached for 24h in `amicus_daily_prompt_cache`
 * keyed on (date, profile_hash). Graceful degradation on any failure — the
 * home card is optional content so we never throw into the UI.
 */
import { getCachedDailyPrompt, getRecentChapters } from '@/db/userQueries';
import { upsertDailyPrompt } from '@/db/userMutations';
import { generateProfile } from '@/services/amicus/profile/generator';
import { logger } from '@/utils/logger';

const PROXY_BASE = (
  process.env.EXPO_PUBLIC_AMICUS_PROXY_URL ?? 'https://ai.contentcompanionstudy.com'
).replace(/\/$/, '');
const DAILY_PROMPT_URL = `${PROXY_BASE}/ai/daily-prompt`;

export interface DailyPrompt {
  prompt_text: string;
  seed_query: string;
}

export interface GetDailyPromptOptions {
  getAuthToken?: () => string;
  fetchImpl?: typeof fetch;
  /** Inject a fixed date for deterministic tests. Defaults to now. */
  now?: () => Date;
}

/**
 * Returns today's proactive prompt — from cache, regenerated via the proxy,
 * or from stale cache if the proxy is unreachable. Returns null if there is
 * nothing to show (no cache AND proxy failure).
 */
export async function getDailyPrompt(
  opts: GetDailyPromptOptions = {},
): Promise<DailyPrompt | null> {
  const today = localDate(opts.now?.() ?? new Date());

  let profileHash = '';
  try {
    const profile = await generateProfile(false);
    profileHash = profile.raw_signals_hash;
  } catch (err) {
    logger.warn('AmicusDailyPrompt', `profile_unavailable: ${String(err)}`);
  }

  const cached = await getCachedDailyPrompt().catch(() => null);
  if (
    cached &&
    cached.date === today &&
    cached.profile_hash === profileHash
  ) {
    return {
      prompt_text: cached.prompt_text,
      seed_query: cached.seed_query,
    };
  }

  const authToken =
    opts.getAuthToken?.() ?? process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN ?? '';
  if (!authToken || !profileHash) {
    // No way to call the proxy — fall back to whatever we have.
    return cached
      ? {
          prompt_text: cached.prompt_text,
          seed_query: cached.seed_query,
        }
      : null;
  }

  const recentChapters = await getRecentChapters(5).catch(() => []);
  const last5 = recentChapters
    .map((c) => `${c.book_id}:${c.chapter_num}`)
    .slice(0, 5);
  const profile = await generateProfile(false);

  let fresh: DailyPrompt | null = null;
  try {
    fresh = await callProxy({
      profileSummary: profile.prose,
      last5Chapters: last5,
      clientDate: today,
      authToken,
      fetchImpl: opts.fetchImpl,
    });
  } catch (err) {
    logger.warn('AmicusDailyPrompt', `proxy_failed: ${String(err)}`);
  }

  if (!fresh) {
    // Offline / 5xx / bad shape → keep whatever stale cache we have.
    return cached
      ? {
          prompt_text: cached.prompt_text,
          seed_query: cached.seed_query,
        }
      : null;
  }

  await upsertDailyPrompt({
    date: today,
    profileHash,
    promptText: fresh.prompt_text,
    seedQuery: fresh.seed_query,
  }).catch((err) => {
    logger.warn('AmicusDailyPrompt', `cache_write_failed: ${String(err)}`);
  });

  return fresh;
}

interface CallProxyArgs {
  profileSummary: string;
  last5Chapters: string[];
  clientDate: string;
  authToken: string;
  fetchImpl?: typeof fetch;
}

async function callProxy(args: CallProxyArgs): Promise<DailyPrompt | null> {
  const fetchImpl = args.fetchImpl ?? fetch;
  const resp = await fetchImpl(DAILY_PROMPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.authToken}`,
    },
    body: JSON.stringify({
      profile_summary: args.profileSummary,
      last_5_chapters: args.last5Chapters,
      client_date: args.clientDate,
    }),
  });
  if (!resp.ok) return null;
  const payload = (await resp.json()) as Partial<DailyPrompt>;
  if (
    typeof payload.prompt_text !== 'string' ||
    typeof payload.seed_query !== 'string' ||
    payload.prompt_text.length === 0 ||
    payload.seed_query.length === 0
  ) {
    return null;
  }
  return {
    prompt_text: payload.prompt_text,
    seed_query: payload.seed_query,
  };
}

/** Format `Date` as YYYY-MM-DD in the user's local timezone. */
export function localDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
