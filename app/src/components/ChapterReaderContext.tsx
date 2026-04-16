/**
 * ChapterReaderContext — Provides ambient reading state to ChapterVerseList
 * and its children, eliminating 30+ props of drilling.
 *
 * Created as part of #963 to reduce ChapterVerseList from 43 to <15 props.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import type { Verse, VHLGroup, CoachingTip, ChapterCoaching } from '../types';
import type { OpenPanelParam } from '../navigation/types';

// ── Verse rendering state ──
interface VerseState {
  verses: Verse[];
  vhlGroups: VHLGroup[];
  activeVhlGroups: string[];
  notedVerses: Set<number>;
  fontSize: number;
  redLetterVerses: Set<number>;
  highlightMap: Map<number, string>;
  comparisonVerses: Verse[] | undefined;
  comparisonLabel: string | undefined;
  primaryLabel: string | undefined;
  activeVerseNum: number | undefined;
}

// ── Panel state ──
interface PanelState {
  activeSectionPanel: { sectionId: string; panelType: string } | null;
  activeChapterPanelType: string | null;
  depthMap: Map<string, { explored: number; total: number }>;
  openPanel: OpenPanelParam | undefined;
}

// ── Callbacks ──
interface Callbacks {
  handleSectionPanelToggle: (sectionId: string, panelType: string) => void;
  handleChapterPanelToggle: (panelType: string) => void;
  clearActivePanel: () => void;
  recordOpen: (sectionId: string, panelType: string) => void;
  onNotePress: (verseNum: number) => void;
  onVerseLongPress: (verseNum: number, text: string) => void;
  onInterlinearPress: (verseNum: number) => void;
  onRefPress: (ref: { bookId: string; chapter: number; verseStart?: number; verseNum?: number }) => void;
}

// ── Layout callbacks ──
interface LayoutCallbacks {
  onSectionLayout: (sectionId: string, y: number) => void;
  onVerseLayout: (verseNum: number, y: number, sectionId: string) => void;
  onBtnRowLayout: (sectionId: string, sectionY: number, rowY: number) => void;
}

// ── Coaching state ──
interface CoachingState {
  studyCoachEnabled: boolean;
  coachingTips: CoachingTip[];
  chapterCoaching: ChapterCoaching | null | undefined;
  dismissedTips: Set<number>;
  onDismissTip: (afterSection: number) => void;
}

// ── Display state ──
interface DisplayState {
  focusMode: boolean;
}

export interface ChapterReaderContextValue {
  verse: VerseState;
  panel: PanelState;
  callbacks: Callbacks;
  layout: LayoutCallbacks;
  coaching: CoachingState;
  display: DisplayState;
}

const ChapterReaderCtx = createContext<ChapterReaderContextValue | null>(null);

export function useChapterReader(): ChapterReaderContextValue {
  const ctx = useContext(ChapterReaderCtx);
  if (!ctx) throw new Error('useChapterReader must be used within ChapterReaderProvider');
  return ctx;
}

interface ProviderProps extends ChapterReaderContextValue {
  children: ReactNode;
}

export function ChapterReaderProvider({ children, ...value }: ProviderProps) {
  return (
    <ChapterReaderCtx.Provider value={value}>
      {children}
    </ChapterReaderCtx.Provider>
  );
}
