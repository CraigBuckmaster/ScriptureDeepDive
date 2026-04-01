/**
 * ScholarlyBlock — Container for chapter-level scholarly panels.
 *
 * Divider with "CHAPTER ANALYSIS" label, categorized ButtonRow, PanelContainer.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ButtonRow } from './ButtonRow';
import { PanelContainer } from './PanelContainer';
import { CHAPTER_PANEL_CATEGORIES } from '../utils/panelLabels';
import { base, useTheme, spacing, fontFamily } from '../theme';
import type { ChapterPanel, ParsedRef } from '../types';

interface Props {
  chapterPanels: ChapterPanel[];
  activePanel: string | null;
  onToggle: (panelType: string) => void;
  onClose?: () => void;
  onRefPress?: (ref: ParsedRef) => void;
  onWordStudyPress?: (word: string) => void;
  onScholarPress?: (scholarId: string) => void;
  onPersonPress?: (name: string) => void;
}

export function ScholarlyBlock({
  chapterPanels, activePanel, onToggle, onClose,
  onRefPress, onWordStudyPress, onScholarPress, onPersonPress,
}: Props) {
  const { base } = useTheme();

  if (chapterPanels.length === 0) return null;

  const activeChapterPanel = activePanel
    ? chapterPanels.find((p) => p.panel_type === activePanel)
    : null;

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: base.border }]} />
        <Text style={[styles.dividerLabel, { color: base.textMuted }]}>CHAPTER ANALYSIS</Text>
        <View style={[styles.dividerLine, { backgroundColor: base.border }]} />
      </View>

      {/* Button row with category grouping */}
      <ButtonRow
        panels={chapterPanels}
        activePanel={activePanel}
        onToggle={onToggle}
        isChapterLevel
        categories={CHAPTER_PANEL_CATEGORIES}
      />

      {/* Active panel */}
      {activeChapterPanel && (
        <PanelContainer
          panelType={activeChapterPanel.panel_type}
          contentJson={activeChapterPanel.content_json}
          isOpen
          onClose={onClose}
          onRefPress={onRefPress}
          onWordStudyPress={onWordStudyPress}
          onScholarPress={onScholarPress}
          onPersonPress={onPersonPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    marginHorizontal: spacing.sm,
  },
});
