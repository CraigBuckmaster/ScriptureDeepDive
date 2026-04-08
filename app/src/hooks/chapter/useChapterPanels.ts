/**
 * useChapterPanels — Panel toggle (single-open policy) and auto-open from deep link.
 *
 * Extracted from ChapterScreen (#970).
 */

import { useState, useCallback, useEffect, useMemo, type RefObject } from 'react';
import { LayoutAnimation, type ScrollView } from 'react-native';
import { useReaderStore } from '../../stores';
import { useStudyDepth } from '../useStudyDepth';
import { useStudyRecorder } from '../useStudyRecorder';
import type { Section, SectionPanel } from '../../types';

interface SectionData extends Section {
  panels: SectionPanel[];
}

interface UseChapterPanelsOptions {
  chapterId: number | undefined;
  sections: SectionData[];
  isPremium: boolean;
  bookId: string;
  chapterNum: number;
  openPanel?: { sectionNum?: number; panelType: string } | null;
  isLoading: boolean;
  scrollRef: RefObject<ScrollView | null>;
}

export function useChapterPanels({
  chapterId,
  sections,
  isPremium,
  bookId,
  chapterNum,
  openPanel,
  isLoading,
  scrollRef,
}: UseChapterPanelsOptions) {
  const activePanel = useReaderStore((s) => s.activePanel);
  const setActivePanel = useReaderStore((s) => s.setActivePanel);
  const clearActivePanel = useReaderStore((s) => s.clearActivePanel);

  // Study depth tracking
  const sectionPanelMap = useMemo(() => {
    const map = new Map<string, SectionData['panels']>();
    for (const sec of sections) {
      map.set(sec.id, sec.panels);
    }
    return map;
  }, [sections]);
  const { depthMap, recordOpen } = useStudyDepth(chapterId, sectionPanelMap);

  // Study session recording (premium only)
  const { recordEvent } = useStudyRecorder(chapterId, isPremium);

  // Panel toggle — single-open policy with animation
  const handleSectionPanelToggle = useCallback(
    (sectionId: string, panelType: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const isOpen = activePanel?.sectionId === sectionId && activePanel?.panelType === panelType;
      setActivePanel(sectionId, panelType);
      recordOpen(sectionId, panelType);
      recordEvent(isOpen ? 'panel_close' : 'panel_open', {
        section_id: sectionId,
        panel_type: panelType,
      });
    },
    [setActivePanel, recordOpen, activePanel, recordEvent],
  );

  const handleChapterPanelToggle = useCallback(
    (panelType: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const isOpen =
        activePanel?.sectionId === '__chapter__' && activePanel?.panelType === panelType;
      setActivePanel('__chapter__', panelType);
      recordEvent(isOpen ? 'panel_close' : 'panel_open', {
        section_id: '__chapter__',
        panel_type: panelType,
      });
    },
    [setActivePanel, activePanel, recordEvent],
  );

  // Auto-open panel from deep-link (Content Library)
  const [openPanelApplied, setOpenPanelApplied] = useState(false);
  useEffect(() => {
    if (!openPanel || openPanelApplied || isLoading || !chapterId) return;
    if (openPanel.sectionNum != null) {
      const sec = sections.find((s) => s.section_num === openPanel.sectionNum);
      if (sec) {
        handleSectionPanelToggle(sec.id, openPanel.panelType);
      }
    } else {
      handleChapterPanelToggle(openPanel.panelType);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
    setOpenPanelApplied(true);
  }, [openPanel, openPanelApplied, isLoading, chapterId, sections, handleSectionPanelToggle, handleChapterPanelToggle]);

  // Reset openPanel applied state on chapter change
  useEffect(() => {
    setOpenPanelApplied(false);
  }, [bookId, chapterNum]);

  const activeSectionPanelType =
    activePanel && activePanel.sectionId !== '__chapter__' ? activePanel : null;

  const activeChapterPanelType =
    activePanel?.sectionId === '__chapter__' ? activePanel.panelType : null;

  return {
    activePanel,
    clearActivePanel,
    activeSectionPanelType,
    activeChapterPanelType,
    handleSectionPanelToggle,
    handleChapterPanelToggle,
    depthMap,
    recordOpen,
  };
}
