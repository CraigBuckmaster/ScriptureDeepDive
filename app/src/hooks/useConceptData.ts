/**
 * useConceptData — Aggregates data from multiple tables for a concept.
 *
 * Queries word studies, prophecy chains, cross-ref threads, people,
 * and top chapters by theme score in parallel.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDb } from '../db/database';
import { logger } from '../utils/logger';

export interface JourneyStop {
  ref: string;
  book: string;
  chapter: number;
  label: string;
  development: string;
  what_changes: string;
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  theme_key?: string;
  word_study_ids: string[];
  thread_ids: string[];
  prophecy_chain_ids: string[];
  people_tags: string[];
  tags: string[];
  journey_stops: JourneyStop[];
}

export interface WordStudy {
  id: string;
  language: string;
  original: string;
  transliteration: string;
  strongs: string;
  glosses: string[];
  range: string;
  note: string;
}

export interface ProphecyChain {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface CrossRefThread {
  id: string;
  theme: string;
  tags_json: string;
  steps_json: string;
}

export interface Person {
  id: string;
  name: string;
  role?: string;
  era?: string;
}

export interface ChapterThemeMatch {
  chapter_id: string;
  book_dir: string;
  chapter_num: number;
  book_name: string;
  score: number;
}

export interface ConceptData {
  concept: Concept | null;
  wordStudies: WordStudy[];
  prophecyChains: ProphecyChain[];
  threads: CrossRefThread[];
  people: Person[];
  topChapters: ChapterThemeMatch[];
  loading: boolean;
  error: string | null;
}

export function useConceptData(conceptId: string | undefined): ConceptData {
  const [concept, setConcept] = useState<Concept | null>(null);
  const [wordStudies, setWordStudies] = useState<WordStudy[]>([]);
  const [prophecyChains, setProphecyChains] = useState<ProphecyChain[]>([]);
  const [threads, setThreads] = useState<CrossRefThread[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [topChapters, setTopChapters] = useState<ChapterThemeMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const loadData = useCallback(async () => {
    cancelRef.current = false;
    if (!conceptId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const db = getDb();

      // 1. Load concept record
      const conceptRow = await db.getFirstAsync<{
        id: string;
        title: string;
        description: string;
        theme_key: string | null;
        word_study_ids_json: string;
        thread_ids_json: string;
        prophecy_chain_ids_json: string;
        people_tags_json: string;
        tags_json: string;
        journey_stops_json: string | null;
      }>(
        `SELECT id, title, description, theme_key,
                word_study_ids_json, thread_ids_json,
                prophecy_chain_ids_json, people_tags_json, tags_json,
                journey_stops_json
         FROM concepts WHERE id = ?`,
        [conceptId]
      );

      if (!conceptRow) {
        setError('Concept not found');
        setLoading(false);
        return;
      }

      const conceptData: Concept = {
        id: conceptRow.id,
        title: conceptRow.title,
        description: conceptRow.description,
        theme_key: conceptRow.theme_key ?? undefined,
        word_study_ids: JSON.parse(conceptRow.word_study_ids_json || '[]'),
        thread_ids: JSON.parse(conceptRow.thread_ids_json || '[]'),
        prophecy_chain_ids: JSON.parse(conceptRow.prophecy_chain_ids_json || '[]'),
        people_tags: JSON.parse(conceptRow.people_tags_json || '[]'),
        tags: JSON.parse(conceptRow.tags_json || '[]'),
        journey_stops: JSON.parse(conceptRow.journey_stops_json || '[]'),
      };
      if (cancelRef.current) return;
      setConcept(conceptData);

      // 2. Parallel queries for linked data
      const queries: Promise<void>[] = [];

      // Word studies
      if (conceptData.word_study_ids.length > 0) {
        const placeholders = conceptData.word_study_ids.map(() => '?').join(',');
        queries.push(
          db.getAllAsync<WordStudy>(
            `SELECT id, language, original, transliteration, strongs, glosses_json as glosses, semantic_range as range, note
             FROM word_studies WHERE id IN (${placeholders})`,
            conceptData.word_study_ids
          ).then((rows) => {
            setWordStudies(rows.map(r => ({
              ...r,
              glosses: typeof r.glosses === 'string' ? JSON.parse(r.glosses) : r.glosses
            })));
          })
        );
      } else {
        setWordStudies([]);
      }

      // Prophecy chains
      if (conceptData.prophecy_chain_ids.length > 0) {
        const placeholders = conceptData.prophecy_chain_ids.map(() => '?').join(',');
        queries.push(
          db.getAllAsync<ProphecyChain>(
            `SELECT id, title, category, summary
             FROM prophecy_chains WHERE id IN (${placeholders})`,
            conceptData.prophecy_chain_ids
          ).then(setProphecyChains)
        );
      } else {
        setProphecyChains([]);
      }

      // Cross-ref threads
      if (conceptData.thread_ids.length > 0) {
        const placeholders = conceptData.thread_ids.map(() => '?').join(',');
        queries.push(
          db.getAllAsync<CrossRefThread>(
            `SELECT id, theme, tags_json, steps_json
             FROM cross_ref_threads WHERE id IN (${placeholders})`,
            conceptData.thread_ids
          ).then(setThreads)
        );
      } else {
        setThreads([]);
      }

      // People
      if (conceptData.people_tags.length > 0) {
        const placeholders = conceptData.people_tags.map(() => '?').join(',');
        queries.push(
          db.getAllAsync<Person>(
            `SELECT id, name, role, era
             FROM people WHERE id IN (${placeholders})`,
            conceptData.people_tags
          ).then(setPeople)
        );
      } else {
        setPeople([]);
      }

      // Top chapters by theme score
      if (conceptData.theme_key) {
        queries.push(
          db.getAllAsync<{
            chapter_id: string;
            content_json: string;
          }>(
            `SELECT chapter_id, content_json
             FROM chapter_panels WHERE panel_type = 'themes'`
          ).then(async (rows) => {
            const themeKey = conceptData.theme_key!;
            const matches: ChapterThemeMatch[] = [];

            for (const row of rows) {
              try {
                const content = JSON.parse(row.content_json);
                const scores = content.scores || [];
                const match = scores.find(
                  (s: { label: string; score: number }) =>
                    s.label === themeKey || s.label.toLowerCase() === themeKey.toLowerCase()
                );
                if (match && match.score > 0) {
                  // Parse chapter_id (e.g., "genesis_1" -> book=genesis, ch=1)
                  const parts = row.chapter_id.split('_');
                  const chapterNum = parseInt(parts.pop()!, 10);
                  const bookDir = parts.join('_');

                  // Get book name
                  const bookRow = await db.getFirstAsync<{ name: string }>(
                    'SELECT name FROM books WHERE id = ?',
                    [bookDir]
                  );

                  matches.push({
                    chapter_id: row.chapter_id,
                    book_dir: bookDir,
                    chapter_num: chapterNum,
                    book_name: bookRow?.name || bookDir,
                    score: match.score,
                  });
                }
              } catch {
                // Skip malformed JSON
              }
            }

            // Sort by score descending, take top 10
            matches.sort((a, b) => b.score - a.score);
            setTopChapters(matches.slice(0, 10));
          })
        );
      } else {
        setTopChapters([]);
      }

      await Promise.all(queries);
      if (cancelRef.current) return;
      setLoading(false);
    } catch (err) {
      logger.error('useConceptData', 'Failed to load concept data', err);
      setError('Failed to load concept data');
      setLoading(false);
    }
  }, [conceptId]);

  useEffect(() => {
    cancelRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    return () => { cancelRef.current = true; };
  }, [loadData]);

  return {
    concept,
    wordStudies,
    prophecyChains,
    threads,
    people,
    topChapters,
    loading,
    error,
  };
}

// Hook for loading all concepts for browse screen
export function useConcepts() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const db = getDb();
        const rows = await db.getAllAsync<{
          id: string;
          title: string;
          description: string;
          theme_key: string | null;
          word_study_ids_json: string;
          thread_ids_json: string;
          prophecy_chain_ids_json: string;
          people_tags_json: string;
          tags_json: string;
          journey_stops_json: string | null;
        }>(
          `SELECT id, title, description, theme_key,
                  word_study_ids_json, thread_ids_json,
                  prophecy_chain_ids_json, people_tags_json, tags_json,
                  journey_stops_json
           FROM concepts ORDER BY title`
        );

        setConcepts(
          rows.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            theme_key: r.theme_key ?? undefined,
            word_study_ids: JSON.parse(r.word_study_ids_json || '[]'),
            thread_ids: JSON.parse(r.thread_ids_json || '[]'),
            prophecy_chain_ids: JSON.parse(r.prophecy_chain_ids_json || '[]'),
            people_tags: JSON.parse(r.people_tags_json || '[]'),
            tags: JSON.parse(r.tags_json || '[]'),
            journey_stops: JSON.parse(r.journey_stops_json || '[]'),
          }))
        );
      } catch (err) {
        logger.error('useConcepts', 'Failed to load concepts', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { concepts, loading };
}
