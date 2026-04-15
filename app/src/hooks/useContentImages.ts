/**
 * hooks/useContentImages.ts — Load images for a single content item.
 *
 * For detail screens: pass a content type + ID, get back the images
 * from the content_images SQLite table.
 *
 * Part of Epic #1071 (#1087).
 */

import { useState, useEffect } from 'react';
import { getContentImages } from '../db/content/images';
import type { ContentImage } from '../types';
import { logger } from '../utils/logger';

export function useContentImages(
  contentType: string,
  contentId: string | undefined,
): { images: ContentImage[]; isLoading: boolean } {
  const [images, setImages] = useState<ContentImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!contentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    getContentImages(contentType, contentId)
      .then((result) => {
        if (!cancelled) {
          setImages(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        logger.warn('useContentImages', `Failed to load ${contentType}/${contentId}`, err);
        if (!cancelled) {
          setImages([]);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [contentType, contentId]);

  return { images, isLoading };
}
