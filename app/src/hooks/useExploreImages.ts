/**
 * hooks/useExploreImages.ts — Resolve explore card images from the manifest.
 *
 * The manifest (explore-images.json) is a thin list of featured content IDs + counts.
 * This hook resolves those IDs to actual images via SQLite:
 *   - Entries with contentType + featured[] → query content_images or archaeology_images
 *   - Entries with inline images[] → use directly (tool-level features)
 *
 * Returns the same ExploreFeatureImages interface — no card component changes needed.
 *
 * Part of Epic #1071 (#1086).
 */

import { useState, useEffect } from 'react';
import type { ExploreImage, ExploreFeatureImages } from '../types';
import { getFeaturedImages } from '../db/content/images';
import { getDb } from '../db/database';
import rawManifest from '../../assets/explore-images.json';

// ── Deep-link resolver: content_type + content_id → screen + params ──

const CONTENT_TYPE_TO_SCREEN: Record<string, { screen: string; paramKey: string }> = {
  people: { screen: 'GenealogyTree', paramKey: 'personId' },
  timeline: { screen: 'Timeline', paramKey: 'eventId' },
  map_story: { screen: 'Map', paramKey: 'storyId' },
  concept: { screen: 'ConceptDetail', paramKey: 'conceptId' },
  topic: { screen: 'TopicBrowse', paramKey: 'topicId' },
  prophecy: { screen: 'ProphecyDetail', paramKey: 'chainId' },
  thread: { screen: 'ThreadBrowse', paramKey: 'threadId' },
  harmony: { screen: 'HarmonyBrowse', paramKey: 'entryId' },
  word_study: { screen: 'WordStudyDetail', paramKey: 'wordId' },
  scholar: { screen: 'ScholarBrowse', paramKey: 'scholarId' },
  debate: { screen: 'DebateBrowse', paramKey: 'debateId' },
  difficult: { screen: 'DifficultPassagesBrowse', paramKey: 'passageId' },
  life_topic: { screen: 'LifeTopics', paramKey: 'topicId' },
  archaeology: { screen: 'ArchaeologyDetail', paramKey: 'discoveryId' },
  book: { screen: 'Chapter', paramKey: 'bookId' },
};

type ImageRegistry = Record<string, ExploreFeatureImages>;

interface ManifestEntry {
  count: number | null;
  noun: string;
  contentType: string | null;
  featured?: string[];
  images?: Array<{ url: string; caption: string; credit: string }>;
}

async function getArchaeologyImages(ids: string[]): Promise<ExploreImage[]> {
  if (ids.length === 0) return [];

  const placeholders = ids.map(() => '?').join(',');
  const rows = await getDb().getAllAsync<{
    discovery_id: string;
    url: string;
    caption: string | null;
    credit: string | null;
    display_order: number;
  }>(
    `SELECT * FROM archaeology_images
     WHERE discovery_id IN (${placeholders})
     ORDER BY discovery_id, display_order`,
    ids,
  );

  // Take the first image per discovery
  const seen = new Set<string>();
  const images: ExploreImage[] = [];
  for (const row of rows) {
    if (seen.has(row.discovery_id)) continue;
    seen.add(row.discovery_id);
    images.push({
      url: row.url,
      caption: row.caption ?? '',
      credit: row.credit ?? '',
      deepLink: { screen: 'ArchaeologyDetail', params: { discoveryId: row.discovery_id } },
    });
  }
  return images;
}

async function resolveManifest(): Promise<ImageRegistry> {
  const manifest = rawManifest as Record<string, ManifestEntry>;
  const registry: ImageRegistry = {};

  for (const [screenName, entry] of Object.entries(manifest)) {
    // Tool-level features with inline images
    if (!entry.contentType || !entry.featured || entry.featured.length === 0) {
      const inlineImages: ExploreImage[] = (entry.images ?? []).map((img) => ({
        url: img.url,
        caption: img.caption,
        credit: img.credit,
        deepLink: { screen: screenName },
      }));
      registry[screenName] = {
        count: entry.count,
        noun: entry.noun,
        images: inlineImages,
      };
      continue;
    }

    // Content-backed features: resolve from SQLite
    let images: ExploreImage[];

    if (entry.contentType === 'archaeology') {
      images = await getArchaeologyImages(entry.featured);
    } else {
      const rows = await getFeaturedImages(entry.contentType, entry.featured);
      const screenInfo = CONTENT_TYPE_TO_SCREEN[entry.contentType];

      // Take first image per content_id
      const seen = new Set<string>();
      images = [];
      for (const row of rows) {
        if (seen.has(row.content_id)) continue;
        seen.add(row.content_id);
        images.push({
          url: row.url,
          caption: row.caption ?? '',
          credit: row.credit ?? '',
          deepLink: screenInfo
            ? { screen: screenInfo.screen, params: { [screenInfo.paramKey]: row.content_id } }
            : { screen: screenName },
        });
      }
    }

    registry[screenName] = {
      count: entry.count,
      noun: entry.noun,
      images,
    };
  }

  return registry;
}

/**
 * Load the explore images registry.
 * Returns a flat map: screenName → ExploreFeatureImages.
 */
export function useExploreImages(): Record<string, ExploreFeatureImages> {
  const [registry, setRegistry] = useState<ImageRegistry>({});

  useEffect(() => {
    let cancelled = false;
    resolveManifest()
      .then((result) => {
        if (!cancelled) setRegistry(result);
      })
      .catch(() => {
        // Silently degrade — cards will use fallback strips
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return registry;
}
