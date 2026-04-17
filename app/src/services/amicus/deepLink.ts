/**
 * services/amicus/deepLink.ts — seeded navigation helpers for the Amicus
 * tab (#1467).
 *
 * Used by the home card (#1466), the peek promotion path (#1464), and
 * future deep-link sources (push notifications, widgets).
 */
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { logger } from '@/utils/logger';

export interface AmicusSeedChapterRef {
  book_id: string;
  chapter_num: number;
}

export interface AmicusSeed {
  query: string;
  chapterRef?: AmicusSeedChapterRef | null;
}

/** Serialize a chapter ref for transport over navigation params or URLs. */
export function formatChapterRef(
  ref: AmicusSeedChapterRef | null | undefined,
): string | undefined {
  if (!ref) return undefined;
  return `${ref.book_id}/${ref.chapter_num}`;
}

/** Parse back the `book_id/chapter_num` string form. */
export function parseChapterRef(
  raw: string | null | undefined,
): AmicusSeedChapterRef | null {
  if (!raw) return null;
  const m = /^([^/]+)\/(\d+)$/.exec(raw);
  if (!m) return null;
  const [, bookId, chapter] = m;
  const chapter_num = Number(chapter);
  if (!Number.isFinite(chapter_num) || chapter_num <= 0) return null;
  return { book_id: bookId!, chapter_num };
}

export interface NavigateToAmicusWithSeedOptions {
  /**
   * Called when the parent (tab) navigator is unavailable — lets tests/
   * callers observe the no-op. Defaults to a logger warning.
   */
  onNoParent?: () => void;
}

/**
 * Navigate to the Amicus tab and seed a new thread with an optional query
 * and chapter ref. Works from any screen mounted under a tab — looks up the
 * parent tab navigator via `getParent`.
 */
export function navigateToAmicusWithSeed(
  navigation: NavigationProp<ParamListBase>,
  seed: AmicusSeed,
  opts: NavigateToAmicusWithSeedOptions = {},
): void {
  const parent = navigation.getParent<NavigationProp<ParamListBase>>();
  if (!parent) {
    (opts.onNoParent ?? (() => {
      logger.warn('AmicusDeepLink', 'no parent navigator for seed');
    }))();
    return;
  }
  parent.navigate('AmicusTab', {
    screen: 'NewThread',
    params: {
      seedQuery: seed.query,
      seedChapterRef: formatChapterRef(seed.chapterRef),
    },
  });
  logger.info(
    'AmicusDeepLink',
    `seeded nav: query=${seed.query.length}ch chapter=${formatChapterRef(seed.chapterRef) ?? 'none'}`,
  );
}

/**
 * Parse a `scripture://amicus/new?q=&ch=` URL into an AmicusSeed. Returns
 * null for unsupported paths so callers can fall through to other handlers.
 */
export function parseAmicusDeepLink(url: string): AmicusSeed | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  // Expo normalizes `scheme://host/path` — we only care about the path
  // segment after the scheme-host boundary.
  const segments = `${parsed.host}${parsed.pathname}`
    .split('/')
    .filter(Boolean);
  if (segments[0] !== 'amicus') return null;
  if (segments[1] !== 'new') return null;

  const query = parsed.searchParams.get('q') ?? '';
  const ch = parsed.searchParams.get('ch');
  const trimmed = query.trim();
  if (!trimmed) return null;
  return {
    query: trimmed,
    chapterRef: parseChapterRef(ch),
  };
}
