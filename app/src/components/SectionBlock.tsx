/**
 * SectionBlock — Container for one section: header + verses + panels.
 *
 * Wires the VHL tap flow: HighlightedText fires onVhlWordPress with
 * btn_types array → SectionBlock resolves which panel to open by
 * walking the array and finding the first available panel type.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { VerseBlock } from './VerseBlock';
import { base, spacing } from '../theme';
import type { Section, SectionPanel, Verse, VHLGroup, ParsedRef } from '../types';

interface Props {
  section: Section;
  panels: SectionPanel[];
  verses: Verse[];
  vhlGroups: VHLGroup[];
  activeVhlGroups?: string[];
  notedVerses: Set<number>;
  activePanel: { sectionId: string; panelType: string } | null;
  fontSize?: number;
  onPanelToggle: (sectionId: string, panelType: string) => void;
  onNotePress?: (verseNum: number) => void;
  onRefPress?: (ref: ParsedRef) => void;
  onVerseLongPress?: (verseNum: number, text: string) => void;
  onVerseNumPress?: (verseNum: number) => void;
  activeVerseNum?: number;
  /** Render prop for button row — injected by parent to avoid circular deps */
  renderButtonRow?: (panels: SectionPanel[], sectionId: string) => React.ReactNode;
  /** Render prop for active panel content */
  renderPanel?: (panel: SectionPanel) => React.ReactNode;
  /** Study depth tracking */
  depthExplored?: number;
  depthTotal?: number;
  onDepthRecord?: (sectionId: string, panelType: string) => void;
}

export function SectionBlock({
  section, panels, verses, vhlGroups, activeVhlGroups,
  notedVerses, activePanel, fontSize,
  onPanelToggle, onNotePress, onRefPress, onVerseLongPress, onVerseNumPress, activeVerseNum,
  renderButtonRow, renderPanel,
  depthExplored, depthTotal, onDepthRecord,
}: Props) {
  // Filter verses for this section
  const sectionVerses = verses.filter(
    (v) => v.verse_num >= section.verse_start && v.verse_num <= section.verse_end
  );

  // VHL tap handler: walk btn_types to find first matching panel
  const handleVhlWordPress = useCallback(
    (panelTypes: string[], sectionId: string) => {
      const availableTypes = new Set(panels.map((p) => p.panel_type));
      const matchType = panelTypes.find((pt) => availableTypes.has(pt));
      if (matchType) {
        onPanelToggle(sectionId, matchType);
        onDepthRecord?.(sectionId, matchType);
      }
    },
    [panels, onPanelToggle]
  );

  // Find the currently active panel for this section
  const activeSectionPanel =
    activePanel?.sectionId === section.id
      ? panels.find((p) => p.panel_type === activePanel.panelType)
      : null;

  return (
    <View style={styles.container}>
      <SectionHeader header={section.header} explored={depthExplored} total={depthTotal} />

      <VerseBlock
        verses={sectionVerses}
        vhlGroups={vhlGroups}
        activeVhlGroups={activeVhlGroups}
        notedVerses={notedVerses}
        sectionId={section.id}
        fontSize={fontSize}
        onVhlWordPress={handleVhlWordPress}
        onNotePress={onNotePress}
        onVerseLongPress={onVerseLongPress}
        onVerseNumPress={onVerseNumPress}
        activeVerseNum={activeVerseNum}
      />

      {/* Panel button row after verses */}
      {renderButtonRow?.(panels, section.id)}

      {/* Active panel content */}
      {activeSectionPanel && renderPanel?.(activeSectionPanel)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: base.border + '60',
    paddingBottom: spacing.sm,
  },
});
