/**
 * useDifficultPassages — Data hooks for difficult passage content.
 *
 * Provides list view for browse screen and detailed view with
 * scholar info and related chapters for detail screen.
 */

import { useState, useEffect, useCallback } from 'react';
import { getDb } from '../db/database';
import { logger } from '../utils/logger';

export type DifficultPassageCategory = 
  | 'ethical'
  | 'contradiction'
  | 'theological'
  | 'historical'
  | 'textual';

export type DifficultPassageSeverity = 'minor' | 'moderate' | 'major';

export interface DifficultPassageResponse {
  tradition: string;
  scholar_id: string;
  summary: string;
}

export interface RelatedChapter {
  book_dir: string;
  chapter_num: number;
}

export interface DifficultPassage {
  id: string;
  title: string;
  category: DifficultPassageCategory;
  severity: DifficultPassageSeverity;
  passage: string;
  question: string;
  responses: DifficultPassageResponse[];
  related_chapters: RelatedChapter[];
  tags: string[];
}

export interface Scholar {
  id: string;
  name: string;
  tradition: string;
}

export interface RelatedChapterWithName extends RelatedChapter {
  book_name: string;
}

export interface DifficultPassageDetailData {
  passage: DifficultPassage | null;
  scholars: Map<string, Scholar>;
  relatedChapters: RelatedChapterWithName[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for browse screen — returns all passages with basic info.
 */
export function useDifficultPassages() {
  const [passages, setPassages] = useState<DifficultPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const db = getDb();
        const rows = await db.getAllAsync<{
          id: string;
          title: string;
          category: string;
          severity: string;
          passage: string;
          question: string;
          responses_json: string;
          related_chapters_json: string | null;
          tags_json: string | null;
        }>(
          `SELECT id, title, category, severity, passage, question,
                  responses_json, related_chapters_json, tags_json
           FROM difficult_passages
           ORDER BY title`
        );

        const parsed: DifficultPassage[] = rows.map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category as DifficultPassageCategory,
          severity: row.severity as DifficultPassageSeverity,
          passage: row.passage,
          question: row.question,
          responses: JSON.parse(row.responses_json || '[]'),
          related_chapters: JSON.parse(row.related_chapters_json || '[]'),
          tags: JSON.parse(row.tags_json || '[]'),
        }));

        setPassages(parsed);
      } catch (err) {
        logger.error('useDifficultPassages', err);
        setError('Failed to load difficult passages');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { passages, loading, error };
}

/**
 * Hook for detail screen — returns single passage with scholar info and book names.
 */
export function useDifficultPassage(passageId: string | undefined): DifficultPassageDetailData {
  const [passage, setPassage] = useState<DifficultPassage | null>(null);
  const [scholars, setScholars] = useState<Map<string, Scholar>>(new Map());
  const [relatedChapters, setRelatedChapters] = useState<RelatedChapterWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!passageId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const db = getDb();

      // 1. Load passage record
      const row = await db.getFirstAsync<{
        id: string;
        title: string;
        category: string;
        severity: string;
        passage: string;
        question: string;
        responses_json: string;
        related_chapters_json: string | null;
        tags_json: string | null;
      }>(
        `SELECT id, title, category, severity, passage, question,
                responses_json, related_chapters_json, tags_json
         FROM difficult_passages WHERE id = ?`,
        [passageId]
      );

      if (!row) {
        setError('Passage not found');
        setLoading(false);
        return;
      }

      const passageData: DifficultPassage = {
        id: row.id,
        title: row.title,
        category: row.category as DifficultPassageCategory,
        severity: row.severity as DifficultPassageSeverity,
        passage: row.passage,
        question: row.question,
        responses: JSON.parse(row.responses_json || '[]'),
        related_chapters: JSON.parse(row.related_chapters_json || '[]'),
        tags: JSON.parse(row.tags_json || '[]'),
      };
      setPassage(passageData);

      // 2. Fetch scholar details for responses
      const scholarIds = passageData.responses.map((r) => r.scholar_id);
      if (scholarIds.length > 0) {
        const placeholders = scholarIds.map(() => '?').join(',');
        const scholarRows = await db.getAllAsync<{
          id: string;
          name: string;
          tradition: string;
        }>(
          `SELECT id, name, tradition FROM scholars
           WHERE id IN (${placeholders})`,
          scholarIds
        );

        const scholarMap = new Map<string, Scholar>();
        for (const s of scholarRows) {
          scholarMap.set(s.id, {
            id: s.id,
            name: s.name,
            tradition: s.tradition,
          });
        }
        setScholars(scholarMap);
      } else {
        setScholars(new Map());
      }

      // 3. Fetch book names for related chapters
      if (passageData.related_chapters.length > 0) {
        const bookIds = [...new Set(passageData.related_chapters.map((rc) => rc.book_dir))];
        const placeholders = bookIds.map(() => '?').join(',');
        const bookRows = await db.getAllAsync<{ id: string; name: string }>(
          `SELECT id, name FROM books WHERE id IN (${placeholders})`,
          bookIds
        );

        const bookNameMap = new Map<string, string>();
        for (const b of bookRows) {
          bookNameMap.set(b.id, b.name);
        }

        const chaptersWithNames: RelatedChapterWithName[] = passageData.related_chapters.map(
          (rc) => ({
            ...rc,
            book_name: bookNameMap.get(rc.book_dir) || rc.book_dir,
          })
        );
        setRelatedChapters(chaptersWithNames);
      } else {
        setRelatedChapters([]);
      }

      setLoading(false);
    } catch (err) {
      logger.error('useDifficultPassage', err);
      setError('Failed to load passage data');
      setLoading(false);
    }
  }, [passageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { passage, scholars, relatedChapters, loading, error };
}
