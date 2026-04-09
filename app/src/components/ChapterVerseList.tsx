/**
 * ChapterVerseList — Renders the list of SectionBlocks with interleaved
 * coaching cards, the chapter-level ScholarlyBlock, and the scholar disclaimer.
 *
 * Reads ambient state from ChapterReaderContext (#963) — only receives
 * direct props for data that varies per-instance.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Section, SectionPanel, ChapterPanel } from '../types';

import { useChapterReader } from './ChapterReaderContext';
import { SectionBlock } from './SectionBlock';
import { ButtonRow } from './ButtonRow';
import { PanelContainer } from './PanelContainer';
import { ScholarlyBlock } from './ScholarlyBlock';
import { StudyCoachCard } from './StudyCoachCard';
import { ChapterCoachingCard } from './ChapterCoachingCard';
import { PrayerPromptCard } from './PrayerPromptCard';
import RelatedLifeTopics from './RelatedLifeTopics';
import { useTheme, spacing, fontFamily } from '../theme';

interface Props {
  sections: (Section & { panels: SectionPanel[] })[];
  chapterPanels: ChapterPanel[];
  prayerPrompt?: string | null;
  relatedLifeTopicsJson?: string | null;
}

const ChapterVerseList = React.memo(function ChapterVerseList({
  sections,
  chapterPanels,
  prayerPrompt,
  relatedLifeTopicsJson,
}: Props) {
  const { base } = useTheme();
  const { verse, panel, callbacks, layout, coaching, display } = useChapterReader();

  const sectionElements = useMemo(() => {
    return sections.flatMap((sec) => {
      const elements: React.ReactNode[] = [
        <View
          key={sec.id}
          onLayout={(e) => {
            layout.onSectionLayout(sec.id, e.nativeEvent.layout.y);
          }}
        >
          <SectionBlock
            section={sec}
            panels={sec.panels}
            verses={verse.verses}
            vhlGroups={verse.vhlGroups}
            activeVhlGroups={verse.activeVhlGroups}
            notedVerses={verse.notedVerses}
            activePanel={panel.activeSectionPanel}
            fontSize={verse.fontSize}
            onPanelToggle={callbacks.handleSectionPanelToggle}
            onNotePress={callbacks.onNotePress}
            onVerseLongPress={callbacks.onVerseLongPress}
            onVerseNumPress={callbacks.onInterlinearPress}
            activeVerseNum={verse.activeVerseNum}
            depthExplored={display.focusMode ? undefined : panel.depthMap.get(sec.id)?.explored}
            depthTotal={display.focusMode ? undefined : panel.depthMap.get(sec.id)?.total}
            onDepthRecord={callbacks.recordOpen}
            comparisonVerses={verse.comparisonVerses}
            comparisonLabel={verse.comparisonLabel}
            primaryLabel={verse.primaryLabel}
            redLetterVerses={verse.redLetterVerses}
            highlightMap={verse.highlightMap}
            onVerseLayout={(verseNum, y, sectionId) => {
              layout.onVerseLayout(verseNum, y, sectionId);
            }}
            renderButtonRow={display.focusMode ? undefined : (panels, sectionId) => (
              <View onLayout={(e) => {
                layout.onBtnRowLayout(sectionId, 0, e.nativeEvent.layout.y);
              }}>
                <ButtonRow
                  panels={panels}
                  activePanel={
                    panel.activeSectionPanel?.sectionId === sectionId
                      ? panel.activeSectionPanel?.panelType ?? null
                      : null
                  }
                  onToggle={(type) => callbacks.handleSectionPanelToggle(sectionId, type)}
                />
              </View>
            )}
            renderPanel={display.focusMode ? undefined : (p) => (
              <PanelContainer
                panelType={p.panel_type}
                contentJson={p.content_json}
                isOpen
                onClose={callbacks.clearActivePanel}
                onRefPress={callbacks.onRefPress}
                defaultTab={
                  panel.openPanel?.tabKey && panel.openPanel.panelType === p.panel_type
                    ? panel.openPanel.tabKey
                    : undefined
                }
              />
            )}
          />
        </View>,
      ];

      // Inject coaching card after this section if applicable (hidden in focus mode)
      if (!display.focusMode && coaching.studyCoachEnabled && coaching.coachingTips.length > 0) {
        const tip = coaching.coachingTips.find((t) => t.after_section === sec.section_num);
        if (tip && !coaching.dismissedTips.has(tip.after_section)) {
          elements.push(
            <StudyCoachCard
              key={`coach-${tip.after_section}`}
              tip={tip.tip}
              tone={tip.tone}
              onDismiss={() => coaching.onDismissTip(tip.after_section)}
            />,
          );
        }
      }

      return elements;
    });
  }, [sections, verse, panel, callbacks, layout, coaching, display]);

  return (
    <>
      {sectionElements}

      {/* Chapter-level scholarly block (hidden in focus mode) */}
      {!display.focusMode && (
        <ScholarlyBlock
          chapterPanels={chapterPanels}
          activePanel={panel.activeChapterPanelType}
          onToggle={callbacks.handleChapterPanelToggle}
          onClose={callbacks.clearActivePanel}
          onRefPress={callbacks.onRefPress}
          defaultTab={
            panel.openPanel && !panel.openPanel.sectionNum && panel.openPanel.tabKey
              ? panel.openPanel.tabKey
              : undefined
          }
        />
      )}

      {/* Scholar disclaimer */}
      {!display.focusMode && (
        <Text style={[styles.scholarDisclaimer, { color: base.textMuted }]}>
          Scholar commentary panels present paraphrased summaries of positions found in published works and are not direct quotations. For exact wording, consult the original sources cited.
        </Text>
      )}

      {/* Chapter-level coaching (study guide) */}
      {!display.focusMode && coaching.studyCoachEnabled && coaching.chapterCoaching ? (
        <ChapterCoachingCard coaching={coaching.chapterCoaching} />
      ) : null}

      {/* Related life topics */}
      <RelatedLifeTopics relatedLifeTopicsJson={relatedLifeTopicsJson} />

      {/* Prayer prompt card */}
      {prayerPrompt ? <PrayerPromptCard prompt={prayerPrompt} /> : null}
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
