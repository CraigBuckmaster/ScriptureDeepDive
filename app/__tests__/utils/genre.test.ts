/**
 * Tests for utils/genre.ts — per-chapter genre override resolution (#1724).
 */
import { resolveGenre } from '@/utils/genre';
import type { Book, Chapter } from '@/types';

const BOOK: Pick<Book, 'genre_label' | 'genre_guidance'> = {
  genre_label: 'Apocalyptic',
  genre_guidance: 'Court tales (1-6) + apocalyptic visions (7-12) · Symbolic numbers and beasts',
};

const CHAPTER_WITH_OVERRIDE: Pick<Chapter, 'chapter_genre_label' | 'chapter_genre_guidance'> = {
  chapter_genre_label: 'Apocalyptic Vision',
  chapter_genre_guidance: 'Symbolic beasts encode empires · Vision-then-interpretation form',
};

const CHAPTER_NO_OVERRIDE: Pick<Chapter, 'chapter_genre_label' | 'chapter_genre_guidance'> = {
  chapter_genre_label: null,
  chapter_genre_guidance: null,
};

describe('resolveGenre', () => {
  it('returns the chapter override when both chapter fields are present', () => {
    expect(resolveGenre(BOOK, CHAPTER_WITH_OVERRIDE)).toEqual({
      label: 'Apocalyptic Vision',
      guidance: 'Symbolic beasts encode empires · Vision-then-interpretation form',
    });
  });

  it('falls back to book-level when the chapter has no override', () => {
    expect(resolveGenre(BOOK, CHAPTER_NO_OVERRIDE)).toEqual({
      label: 'Apocalyptic',
      guidance: 'Court tales (1-6) + apocalyptic visions (7-12) · Symbolic numbers and beasts',
    });
  });

  it('returns null when neither chapter nor book carries genre data', () => {
    expect(resolveGenre({}, CHAPTER_NO_OVERRIDE)).toBeNull();
    expect(resolveGenre(null, null)).toBeNull();
    expect(resolveGenre(undefined, undefined)).toBeNull();
  });

  it('falls through to book entirely when the chapter sets only the label (no mixing)', () => {
    // Defensive case: schema validator would reject this content, but if a
    // malformed row reaches the runtime, we must NOT mix sources.
    const halfOverride = {
      chapter_genre_label: 'Apocalyptic Vision',
      chapter_genre_guidance: null,
    };
    expect(resolveGenre(BOOK, halfOverride)).toEqual({
      label: 'Apocalyptic',
      guidance: 'Court tales (1-6) + apocalyptic visions (7-12) · Symbolic numbers and beasts',
    });
  });

  it('falls through to book entirely when the chapter sets only the guidance (no mixing)', () => {
    const halfOverride = {
      chapter_genre_label: null,
      chapter_genre_guidance: 'Symbolic beasts encode empires',
    };
    expect(resolveGenre(BOOK, halfOverride)).toEqual({
      label: 'Apocalyptic',
      guidance: 'Court tales (1-6) + apocalyptic visions (7-12) · Symbolic numbers and beasts',
    });
  });

  it('returns null if book has only label (book-level half-state)', () => {
    expect(resolveGenre({ genre_label: 'Prophecy' }, CHAPTER_NO_OVERRIDE)).toBeNull();
    expect(resolveGenre({ genre_guidance: 'something' }, CHAPTER_NO_OVERRIDE)).toBeNull();
  });

  it('treats empty strings as missing (truthy guard)', () => {
    expect(
      resolveGenre(BOOK, { chapter_genre_label: '', chapter_genre_guidance: '' }),
    ).toEqual({
      label: 'Apocalyptic',
      guidance: 'Court tales (1-6) + apocalyptic visions (7-12) · Symbolic numbers and beasts',
    });
  });
});
