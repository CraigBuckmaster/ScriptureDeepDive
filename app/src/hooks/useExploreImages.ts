/**
 * hooks/useExploreImages.ts — Load the explore-images registry and merge
 * archaeology images from discoveries.json at runtime.
 *
 * Returns a map of sectionId → screenName → ExploreFeatureImages.
 *
 * Part of Epic #1071 (#1074).
 */

import { useMemo } from 'react';
import type { ExploreImage, ExploreFeatureImages } from '../types';
import rawRegistry from '../../../content/meta/explore-images.json';
import rawDiscoveries from '../../../content/archaeology/discoveries.json';

type RawSection = Record<string, {
  count: number | null;
  noun: string;
  images: string | RawImageEntry[];
}>;

interface RawImageEntry {
  url: string;
  caption: string;
  credit: string;
  deepLink?: { screen: string; params?: Record<string, string> };
}

interface RawDiscovery {
  id: string;
  images?: Array<{ url: string; caption: string; credit: string }>;
}

type ImageRegistry = Record<string, Record<string, ExploreFeatureImages>>;

function buildArchaeologyImages(): ExploreImage[] {
  const images: ExploreImage[] = [];
  for (const d of rawDiscoveries as RawDiscovery[]) {
    const discoveryImages = d.images;
    if (!discoveryImages?.length) continue;
    // Take the first image per discovery for the card carousel
    const img = discoveryImages[0];
    images.push({
      url: img.url.replace(/\/(\d+)px-/, '/400px-'),
      caption: img.caption,
      credit: img.credit,
      deepLink: { screen: 'ArchaeologyDetail', params: { discoveryId: d.id } },
    });
    if (images.length >= 6) break;
  }
  return images;
}

function buildRegistry(): ImageRegistry {
  const registry: ImageRegistry = {};
  const archImages = buildArchaeologyImages();

  for (const [sectionId, screens] of Object.entries(rawRegistry as Record<string, RawSection>)) {
    registry[sectionId] = {};
    for (const [screenName, data] of Object.entries(screens)) {
      const images: ExploreImage[] =
        data.images === '__ARCHAEOLOGY__'
          ? archImages
          : (data.images as RawImageEntry[]).map((img) => ({
              url: img.url,
              caption: img.caption,
              credit: img.credit,
              deepLink: img.deepLink ?? { screen: screenName },
            }));

      registry[sectionId][screenName] = {
        count: data.count,
        noun: data.noun,
        images,
      };
    }
  }

  return registry;
}

export function useExploreImages(): ImageRegistry {
  return useMemo(() => buildRegistry(), []);
}
