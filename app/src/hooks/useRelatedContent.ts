/**
 * hooks/useRelatedContent.ts — Build related content cards for a chapter.
 *
 * Extracts navigational content (Timeline, Map, People, Word studies,
 * Prophecy chains, Cross-ref threads, Archaeology) from chapter data
 * and resolves content_images for each card.
 *
 * Replaces useContinueExploring. Part of Epic #1130 (#HOOK).
 */

import { useState, useEffect, useMemo } from 'react';
import type { ChapterPanel } from '../types';
import type { RelatedContentItem } from '../components/RelatedContentCard';
import { getFeaturedImages } from '../db/content/images';

interface ChapterMeta {
  id?: string;
  book_id?: string;
  chapter_num?: number;
  timeline_link_event?: string | null;
  timeline_link_text?: string | null;
  map_story_link_id?: string | null;
  map_story_link_text?: string | null;
}

function tryParseJson(json: string): unknown {
  try { return JSON.parse(json); } catch { return null; }
}

const MAX_CARDS = 8;

/**
 * Extract base card data from chapter metadata and panels.
 * Pure extraction — no async/DB calls.
 */
function extractCards(
  chapter: ChapterMeta,
  chapterPanels: ChapterPanel[],
): RelatedContentItem[] {
  const cards: RelatedContentItem[] = [];
  const panelMap = new Map(chapterPanels.map((p) => [p.panel_type, p]));

  // Timeline
  if (chapter.timeline_link_event) {
    cards.push({
      type: 'timeline',
      title: 'Timeline Event',
      snippet: chapter.timeline_link_text ?? 'See this event on the interactive timeline',
      color: '#bfa050', // theme: Scroll Gold
      screen: 'Timeline',
      params: { eventId: chapter.timeline_link_event },
      imageUrl: null,
      label: 'Timeline',
    });
  }

  // Map
  if (chapter.map_story_link_id) {
    cards.push({
      type: 'map',
      title: 'Map Journey',
      snippet: chapter.map_story_link_text ?? 'Trace this journey on the interactive map',
      color: '#bfa050', // theme: Scroll Gold
      screen: 'Map',
      params: { storyId: chapter.map_story_link_id },
      imageUrl: null,
      label: 'Journey',
    });
  }

  // People (from ppl panel)
  const pplPanel = panelMap.get('ppl');
  if (pplPanel) {
    const data = tryParseJson(pplPanel.content_json) as Record<string, unknown> | null;
    if (data) {
      const raw = data.people ?? data.entries ?? (Array.isArray(data) ? data : []);
      const people = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
      for (const p of people.slice(0, 2)) {
        cards.push({
          type: 'people',
          title: (p.name as string) ?? (p.label as string) ?? 'Person',
          snippet: (p.role as string) ?? (p.bio as string)?.slice(0, 60) ?? (p.description as string)?.slice(0, 60) ?? 'Biblical figure',
          color: '#bfa050', // theme: Scroll Gold
          screen: 'PersonDetail',
          params: { personId: (p.id as string) ?? (p.name as string) },
          imageUrl: null,
          label: 'Person',
        });
      }
    }
  }

  // Debate
  const debatePanel = panelMap.get('debate');
  if (debatePanel) {
    const data = tryParseJson(debatePanel.content_json) as Record<string, unknown> | null;
    if (data) {
      const title = data.title ?? data.question ?? data.topic ?? 'Scholarly debate';
      cards.push({
        type: 'debate',
        title: typeof title === 'string' ? (title.length > 40 ? title.slice(0, 37) + '…' : title) : 'Debate',
        snippet: 'Scholarly debate with multiple positions',
        color: '#bfa050', // theme: Scroll Gold
        screen: 'DebateDetail',
        params: { topicId: (data.id as string) ?? (data.debate_id as string) },
        imageUrl: null,
        label: 'Debate',
      });
    }
  }

  // Themes → concept
  const themesPanel = panelMap.get('themes');
  if (themesPanel) {
    const data = tryParseJson(themesPanel.content_json) as Record<string, unknown> | null;
    if (data) {
      const themes = (data.themes as unknown[]) ?? (data.entries as unknown[]) ?? (Array.isArray(data) ? data : []);
      const first = themes[0] as Record<string, unknown> | undefined;
      if (first) {
        const name = first.name ?? first.theme ?? first.label ?? 'Theme';
        cards.push({
          type: 'concept',
          title: typeof name === 'string' ? name : 'Theme',
          snippet: 'Trace this concept across Scripture',
          color: '#bfa050',
          screen: 'ConceptBrowse',
          params: {},
          imageUrl: null,
          label: 'Concept',
        });
      }
    }
  }

  return cards.slice(0, MAX_CARDS);
}

/** Content type mapping for image lookups. */
const TYPE_TO_CONTENT_TYPE: Record<string, string> = {
  timeline: 'timeline',
  map: 'map_story',
  people: 'people',
  debate: 'debate',
  concept: 'concept',
};

/**
 * Hook that builds related content cards with image resolution.
 * Replaces useContinueExploring.
 */
export function useRelatedContent(
  chapter: ChapterMeta | null | undefined,
  chapterPanels: ChapterPanel[],
): RelatedContentItem[] {
  const baseCards = useMemo(() => {
    if (!chapter) return [];
    return extractCards(chapter, chapterPanels);
  }, [chapter, chapterPanels]);

  const [items, setItems] = useState<RelatedContentItem[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (baseCards.length === 0) { setItems([]); return; }
    let cancelled = false;

    async function resolveImages() {
      // Group cards by content type for batch image lookups
      const groups: Record<string, { contentIds: string[]; indices: number[] }> = {};
      baseCards.forEach((card, i) => {
        const ct = TYPE_TO_CONTENT_TYPE[card.type];
        if (!ct) return;
        // Extract the content ID from the card params
        const contentId = (card.params.eventId ?? card.params.storyId ??
          card.params.personId ?? card.params.topicId ?? null) as string | null;
        if (!contentId) return;
        if (!groups[ct]) groups[ct] = { contentIds: [], indices: [] };
        groups[ct].contentIds.push(contentId);
        groups[ct].indices.push(i);
      });

      // Batch fetch images per content type
      const imageMap: Record<string, string> = {};
      await Promise.all(
        Object.entries(groups).map(async ([ct, { contentIds }]) => {
          const images = await getFeaturedImages(ct, contentIds);
          // Take first image per content_id
          const seen = new Set<string>();
          for (const img of images) {
            if (!seen.has(img.content_id)) {
              seen.add(img.content_id);
              imageMap[`${ct}:${img.content_id}`] = img.url;
            }
          }
        }),
      );

      if (cancelled) return;

      // Merge images into cards
      const enriched = baseCards.map((card) => {
        const ct = TYPE_TO_CONTENT_TYPE[card.type];
        const contentId = (card.params.eventId ?? card.params.storyId ??
          card.params.personId ?? card.params.topicId ?? null) as string | null;
        const key = ct && contentId ? `${ct}:${contentId}` : '';
        return {
          ...card,
          imageUrl: imageMap[key] ?? null,
        };
      });

      setItems(enriched);
    }

    resolveImages();
    return () => { cancelled = true; };
  }, [baseCards]);

  return items;
}
