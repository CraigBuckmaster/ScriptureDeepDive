/**
 * utils/genre.ts — Genre label + guidance resolution (#1724).
 *
 * The chapter row may carry per-chapter genre overrides
 * (`chapter_genre_label`, `chapter_genre_guidance`) for books with
 * sharply different sub-genres across chapter ranges (e.g. Daniel 1–6
 * court tales vs 7–12 apocalyptic visions, Genesis 1–11 primeval history
 * vs 12–50 patriarchal narrative).
 *
 * Resolution is atomic per level: a chapter override only takes effect
 * when BOTH fields are populated. The schema validator enforces this at
 * authoring time (see `_tools/schema_validator.py`). The runtime check
 * here defends against any malformed row that slips through — we'd
 * rather hide the banner than mix sources (chapter label + book guidance
 * would prime the reader incorrectly).
 *
 * Consumers:
 *   - `<GenreBanner>` via `ChapterScreen`
 *   - `buildGuidedStudyPlan` and `buildConceptChips` in
 *     `services/guidedStudy/plan.ts`
 *
 * Note: `useExploreRecommendations` deliberately stays on book-level —
 * exploration recs are a book-aggregate concern, not chapter-orientation.
 */

import type { Book, Chapter } from '../types';

export interface ResolvedGenre {
  label: string;
  guidance: string;
}

type GenreBookFields = Pick<Book, 'genre_label' | 'genre_guidance'>;
type GenreChapterFields = Pick<Chapter, 'chapter_genre_label' | 'chapter_genre_guidance'>;

/**
 * Returns the chapter-override genre when both fields are populated,
 * otherwise the book-level genre when both are populated, otherwise null.
 *
 * Mixed sources (chapter label + book guidance, or vice versa) are never
 * returned — this is intentional, see file header.
 */
export function resolveGenre(
  book: GenreBookFields | null | undefined,
  chapter: GenreChapterFields | null | undefined,
): ResolvedGenre | null {
  const chapterLabel = chapter?.chapter_genre_label;
  const chapterGuidance = chapter?.chapter_genre_guidance;
  if (chapterLabel && chapterGuidance) {
    return { label: chapterLabel, guidance: chapterGuidance };
  }

  const bookLabel = book?.genre_label;
  const bookGuidance = book?.genre_guidance;
  if (bookLabel && bookGuidance) {
    return { label: bookLabel, guidance: bookGuidance };
  }

  return null;
}
