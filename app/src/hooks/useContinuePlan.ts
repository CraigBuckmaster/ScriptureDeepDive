/**
 * hooks/useContinuePlan.ts — Data for the Study hub's Continue hero
 * (#1832): the active plan, its items (for the chapter trail ticks),
 * the resume target, and a minutes estimate for the next chapter from
 * services/guidedStudy/estimate.
 */
import { useCallback, useEffect, useState } from 'react';
import { getChapterPanels, getSectionPanels, getSections, getVerses } from '../db/content';
import { getStudyPlanItems } from '../db/userQueries';
import { getStudyDepthEstimate } from '../services/guidedStudy';
import { getActivePlan, resumeTarget, type ResumeTarget } from '../services/study';
import type { SectionPanel, StudyPlan, StudyPlanItem } from '../types';
import { logger } from '../utils/logger';

export interface ContinuePlanState {
  plan: StudyPlan | null;
  items: StudyPlanItem[];
  target: ResumeTarget | null;
  /** Estimated minutes for the next chapter (null while loading/unknown). */
  estimateMin: number | null;
  isLoading: boolean;
  reload: () => Promise<void>;
}

export function useContinuePlan(): ContinuePlanState {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [items, setItems] = useState<StudyPlanItem[]>([]);
  const [target, setTarget] = useState<ResumeTarget | null>(null);
  const [estimateMin, setEstimateMin] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const activePlan = await getActivePlan();
      if (!activePlan) {
        setPlan(null);
        setItems([]);
        setTarget(null);
        setEstimateMin(null);
        return;
      }

      const [planItems, nextTarget] = await Promise.all([
        getStudyPlanItems(activePlan.id),
        resumeTarget(activePlan.id),
      ]);
      setPlan(activePlan);
      setItems(planItems);
      setTarget(nextTarget);

      if (!nextTarget) {
        setEstimateMin(null);
        return;
      }

      // Minutes for the next chapter, from the same estimator the
      // session screens use. Deep plans read the deep figure; every
      // other mode maps to the guided figure.
      const chapterId = `${nextTarget.bookId}_${nextTarget.chapterNum}`;
      const [verses, sections, chapterPanels] = await Promise.all([
        getVerses(nextTarget.bookId, nextTarget.chapterNum),
        getSections(chapterId),
        getChapterPanels(chapterId),
      ]);
      const sectionPanels: SectionPanel[] = (
        await Promise.all(sections.map((s) => getSectionPanels(s.id)))
      ).flat();
      const estimate = getStudyDepthEstimate(verses, sectionPanels, chapterPanels);
      setEstimateMin(activePlan.default_mode === 'deep' ? estimate.deepMin : estimate.guidedMin);
    } catch (err) {
      logger.warn('useContinuePlan', 'Failed to load continue-plan state', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { plan, items, target, estimateMin, isLoading, reload };
}
