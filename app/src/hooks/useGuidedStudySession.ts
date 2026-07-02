import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createOrResumeGuidedStudySession,
  markGuidedTrailItemVisited,
  setGuidedStudyStep,
  upsertGuidedStudyResponse,
  upsertGuidedStudySynthesis,
  completeGuidedStudySession,
  createGuidedReviewItems,
  recordConceptEncounter,
  upsertGuidedStudyQuestion,
} from '../db/userMutations';
import {
  getGuidedStudyResponses,
  getGuidedStudySession,
  getGuidedStudySynthesis,
} from '../db/userQueries';
import type { GuidedStudyResponse, GuidedStudyStep, GuidedStudySynthesis } from '../types';
import { buildReviewItemsFromSynthesis, type GuidedConceptChip } from '../services/guidedStudy';
import { logger } from '../utils/logger';

export interface GuidedSynthesisDraft {
  takeaway: string;
  open_question: string;
  key_connection: string;
}

const EMPTY_SYNTHESIS: GuidedSynthesisDraft = {
  takeaway: '',
  open_question: '',
  key_connection: '',
};

/** Parse a visited/deferred trail JSON column into a clean string[]. */
function parseTrailJson(json: string | null | undefined): string[] {
  try {
    const parsed: unknown = JSON.parse(json ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : [];
  } catch {
    return [];
  }
}

export function useGuidedStudySession(chapterId: string | undefined) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentStep, setCurrentStepState] = useState<GuidedStudyStep>('scene');
  const [responses, setResponses] = useState<Record<string, GuidedStudyResponse>>({});
  const [synthesis, setSynthesis] = useState<GuidedSynthesisDraft>(EMPTY_SYNTHESIS);
  const [visitedTrail, setVisitedTrail] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!chapterId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    void (async () => {
      try {
        const id = await createOrResumeGuidedStudySession(chapterId);
        const [session, responseRows, synthesisRow] = await Promise.all([
          getGuidedStudySession(id),
          getGuidedStudyResponses(id),
          getGuidedStudySynthesis(id),
        ]);
        if (cancelled) return;

        setSessionId(id);
        setCurrentStepState(session?.current_step ?? 'scene');
        setResponses(Object.fromEntries(responseRows.map((row) => [row.prompt_key, row])));
        setSynthesis(synthesisRowToDraft(synthesisRow));
        setVisitedTrail(parseTrailJson(session?.visited_trail_json));
      } catch (err) {
        logger.error('useGuidedStudySession', 'Failed to load guided session', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  const setCurrentStep = useCallback(
    async (step: GuidedStudyStep) => {
      setCurrentStepState(step);
      if (sessionId != null) {
        await setGuidedStudyStep(sessionId, step).catch((err) =>
          logger.warn('useGuidedStudySession', 'Failed to persist current step', err),
        );
      }
    },
    [sessionId],
  );

  // Visited evidence trail (#1835): optimistic in-memory set backed by
  // guided_study_sessions.visited_trail_json (migration v26) so checks
  // survive app kill + session resume.
  const markTrailItemVisited = useCallback(
    (key: string) => {
      setVisitedTrail((prev) => (prev.includes(key) ? prev : [...prev, key]));
      if (sessionId != null) {
        void markGuidedTrailItemVisited(sessionId, key).catch((err) =>
          logger.warn('useGuidedStudySession', 'Failed to persist visited trail item', err),
        );
      }
    },
    [sessionId],
  );

  const saveResponse = useCallback(
    async (promptKey: string, promptText: string, responseText: string) => {
      if (sessionId == null) return;
      const row: GuidedStudyResponse = {
        id: 0,
        session_id: sessionId,
        prompt_key: promptKey,
        prompt_text: promptText,
        response_text: responseText,
        updated_at: new Date().toISOString(),
      };
      setResponses((prev) => ({ ...prev, [promptKey]: row }));
      await upsertGuidedStudyResponse(sessionId, promptKey, promptText, responseText).catch((err) =>
        logger.warn('useGuidedStudySession', 'Failed to save response', err),
      );
    },
    [sessionId],
  );

  const saveSynthesis = useCallback(
    async (next: GuidedSynthesisDraft) => {
      setSynthesis(next);
      if (sessionId == null || !chapterId) return;
      await upsertGuidedStudySynthesis(sessionId, next).catch((err) =>
        logger.warn('useGuidedStudySession', 'Failed to save synthesis', err),
      );
      await upsertGuidedStudyQuestion(sessionId, chapterId, next.open_question).catch((err) =>
        logger.warn('useGuidedStudySession', 'Failed to save open question', err),
      );
    },
    [chapterId, sessionId],
  );

  const savePremiumReview = useCallback(
    async (title: string, concepts: GuidedConceptChip[]) => {
      if (!chapterId || sessionId == null) return;
      const reviewItems = buildReviewItemsFromSynthesis(synthesis);
      await createGuidedReviewItems(sessionId, chapterId, title, reviewItems);
      await Promise.all(
        concepts.map((concept) => recordConceptEncounter(concept.id, concept.label, chapterId)),
      );
      await completeGuidedStudySession(sessionId);
      setCurrentStepState('review');
    },
    [chapterId, sessionId, synthesis],
  );

  return useMemo(
    () => ({
      sessionId,
      currentStep,
      responses,
      synthesis,
      visitedTrail,
      isLoading,
      setCurrentStep,
      markTrailItemVisited,
      saveResponse,
      saveSynthesis,
      savePremiumReview,
    }),
    [
      sessionId,
      currentStep,
      responses,
      synthesis,
      visitedTrail,
      isLoading,
      setCurrentStep,
      markTrailItemVisited,
      saveResponse,
      saveSynthesis,
      savePremiumReview,
    ],
  );
}

function synthesisRowToDraft(row: GuidedStudySynthesis | null): GuidedSynthesisDraft {
  if (!row) return EMPTY_SYNTHESIS;
  return {
    takeaway: row.takeaway,
    open_question: row.open_question,
    key_connection: row.key_connection,
  };
}
