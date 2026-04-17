/**
 * services/amicus/profile/types.ts — Profile generator types.
 *
 * `CompressedProfile` here is the full runtime shape; the leaner public
 * version exported from `services/amicus/types.ts` is a strict subset
 * to keep the retrieval service decoupled from the cache.
 */

export interface ScholarEngagement {
  scholar_id: string;
  open_count: number;
}

export interface RecentChapter {
  book_id: string;
  chapter_num: number;
  last_visit: string;
}

export interface CurrentFocus {
  book_id: string;
  chapters_in_range: number;
  days_in_range: number;
}

export interface RawSignals {
  total_chapters_read: number;
  last_30_day_chapters: number;
  top_scholars_opened: ScholarEngagement[];
  tradition_distribution: Record<string, number>;
  genre_distribution: Record<string, number>;
  completed_journeys: string[];
  active_journey: string | null;
  recent_chapters: RecentChapter[];
  current_focus: CurrentFocus | null;
}

export interface CompressedProfile {
  /** 100-200 token prose summary sent to Amicus and displayed in settings. */
  prose: string;
  /** Flat lists used by the re-ranker (kept in sync with the prose). */
  preferred_scholars: string[];
  preferred_traditions: string[];
  /** ISO timestamp of when the prose was generated. */
  generated_at: string;
  /** SHA-256 of the raw signals used — for cache invalidation. */
  raw_signals_hash: string;
}

export interface ProfileForInspection {
  prose: string;
  preferred_scholars: string[];
  preferred_traditions: string[];
  generated_at: string;
  raw_signals: RawSignals;
}
