/**
 * ChapterVerseList — Renders the list of SectionBlocks with interleaved
 * coaching cards, the chapter-level ScholarlyBlock, and the scholar disclaimer.
 *
 * Extracted from ChapterScreen to reduce file size and isolate the
 * verse-rendering concern.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Section, SectionPanel, Verse, VHLGroup, ChapterPanel, CoachingTip } from '../types';
import type { OpenPanelParam } from '../navigation/types';

import { SectionBlock } from './SectionBlock';
import { ButtonRow } from './ButtonRow';
import { PanelContainer } from './PanelContainer';
import { ScholarlyBlock } from './ScholarlyBlock';
import { StudyCoachCard } from './StudyCoachCard';
import { useTheme, spacing, fontFamily } from '../theme';

interface Props {
  sections: (Section & { panels: SectionPanel[] })[];
  verses: Verse[];
  vhlGroups: VHLGroup[];
  activeVhlGroups: string[];
  notedVerses: Set<number>;
  activeSectionPanel: { sectionId: string; panelType: string } | null;
  fontSize: number;
  handleSectionPanelToggle: (sectionId: string, panelType: string) => void;
  onNotePress: (verseNum: number) => void;
  onVerseLongPress: (verseNum: number, text: string) => void;
  onInterlinearPress: (verseNum: number) => void;
  activeVerseNum: number | undefined;
  depthMap: Map<string, { explored: number; total: number }>;
  recordOpen: (sectionId: string, panelType: string) => void;
  comparisonVerses: Verse[] | undefined;
  comparisonLabel: string | undefined;
  primaryLabel: string | undefined;
  redLetterVerses: Set<number>;
  highlightMap: Map<number, string>;
  clearActivePanel: () => void;
  onRefPress: (ref: { bookId: string; chapter: number }) => void;
  openPanel: OpenPanelParam | undefined;
  /** Layout callbacks for scroll-to-section/verse/buttonRow */
  onSectionLayout: (sectionId: string, y: number) => void;
  onVerseLayout: (verseNum: number, y: number, sectionId: string) => void;
  onBtnRowLayout: (sectionId: string, sectionY: number, rowY: number) => void;
  /** Coaching */
  studyCoachEnabled: boolean;
  coachingTips: CoachingTip[];
  dismissedTips: Set<number>;
  onDismissTip: (afterSection: number) => void;
  /** Chapter-level scholarly */
  chapterPanels: ChapterPanel[];
  activeChapterPanelType: string | null;
  handleChapterPanelToggle: (panelType: string) => void;
}

const ChapterVerseList = React.memo(function ChapterVerseList({
  sections,
  verses,
  vhlGroups,
  activeVhlGroups,
  notedVerses,
  activeSectionPanel,
  fontSize,
  handleSectionPanelToggle,
  onNotePress,
  onVerseLongPress,
  onInterlinearPress,
  activeVerseNum,
  depthMap,
  recordOpen,
  comparisonVerses,
  comparisonLabel,
  primaryLabel,
  redLetterVerses,
  highlightMap,
  clearActivePanel,
  onRefPress,
  openPanel,
  onSectionLayout,
  onVerseLayout,
  onBtnRowLayout,
  studyCoachEnabled,
  coachingTips,
  dismissedTips,
  onDismissTip,
  chapterPanels,
  activeChapterPanelType,
  handleChapterPanelToggle,
}: Props) {
  const { base } = useTheme();

  const sectionElements = useMemo(() => {
    return sections.flatMap((sec) => {
      const elements: React.ReactNode[] = [
        <View
          key={sec.id}
          onLayout={(e) => {
            onSectionLayout(sec.id, e.nativeEvent.layout.y);
          }}
        >
          <SectionBlock
            section={sec}
            panels={sec.panels}
            verses={verses}
            vhlGroups={vhlGroups}
            activeVhlGroups={activeVhlGroups}
            notedVerses={notedVerses}
            activePanel={activeSectionPanel}
            fontSize={fontSize}
            onPanelToggle={handleSectionPanelToggle}
            onNotePress={onNotePress}
            onVerseLongPress={onVerseLongPress}
            onVerseNumPress={onInterlinearPress}
            activeVerseNum={activeVerseNum}
            depthExplored={depthMap.get(sec.id)?.explored}
            depthTotal={depthMap.get(sec.id)?.total}
            onDepthRecord={recordOpen}
            comparisonVerses={comparisonVerses}
            comparisonLabel={comparisonLabel}
            primaryLabel={primaryLabel}
            redLetterVerses={redLetterVerses}
            highlightMap={highlightMap}
            onVerseLayout={(verseNum, y, sectionId) => {
              onVerseLayout(verseNum, y, sectionId);
            }}
            renderButtonRow={(panels, sectionId) => (
              <View onLayout={(e) => {
                onBtnRowLayout(sectionId, 0, e.nativeEvent.layout.y);
              }}>
                <ButtonRow
                  panels={panels}
                  activePanel={
                    activeSectionPanel?.sectionId === sectionId
                      ? activeSectionPanel.panelType
                      : null
                  }
                  onToggle={(type) => handleSectionPanelToggle(sectionId, type)}
                />
              </View>
            )}
            renderPanel={(panel) => (
              <PanelContainer
                panelType={panel.panel_type}
                contentJson={panel.content_json}
                isOpen
                onClose={clearActivePanel}
                onRefPress={onRefPress}
                defaultTab={
                  openPanel?.tabKey && openPanel.panelType === panel.panel_type
                    ? openPanel.tabKey
                    : undefined
                }
              />
            )}
          />
        </View>,
      ];

      // Inject coaching card after this section if applicable
      if (studyCoachEnabled && coachingTips.length > 0) {
        const tip = coachingTips.find((t) => t.after_section === sec.section_num);
        if (tip && !dismissedTips.has(tip.after_section)) {
          elements.push(
            <StudyCoachCard
              key={`coach-${tip.after_section}`}
              tip={tip.tip}
              onDismiss={() => onDismissTip(tip.after_section)}
            />,
          );
        }
      }

      return elements;
    });
  }, [
    sections, verses, vhlGroups, activeVhlGroups, notedVerses,
    activeSectionPanel, fontSize, handleSectionPanelToggle,
    onNotePress, onVerseLongPress, onInterlinearPress, activeVerseNum,
    depthMap, recordOpen, comparisonVerses, comparisonLabel, primaryLabel,
    redLetterVerses, highlightMap, clearActivePanel, onRefPress, openPanel,
    onSectionLayout, onVerseLayout, onBtnRowLayout,
    studyCoachEnabled, coachingTips, dismissedTips, onDismissTip,
  ]);

  return (
    <>
      {sectionElements}

      {/* Chapter-level scholarly block */}
      <ScholarlyBlock
        chapterPanels={chapterPanels}
        activePanel={activeChapterPanelType}
        onToggle={handleChapterPanelToggle}
        onClose={clearActivePanel}
        onRefPress={onRefPress}
        defaultTab={
          openPanel && !openPanel.sectionNum && openPanel.tabKey
            ? openPanel.tabKey
            : undefined
        }
      />

      {/* Scholar disclaimer */}
      <Text style={[styles.scholarDisclaimer, { color: base.textMuted }]}>
        Scholar commentary panels present paraphrased summaries of positions found in published works and are not direct quotations. For exact wording, consult the original sources cited.
      </Text>
    </>
  );
});

const styles = StyleSheet.create({
  scholarDisclaimer: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});

export { ChapterVerseList };
