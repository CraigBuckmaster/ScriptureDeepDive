/**
 * useRecommendations — Heuristic recommendation engine for HomeScreen.
 *
 * Generates 2-4 contextual suggestions based on reading history,
 * study depth, and feature usage. No AI — simple rule-based logic.
 */

import { useState, useEffect } from 'react';
import { getUserDb } from '../db/userDatabase';
import { logger } from '../utils/logger';

export interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  screen: string;
  params?: object;
  priority: number;
}

// ── Heuristic rules ─────────────────────────────────────────────────

async function generateRecommendations(): Promise<Recommendation[]> {
  const db = getUserDb();
  const recs: Recommendation[] = [];

  try {
    // Total chapters read
    const totalRow = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM reading_progress"
    );
    const totalChapters = totalRow?.count ?? 0;

    // Books read (distinct)
    const booksRead = await db.getAllAsync<{ book_id: string; count: number }>(
      "SELECT book_id, COUNT(*) as count FROM reading_progress GROUP BY book_id ORDER BY count DESC"
    );
    const bookSet = new Set(booksRead.map((b) => b.book_id));

    // Study depth count
    const depthRow = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM study_depth"
    );
    const panelsOpened = depthRow?.count ?? 0;

    // Hebrew panel opens
    const hebRow = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM study_depth WHERE panel_type = 'heb'"
    );
    const hebOpens = hebRow?.count ?? 0;

    // ── Rule: Genesis reader → Covenant concept
    if (bookSet.has('genesis')) {
      const genCount = booksRead.find((b) => b.book_id === 'genesis')?.count ?? 0;
      if (genCount >= 3) {
        recs.push({
          id: 'covenant-concept',
          title: 'Explore the Covenant',
          subtitle: "Trace the theme from Genesis through Revelation",
          screen: 'ExploreTab',
          params: { screen: 'ConceptDetail', params: { id: 'covenant' } },
          priority: 80,
        });
      }
    }

    // ── Rule: Prophecy-rich book reader → Prophecy chains
    const prophecyBooks = ['isaiah', 'jeremiah', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'revelation'];
    const readProphecyBook = prophecyBooks.some((b) => bookSet.has(b));
    if (readProphecyBook) {
      recs.push({
        id: 'prophecy-chains',
        title: 'Trace Prophecy Fulfillment',
        subtitle: 'Follow themes from promise to completion',
        screen: 'ExploreTab',
        params: { screen: 'ProphecyBrowse' },
        priority: 75,
      });
    }

    // ── Rule: 10+ chapters in any book → People of that book
    const deepBook = booksRead.find((b) => b.count >= 10);
    if (deepBook) {
      const bookName = deepBook.book_id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      recs.push({
        id: 'people-of-book',
        title: `People of ${bookName}`,
        subtitle: 'Lives that shaped this story',
        screen: 'ExploreTab',
        params: { screen: 'GenealogyTree' },
        priority: 60,
      });
    }

    // ── Rule: Hebrew panels opened 5+ → Word studies
    if (hebOpens >= 5) {
      recs.push({
        id: 'word-studies',
        title: 'Dive Deeper: Word Studies',
        subtitle: 'Meaning in the original languages',
        screen: 'ExploreTab',
        params: { screen: 'WordStudyBrowse' },
        priority: 70,
      });
    }

    // ── Rule: Never visited difficult passages → suggest
    if (totalChapters >= 5) {
      recs.push({
        id: 'difficult-passages',
        title: 'Wrestle with Hard Texts',
        subtitle: 'Scholars weigh in on challenging passages',
        screen: 'ExploreTab',
        params: { screen: 'DifficultPassageBrowse' },
        priority: 40,
      });
    }

    // ── Rule: Low panel engagement → encourage depth
    if (totalChapters >= 10 && panelsOpened < 5) {
      recs.push({
        id: 'go-deeper',
        title: 'Go Deeper',
        subtitle: 'Tap panel buttons below each section to explore commentary',
        screen: 'ExploreTab',
        params: { screen: 'ScholarBrowse' },
        priority: 50,
      });
    }

    // ── Rule: Timeline suggestion for early readers
    if (totalChapters >= 3 && totalChapters < 30) {
      recs.push({
        id: 'timeline',
        title: 'See the Big Picture',
        subtitle: 'The arc of redemption across history',
        screen: 'ExploreTab',
        params: { screen: 'Timeline' },
        priority: 55,
      });
    }

    // ── Rule: Gospel readers → Parallel passages
    const gospels = ['matthew', 'mark', 'luke', 'john'];
    const gospelsRead = gospels.filter((g) => bookSet.has(g));
    if (gospelsRead.length >= 2) {
      recs.push({
        id: 'parallel-passages',
        title: 'Compare the Accounts',
        subtitle: 'Side-by-side Gospel comparison',
        screen: 'ExploreTab',
        params: { screen: 'ParallelPassage' },
        priority: 65,
      });
    }
  } catch (err) {
    logger.warn('useRecommendations', 'Failed to generate recommendations', err);
  }

  // Sort by priority descending, return top 4
  return recs.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

// ── Hook ─────────────────────────────────────��─────────────────────

export function useRecommendations(): Recommendation[] {
  const [recs, setRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    generateRecommendations().then(setRecs);
  }, []);

  return recs;
}
