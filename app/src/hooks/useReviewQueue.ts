import { useCallback, useEffect, useState } from 'react';
import { completeGuidedReviewItem } from '../db/userMutations';
import {
  getAllGuidedReviewItems,
  getConceptEncounters,
  getDueGuidedReviewItems,
} from '../db/userQueries';
import type { ConceptEncounter, GuidedReviewItem } from '../types';
import { logger } from '../utils/logger';

export function useReviewQueue() {
  const [dueItems, setDueItems] = useState<GuidedReviewItem[]>([]);
  const [allItems, setAllItems] = useState<GuidedReviewItem[]>([]);
  const [concepts, setConcepts] = useState<ConceptEncounter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [due, all, conceptRows] = await Promise.all([
        getDueGuidedReviewItems(),
        getAllGuidedReviewItems(),
        getConceptEncounters(),
      ]);
      setDueItems(due);
      setAllItems(all);
      setConcepts(conceptRows);
    } catch (err) {
      logger.warn('useReviewQueue', 'Failed to load review queue', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const completeItem = useCallback(
    async (id: number) => {
      await completeGuidedReviewItem(id);
      await reload();
    },
    [reload],
  );

  return {
    dueItems,
    allItems,
    concepts,
    isLoading,
    reload,
    completeItem,
  };
}
