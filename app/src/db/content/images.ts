/**
 * db/content/images.ts — Query functions for the content_images table.
 *
 * Provides single-item and batch lookups for content images.
 * Used by detail screens (via useContentImages) and Explore cards
 * (via useExploreImages resolving featured IDs).
 *
 * Part of Epic #1071 (#1087).
 */

import { getDb } from '../database';
import type { ContentImage } from '../../types';

/**
 * Get all images for a specific content item.
 * Used by detail screens to show a gallery.
 */
export async function getContentImages(
  contentType: string,
  contentId: string,
): Promise<ContentImage[]> {
  return getDb().getAllAsync<ContentImage>(
    'SELECT * FROM content_images WHERE content_type = ? AND content_id = ? ORDER BY display_order',
    [contentType, contentId],
  );
}

/**
 * Get images for multiple content items (batch lookup).
 * Used by Explore cards to resolve featured item IDs to images.
 * Returns images grouped by content_id (first image per item).
 */
export async function getFeaturedImages(
  contentType: string,
  contentIds: string[],
): Promise<ContentImage[]> {
  if (contentIds.length === 0) return [];

  const placeholders = contentIds.map(() => '?').join(',');
  return getDb().getAllAsync<ContentImage>(
    `SELECT * FROM content_images
     WHERE content_type = ? AND content_id IN (${placeholders})
     ORDER BY content_id, display_order`,
    [contentType, ...contentIds],
  );
}
