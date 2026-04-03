/**
 * useTopicBookmark — Hook for topic-level bookmark state and toggling.
 *
 * Returns { isBookmarked, toggle } for a given topicId.
 * Reads from and writes to the bookmarked_topics table in user.db.
 */

import { useState, useEffect, useCallback } from 'react';
import { isTopicBookmarked } from '../db/userQueries';
import { bookmarkTopic, unbookmarkTopic } from '../db/userMutations';
import { logger } from '../utils/logger';

interface TopicBookmarkResult {
  isBookmarked: boolean;
  toggle: (type?: string, title?: string, summary?: string) => void;
}

export function useTopicBookmark(topicId: string): TopicBookmarkResult {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isTopicBookmarked(topicId)
      .then((val) => { if (!cancelled) setIsBookmarked(val); })
      .catch((err) => logger.warn('useTopicBookmark', 'Failed to check bookmark status', err));
    return () => { cancelled = true; };
  }, [topicId]);

  const toggle = useCallback(
    (type?: string, title?: string, summary?: string) => {
      // Optimistic update
      const wasBookmarked = isBookmarked;
      setIsBookmarked(!wasBookmarked);

      const doAsync = async () => {
        try {
          if (wasBookmarked) {
            await unbookmarkTopic(topicId);
          } else {
            await bookmarkTopic(topicId, type ?? 'official', title, summary);
          }
        } catch (err) {
          // Revert on failure
          setIsBookmarked(wasBookmarked);
          logger.warn('useTopicBookmark', 'Failed to toggle bookmark', err);
        }
      };

      doAsync();
    },
    [topicId, isBookmarked],
  );

  return { isBookmarked, toggle };
}
