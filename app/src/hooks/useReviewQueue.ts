import { useCallback, useEffect, useState } from 'react';
import { completeGuidedReviewItem, resolveGuidedStudyQuestion } from '../db/userMutations';
import {
  getActiveGuidedStudySessions,
  getAllGuidedReviewItems,
  getConceptEncounters,
  getDueGuidedReviewItems,
  getOpenGuidedStudyQuestions,
  getRecentGuidedStudyTakeaways,
} from '../db/userQueries';
import { buildGuidedStudyNextAction, type GuidedStudyNextAction } from '../services/guidedStudy';
import type {
  ConceptEncounter,
  GuidedReviewItem,
  GuidedStudyQuestion,
  GuidedStudySession,
  GuidedStudyTakeawaySummary,
} from '../types';
import { logger } from '../utils/logger';

export function useReviewQueue() {
  const [dueItems, setDueItems] = useState<GuidedReviewItem[]>([]);
  const [allItems, setAllItems] = useState<GuidedReviewItem[]>([]);
  const [concepts, setConcepts] = useState<ConceptEncounter[]>([]);
  const [activeSessions, setActiveSessions] = useState<GuidedStudySession[]>([]);
  const [openQuestions, setOpenQuestions] = useState<GuidedStudyQuestion[]>([]);
  const [recentTakeaways, setRecentTakeaways] = useState<GuidedStudyTakeawaySummary[]>([]);
  const [nextAction, setNextAction] = useState<GuidedStudyNextAction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [due, all, conceptRows, active, questions, takeaways] = await Promise.all([
        getDueGuidedReviewItems(),
        getAllGuidedReviewItems(),
        getConceptEncounters(),
        getActiveGuidedStudySessions(),
        getOpenGuidedStudyQuestions(),
        getRecentGuidedStudyTakeaways(),
      ]);
      setDueItems(due);
      setAllItems(all);
      setConcepts(conceptRows);
      setActiveSessions(active);
      setOpenQuestions(questions);
      setRecentTakeaways(takeaways);
      setNextAction(
        buildGuidedStudyNextAction({
          activeSessions: active,
          dueItems: due,
          openQuestions: questions,
          recentTakeaways: takeaways,
        }),
      );
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

  const resolveQuestion = useCallback(
    async (id: number) => {
      await resolveGuidedStudyQuestion(id);
      await reload();
    },
    [reload],
  );

  return {
    dueItems,
    allItems,
    concepts,
    activeSessions,
    openQuestions,
    recentTakeaways,
    nextAction,
    isLoading,
    reload,
    completeItem,
    resolveQuestion,
  };
}
