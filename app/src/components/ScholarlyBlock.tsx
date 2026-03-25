/**
 * ScholarlyBlock — Container for chapter-level scholarly panels.
 *
 * Divider with "CHAPTER ANALYSIS" label, ButtonRow, PanelContainer.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ButtonRow } from './ButtonRow';
import { PanelContainer } from './PanelContainer';
import { base, spacing, fontFamily } from '../theme';
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
  if (chapterPanels.length === 0) return null;

  const activeChapterPanel = activePanel
    ? chapterPanels.find((p) => p.panel_type === activePanel)
    : null;

  return (
    <View style={{ marginTop: spacing.lg }}>
      {/* Divider */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.md, marginBottom: spacing.xs,
      }}>
        <View style={{ flex: 1, height: 1, backgroundColor: base.border }} />
        <Text style={{
          color: base.textMuted, fontFamily: fontFamily.display,
          fontSize: 9, letterSpacing: 1.2, marginHorizontal: spacing.sm,
        }}>
          CHAPTER ANALYSIS
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: base.border }} />
      </View>

      {/* Button row */}
      <ButtonRow
        panels={chapterPanels}
        activePanel={activePanel}
        onToggle={onToggle}
        isChapterLevel
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
