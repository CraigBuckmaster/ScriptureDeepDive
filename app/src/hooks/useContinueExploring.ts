/**
 * hooks/useContinueExploring.ts — Extract Explore feature links from chapter data.
 *
 * Returns up to 6 cards linking to Explore screens based on what's available
 * in the current chapter (timeline link, map link, people, debates, themes, etc.).
 * All data is already loaded by useChapterData — no new DB queries.
 *
 * Part of Epic #1048 (#1053).
 */

import { useMemo } from 'react';
import type { ChapterPanel } from '../types';

export interface ExploreCard {
  type: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  screen: string;
  params: Record<string, any>;
}

interface ChapterMeta {
  timeline_link_event?: string | null;
  timeline_link_text?: string | null;
  map_story_link_id?: string | null;
  map_story_link_text?: string | null;
  book_name?: string;
}

function tryParseJson(json: string): any {
  try { return JSON.parse(json); } catch { return null; }
}

function extractPeople(panel: ChapterPanel): ExploreCard[] {
  const data = tryParseJson(panel.content_json);
  if (!data) return [];
  // People panel is typically { people: [{ name, id, ... }] } or similar
  const raw = data.people ?? data.entries ?? (Array.isArray(data) ? data : []);
  const people = Array.isArray(raw) ? raw : [];
  return people.slice(0, 2).map((p: any) => ({
    type: 'people',
    title: p.name ?? p.label ?? 'Person',
    subtitle: p.role ?? p.description?.slice(0, 40) ?? 'Biblical figure',
    icon: '👤',
    color: '#e86040',
    screen: 'PersonDetail',
    params: { personId: p.id ?? p.name },
  }));
}

function extractDebate(panel: ChapterPanel): ExploreCard | null {
  const data = tryParseJson(panel.content_json);
  if (!data) return null;
  const title = data.title ?? data.question ?? data.topic ?? 'Scholarly debate';
  return {
    type: 'debate',
    title: typeof title === 'string' ? (title.length > 35 ? title.slice(0, 32) + '…' : title) : 'Debate',
    subtitle: 'Scholarly debate',
    icon: '⚖',
    color: '#d08080',
    screen: 'DebateDetail',
    params: { debateId: data.id ?? data.debate_id },
  };
}

function extractThemes(panel: ChapterPanel): ExploreCard | null {
  const data = tryParseJson(panel.content_json);
  if (!data) return null;
  const themes = data.themes ?? data.entries ?? (Array.isArray(data) ? data : []);
  const first = themes[0];
  if (!first) return null;
  const name = first.name ?? first.theme ?? first.label ?? 'Theme';
  return {
    type: 'concept',
    title: typeof name === 'string' ? name : 'Theme',
    subtitle: 'Concept theme',
    icon: '✦',
    color: '#bfa050',
    screen: 'ConceptBrowse',
    params: {},
  };
}

const MAX_CARDS = 6;

export function useContinueExploring(
  chapter: ChapterMeta | null | undefined,
  chapterPanels: ChapterPanel[],
): ExploreCard[] {
  return useMemo(() => {
    if (!chapter) return [];

    const cards: ExploreCard[] = [];
    const panelMap = new Map(chapterPanels.map((p) => [p.panel_type, p]));

    // Priority 1: People
    const pplPanel = panelMap.get('ppl');
    if (pplPanel) {
      cards.push(...extractPeople(pplPanel));
    }

    // Priority 2: Timeline
    if (chapter.timeline_link_event) {
      cards.push({
        type: 'timeline',
        title: 'Timeline',
        subtitle: chapter.timeline_link_text ?? 'See on the timeline',
        icon: '⏱',
        color: '#70b8e8',
        screen: 'Timeline',
        params: { eventId: chapter.timeline_link_event },
      });
    }

    // Priority 3: Map
    if (chapter.map_story_link_id) {
      cards.push({
        type: 'map',
        title: 'Map',
        subtitle: chapter.map_story_link_text ?? 'See on the map',
        icon: '📍',
        color: '#81C784',
        screen: 'Map',
        params: { storyId: chapter.map_story_link_id },
      });
    }

    // Priority 4: Debate
    const debatePanel = panelMap.get('debate');
    if (debatePanel) {
      const card = extractDebate(debatePanel);
      if (card) cards.push(card);
    }

    // Priority 5: Themes → concept
    const themesPanel = panelMap.get('themes');
    if (themesPanel) {
      const card = extractThemes(themesPanel);
      if (card) cards.push(card);
    }

    return cards.slice(0, MAX_CARDS);
  }, [chapter, chapterPanels]);
}
