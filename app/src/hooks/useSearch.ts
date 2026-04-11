/**
 * hooks/useSearch.ts — Universal search across all content types.
 * Debounced at 300ms. Searches verses, people, books, concepts,
 * map stories, timeline events, life topics, and difficult passages.
 *
 * Includes reference parsing: typing "Gen 3:15" or "Romans 8" produces
 * a direct-navigation result at the top of the list.
 *
 * Results are grouped by type. Groups are ordered by relevance:
 * groups with direct name/title matches rank highest.
 */

import { useState, useEffect, useRef } from 'react';
import {
  searchVerses, searchPeople, getLiveBooks, getAllConcepts,
  getMapStories, getAllTimelineEntries, getAllDifficultPassages,
  searchLifeTopics,
} from '../db/content';
import { getBookByName } from '../utils/verseResolver';
import type { Verse, Person, Book, MapStory, TimelineEntry, DifficultPassage, Concept, LifeTopic } from '../types';
import { logger } from '../utils/logger';

// ── Result types ────────────────────────────────────────────────────

export interface ParsedReference {
  bookId: string;
  bookName: string;
  chapter: number;
  verse?: number;
  display: string; // e.g. "Genesis 3:15"
}

export interface UniversalSearchResults {
  reference: ParsedReference | null;
  verses: Verse[];
  people: Person[];
  books: Book[];
  concepts: Concept[];
  mapStories: MapStory[];
  timelineEvents: TimelineEntry[];
  lifeTopics: LifeTopic[];
  difficultPassages: DifficultPassage[];
}

const EMPTY: UniversalSearchResults = {
  reference: null,
  verses: [], people: [], books: [], concepts: [],
  mapStories: [], timelineEvents: [], lifeTopics: [], difficultPassages: [],
};

// ── Reference parsing ───────────────────────────────────────────────

/**
 * Parse a search query as a scripture reference.
 * Case-insensitive. Handles: "Gen 3", "genesis 3:15", "1 Cor 13", "Psalm 23:1"
 */
const REF_INPUT_PATTERN = /^(\d?\s*[A-Za-z][A-Za-z .]+?)\s+(\d+)(?::(\d+))?$/;

function parseSearchReference(query: string): ParsedReference | null {
  const trimmed = query.trim();
  const m = trimmed.match(REF_INPUT_PATTERN);
  if (!m) return null;

  const bookStr = m[1].trim();
  const book = getBookByName(bookStr);
  if (!book) return null;

  const chapter = parseInt(m[2], 10);
  if (chapter < 1 || chapter > book.chapters) return null;

  const verse = m[3] ? parseInt(m[3], 10) : undefined;
  const display = verse
    ? `${book.name} ${chapter}:${verse}`
    : `${book.name} ${chapter}`;

  return { bookId: book.id, bookName: book.name, chapter, verse, display };
}

// ── Group ordering ──────────────────────────────────────────────────

/** Default section order when relevance scores tie. */
const DEFAULT_ORDER: (keyof Omit<UniversalSearchResults, 'reference'>)[] = [
  'books', 'people', 'concepts', 'difficultPassages',
  'mapStories', 'timelineEvents', 'lifeTopics', 'verses',
];

const GROUP_LABELS: Record<string, string> = {
  books: 'Books',
  people: 'People',
  concepts: 'Concepts',
  difficultPassages: 'Difficult Passages',
  mapStories: 'Map Stories',
  timelineEvents: 'Timeline',
  lifeTopics: 'Life Topics',
  verses: 'Verses',
};

function nameScore(name: string, lower: string): number {
  const n = name.toLowerCase();
  if (n === lower) return 3;
  if (n.startsWith(lower)) return 2;
  if (n.includes(lower)) return 1;
  return 0;
}

function groupScore(items: Record<string, any>[], lower: string): number {
  let best = 0;
  for (const item of items) {
    const field: string = item.name ?? item.title ?? '';
    best = Math.max(best, nameScore(field, lower));
    if (best === 3) return best;
  }
  return best;
}

export interface SearchResultGroup {
  key: string;
  label: string;
  data: any[];
}

/** Return non-empty result groups ordered by relevance. */
export function buildOrderedGroups(
  results: UniversalSearchResults,
  query: string,
): SearchResultGroup[] {
  const lower = query.trim().toLowerCase();

  const groups: SearchResultGroup[] = DEFAULT_ORDER
    .filter((k) => results[k].length > 0)
    .map((k) => ({ key: k, label: GROUP_LABELS[k], data: results[k] }));

  // Stable sort: higher group relevance score → earlier position
  groups.sort((a, b) => {
    const sa = groupScore(a.data, lower);
    const sb = groupScore(b.data, lower);
    return sb - sa;
  });

  return groups;
}

// ── Caches for small, static datasets ─────────────────────────────

interface StaticCaches {
  books: Book[];
  concepts: Concept[];
  mapStories: MapStory[];
  timelineEvents: TimelineEntry[];
  difficultPassages: DifficultPassage[];
}

async function loadCaches(
  cache: React.MutableRefObject<StaticCaches | null>,
): Promise<StaticCaches> {
  if (cache.current) return cache.current;
  const [books, concepts, mapStories, timelineEvents, difficultPassages] =
    await Promise.all([
      getLiveBooks(),
      getAllConcepts(),
      getMapStories(),
      getAllTimelineEntries(),
      getAllDifficultPassages(),
    ]);
  cache.current = { books, concepts, mapStories, timelineEvents, difficultPassages };
  return cache.current;
}

function filterByFields<T extends Record<string, any>>(
  items: T[],
  lower: string,
  fields: (keyof T)[],
): T[] {
  return items.filter((item) =>
    fields.some((f) => {
      const val = item[f];
      return typeof val === 'string' && val.toLowerCase().includes(lower);
    }),
  );
}

// ── Hook ────────────────────────────────────────────────────────────

export function useSearch(query: string) {
  const [results, setResults] = useState<UniversalSearchResults>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<StaticCaches | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(EMPTY);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const lower = trimmed.toLowerCase();

        // Reference parsing — instant, no DB call
        const reference = parseSearchReference(trimmed);

        const caches = await loadCaches(cacheRef);

        // FTS queries + client-side filters in parallel
        const [verses, rawPeople, lifeTopics] = await Promise.all([
          searchVerses(trimmed, 50),
          searchPeople(trimmed),
          searchLifeTopics(trimmed).catch(() => [] as LifeTopic[]),
        ]);

        // Sort people by relevance
        const people = rawPeople.sort(
          (a, b) => nameScore(b.name, lower) - nameScore(a.name, lower),
        );

        // Client-side filters on cached data
        const books = filterByFields(caches.books, lower, ['name', 'id']);
        const concepts = filterByFields(caches.concepts, lower, ['name', 'description']);
        const mapStories = filterByFields(caches.mapStories, lower, ['name', 'summary']);
        const timelineEvents = filterByFields(caches.timelineEvents, lower, ['name', 'summary']);
        const difficultPassages = filterByFields(
          caches.difficultPassages, lower, ['title', 'question'],
        );

        setResults({
          reference,
          verses, people, books, concepts,
          mapStories, timelineEvents, lifeTopics, difficultPassages,
        });
      } catch (err) {
        logger.error('Search', 'Universal search failed', err);
        setResults(EMPTY);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, isLoading };
}
