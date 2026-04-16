/**
 * hooks/useExploreRecommendations.ts — Contextual Explore feature cards
 * based on the user's most recent reading activity.
 *
 * Checks reading_history for the most recent book, looks up its genre,
 * and returns 3 relevant Explore feature cards. Uses per-book overrides
 * where available, falls back to genre-based templates.
 *
 * Part of Epic #1048 (#1054).
 */

import { useState, useEffect } from 'react';
import { getRecentChapters } from '../db/user';
import { getBook } from '../db/content';
import type { FeatureCardData } from '../components/FeatureCard';
import { logger } from '../utils/logger';

export interface ExploreRecommendation extends FeatureCardData {
  bookId?: string;
  bookName?: string;
}

// ── Per-book overrides ─────────────────────────────────────────

const BOOK_RECS: Record<string, ExploreRecommendation[]> = {
  genesis: [
    { title: 'Creation',           subtitle: 'Concept you explored in Genesis',       color: '#bfa050', screen: 'JourneyBrowse', params: {} },
    { title: "Abraham's Journey",  subtitle: 'Follow the route from Ur to Canaan',    color: '#81C784', screen: 'Map',           params: { storyId: 'abraham_journey' } },
    { title: 'Covenant',           subtitle: 'Trace the idea from Genesis onward',     color: '#9090e0', screen: 'JourneyBrowse', params: {} },
  ],
  exodus: [
    { title: 'The Exodus Route',   subtitle: 'From Egypt to Sinai on the map',        color: '#81C784', screen: 'Map',           params: { storyId: 'exodus_route' } },
    { title: 'Moses',              subtitle: 'The central figure of the Torah',        color: '#e86040', screen: 'PersonDetail',  params: { personId: 'moses' } },
    { title: 'Torah & Law',        subtitle: 'What role does the law play?',           color: '#bfa050', screen: 'JourneyBrowse', params: {} },
  ],
  psalms: [
    { title: 'Hebrew Poetry',      subtitle: 'How parallelism and meter work',         color: '#7a9ab0', screen: 'GrammarBrowse', params: {} },
    { title: 'Lament',             subtitle: 'The theology of crying out to God',      color: '#bfa050', screen: 'JourneyBrowse', params: {} },
    { title: 'David',              subtitle: 'The poet behind the psalms',             color: '#e86040', screen: 'PersonDetail',  params: { personId: 'david' } },
  ],
  romans: [
    { title: 'Justification',      subtitle: "Paul's central argument unpacked",       color: '#bfa050', screen: 'JourneyBrowse', params: {} },
    { title: 'Paul',               subtitle: 'The apostle to the Gentiles',            color: '#e86040', screen: 'PersonDetail',  params: { personId: 'paul' } },
    { title: 'Faith vs Works',     subtitle: 'A debate that shaped church history',    color: '#d08080', screen: 'DebateBrowse',  params: {} },
  ],
  revelation: [
    { title: 'Apocalyptic Genre',  subtitle: 'How to read symbolic literature',        color: '#7a9ab0', screen: 'GrammarBrowse', params: {} },
    { title: 'Kingdom of God',     subtitle: 'The consummation of a biblical theme',   color: '#bfa050', screen: 'JourneyBrowse', params: {} },
    { title: 'Prophecy Chains',    subtitle: 'Trace OT promises to their conclusion',  color: '#e8a070', screen: 'ProphecyBrowse',params: {} },
  ],
};

// ── Genre-based fallbacks ──────────────────────────────────────

const GENRE_RECS: Record<string, ExploreRecommendation[]> = {
  'Theological Narrative': [
    { title: 'People',             subtitle: 'See who appears in this book',           color: '#e86040', screen: 'GenealogyTree', params: {} },
    { title: 'Map',                subtitle: 'Where does the action take place?',      color: '#81C784', screen: 'Map',           params: {} },
    { title: 'Timeline',           subtitle: 'When did this happen?',                  color: '#70b8e8', screen: 'Timeline',      params: {} },
  ],
  'Theological History': [
    { title: 'People',             subtitle: 'Key figures in this period',             color: '#e86040', screen: 'GenealogyTree', params: {} },
    { title: 'Timeline',           subtitle: 'Place these events in context',          color: '#70b8e8', screen: 'Timeline',      params: {} },
    { title: 'Map',                subtitle: 'The geography of the return',            color: '#81C784', screen: 'Map',           params: {} },
  ],
  'Prophecy': [
    { title: 'Prophecy Chains',    subtitle: 'Trace these prophecies to fulfillment',  color: '#e8a070', screen: 'ProphecyBrowse',params: {} },
    { title: 'Timeline',           subtitle: 'When did this prophet speak?',           color: '#70b8e8', screen: 'Timeline',      params: {} },
    { title: 'Scholarly Debates',  subtitle: 'Key interpretive disputes',              color: '#d08080', screen: 'DebateBrowse',  params: {} },
  ],
  'Wisdom Literature': [
    { title: 'Hebrew Poetry',      subtitle: 'How parallelism shapes meaning',         color: '#7a9ab0', screen: 'GrammarBrowse', params: {} },
    { title: 'Word Studies',       subtitle: 'Key Hebrew terms in wisdom',             color: '#e890b8', screen: 'WordStudyBrowse',params: {} },
    { title: 'Concepts',           subtitle: 'Wisdom, fear of the Lord & more',        color: '#bfa050', screen: 'JourneyBrowse', params: {} },
  ],
  'Hebrew Poetry': [
    { title: 'Hebrew Poetry',      subtitle: 'How parallelism and meter work',         color: '#7a9ab0', screen: 'GrammarBrowse', params: {} },
    { title: 'Word Studies',       subtitle: 'Key Hebrew terms in the psalms',         color: '#e890b8', screen: 'WordStudyBrowse',params: {} },
    { title: 'Concepts',           subtitle: 'Praise, lament, trust & more',           color: '#bfa050', screen: 'JourneyBrowse', params: {} },
  ],
  'Lament Poetry': [
    { title: 'Lament',             subtitle: 'The theology of crying out to God',      color: '#bfa050', screen: 'JourneyBrowse', params: {} },
    { title: 'Hebrew Poetry',      subtitle: 'Acrostic structure and meter',           color: '#7a9ab0', screen: 'GrammarBrowse', params: {} },
    { title: 'Timeline',           subtitle: 'The fall of Jerusalem in context',       color: '#70b8e8', screen: 'Timeline',      params: {} },
  ],
  'Love Poetry': [
    { title: 'Hebrew Poetry',      subtitle: 'The literary art of Song of Solomon',    color: '#7a9ab0', screen: 'GrammarBrowse', params: {} },
    { title: 'Scholarly Debates',  subtitle: 'Allegorical or literal?',                color: '#d08080', screen: 'DebateBrowse',  params: {} },
    { title: 'Word Studies',       subtitle: 'Love, beauty, and desire in Hebrew',     color: '#e890b8', screen: 'WordStudyBrowse',params: {} },
  ],
  'Ritual Law': [
    { title: 'Atonement',          subtitle: 'The sacrificial system and its meaning', color: '#bfa050', screen: 'JourneyBrowse', params: {} },
    { title: 'Word Studies',       subtitle: 'Holiness, clean, and unclean in Hebrew', color: '#e890b8', screen: 'WordStudyBrowse',params: {} },
    { title: 'Scholarly Debates',  subtitle: 'How should modern readers approach law?',color: '#d08080', screen: 'DebateBrowse',  params: {} },
  ],
  'Covenant Law': [
    { title: 'Covenant',           subtitle: 'The treaty structure behind Deuteronomy',color: '#bfa050', screen: 'JourneyBrowse', params: {} },
    { title: 'Ancient Sources',    subtitle: 'ANE treaty parallels',                   color: '#b07d4f', screen: 'ArchaeologyBrowse',params: {} },
    { title: 'Torah & Law',        subtitle: 'What role does the law play?',           color: '#bfa050', screen: 'JourneyBrowse', params: {} },
  ],
  'Gospel': [
    { title: 'Gospel Harmony',     subtitle: 'Compare across all 4 Gospels',           color: '#70d098', screen: 'HarmonyBrowse', params: {} },
    { title: 'Jesus',              subtitle: 'The central figure of the Gospels',      color: '#e86040', screen: 'PersonDetail',  params: { personId: 'jesus' } },
    { title: 'Prophecy Chains',    subtitle: 'OT prophecies fulfilled in the Gospels', color: '#e8a070', screen: 'ProphecyBrowse',params: {} },
  ],
  'Epistle': [
    { title: 'Argument Flow',      subtitle: 'Follow the logic of the letter',         color: '#7a9ab0', screen: 'GrammarBrowse', params: {} },
    { title: 'Word Studies',       subtitle: 'Key Greek terms in this letter',         color: '#e890b8', screen: 'WordStudyBrowse',params: {} },
    { title: 'Concepts',           subtitle: 'Grace, faith, sanctification & more',    color: '#bfa050', screen: 'JourneyBrowse', params: {} },
  ],
  'Apocalyptic': [
    { title: 'Apocalyptic Genre',  subtitle: 'How to read symbolic literature',        color: '#7a9ab0', screen: 'GrammarBrowse', params: {} },
    { title: 'Prophecy Chains',    subtitle: 'Trace these visions to their OT roots',  color: '#e8a070', screen: 'ProphecyBrowse',params: {} },
    { title: 'Scholarly Debates',  subtitle: 'Preterist, futurist, or idealist?',      color: '#d08080', screen: 'DebateBrowse',  params: {} },
  ],
};

// ── Hook ───────────────────────────────────────────────────────

export function useExploreRecommendations(): {
  recommendations: ExploreRecommendation[];
  bookName: string | null;
  isLoading: boolean;
} {
  const [recommendations, setRecommendations] = useState<ExploreRecommendation[]>([]);
  const [bookName, setBookName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const recent = await getRecentChapters(1);
        if (cancelled) return;

        if (recent.length === 0) {
          setRecommendations([]);
          setBookName(null);
          setIsLoading(false);
          return;
        }

        const bookId = recent[0].book_id;
        const book = await getBook(bookId);
        if (cancelled) return;

        const name = book?.name ?? bookId;
        setBookName(name);

        // Try per-book overrides first
        if (BOOK_RECS[bookId]) {
          setRecommendations(BOOK_RECS[bookId]);
          setIsLoading(false);
          return;
        }

        // Fall back to genre
        const genre = book?.genre_label ?? '';
        const genreRecs = GENRE_RECS[genre];
        if (genreRecs) {
          setRecommendations(genreRecs);
        } else {
          // Ultimate fallback — generic
          setRecommendations([
            { title: 'People',    subtitle: 'See who appears in the text', color: '#e86040', screen: 'GenealogyTree', params: {} },
            { title: 'Timeline',  subtitle: 'Place events in context',     color: '#70b8e8', screen: 'Timeline',      params: {} },
            { title: 'Concepts',  subtitle: 'Trace themes across the Bible',color: '#bfa050', screen: 'JourneyBrowse', params: {} },
          ]);
        }
      } catch (err) {
        logger.warn('useExploreRecommendations', 'Failed to load', err);
        setRecommendations([]);
      }
      if (!cancelled) setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { recommendations, bookName, isLoading };
}
