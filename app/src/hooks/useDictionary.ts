/**
 * hooks/useDictionary.ts — Data hooks for Bible Dictionary feature.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  getAllDictionaryEntries,
  getDictionaryEntry,
  searchDictionary,
} from '../db/content/dictionary';
import type { DictionaryEntry, DictionaryEntryParsed } from '../types/dictionary';
import { logger } from '../utils/logger';

function parseEntry(raw: DictionaryEntry): DictionaryEntryParsed {
  let refs: string[] = [];
  let related: string[] = [];
  try {
    refs = raw.refs_json ? JSON.parse(raw.refs_json) : [];
  } catch (err) {
    logger.warn('useDictionary', 'Failed to parse refs_json', err);
  }
  try {
    related = raw.related_json ? JSON.parse(raw.related_json) : [];
  } catch (err) {
    logger.warn('useDictionary', 'Failed to parse related_json', err);
  }
  return {
    id: raw.id,
    term: raw.term,
    definition: raw.definition,
    refs,
    related,
    category: raw.category || 'general',
    crossLinks: {
      personId: raw.cross_person_id,
      placeId: raw.cross_place_id,
      wordStudyId: raw.cross_word_study_id,
      conceptId: raw.cross_concept_id,
    },
    source: raw.source,
  };
}

export interface DictionarySection {
  letter: string;
  data: DictionaryEntryParsed[];
}

export function useDictionaryBrowse() {
  const [entries, setEntries] = useState<DictionaryEntryParsed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DictionaryEntryParsed[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await getAllDictionaryEntries();
        if (!cancelled) {
          setEntries(raw.map(parseEntry));
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('useDictionary', 'Failed to load entries', err);
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // FTS search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const raw = await searchDictionary(searchQuery);
        if (!cancelled) setSearchResults(raw.map(parseEntry));
      } catch (err) {
        logger.warn('useDictionary', 'Search failed', err);
        if (!cancelled) setSearchResults([]);
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [searchQuery]);

  const sections = useMemo<DictionarySection[]>(() => {
    const grouped: Record<string, DictionaryEntryParsed[]> = {};
    for (const e of entries) {
      const letter = e.term[0]?.toUpperCase() || '#';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(e);
    }
    return Object.keys(grouped)
      .sort()
      .map((letter) => ({ letter, data: grouped[letter] }));
  }, [entries]);

  const availableLetters = useMemo(
    () => new Set(sections.map((s) => s.letter)),
    [sections]
  );

  return {
    entries,
    sections,
    availableLetters,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchResults,
  };
}

export function useDictionaryDetail(entryId: string) {
  const [entry, setEntry] = useState<DictionaryEntryParsed | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await getDictionaryEntry(entryId);
        if (!cancelled) {
          setEntry(raw ? parseEntry(raw) : null);
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('useDictionary', `Failed to load entry ${entryId}`, err);
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [entryId]);

  return { entry, isLoading };
}
