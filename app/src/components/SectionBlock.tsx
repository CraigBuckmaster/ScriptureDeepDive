/**
 * SectionBlock — Container for one section: header + verses + panels.
 *
 * Wires the VHL tap flow: HighlightedText fires onVhlWordPress with
 * btn_types array → SectionBlock resolves which panel to open by
 * walking the array and finding the first available panel type.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, spacing } from '../theme';
import type { Section, SectionPanel, Verse, VHLGroup, ParsedRef } from '../types';
import { SectionHeader } from './SectionHeader';
import { VerseBlock } from './VerseBlock';

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
  /** Comparison verses for parallel translation view. */
  comparisonVerses?: Verse[];
  comparisonLabel?: string;
  primaryLabel?: string;
  redLetterVerses?: Set<number>;
  /** Called with (verseNum, yRelativeToSection, sectionId) when a verse lays out. */
  onVerseLayout?: (verseNum: number, y: number, sectionId: string) => void;
  /** User-applied verse highlight colors: verseNum → hex color string. */
  highlightMap?: Map<number, string>;
}

function SectionBlock({
  section, panels, verses, vhlGroups, activeVhlGroups,
  notedVerses, activePanel, fontSize,
  onPanelToggle, onNotePress, onRefPress, onVerseLongPress, onVerseNumPress, activeVerseNum,
  renderButtonRow, renderPanel,
  depthExplored, depthTotal, onDepthRecord,
  comparisonVerses, comparisonLabel, primaryLabel,
  redLetterVerses, onVerseLayout, highlightMap,
}: Props) {
  const { base } = useTheme();

  // Filter verses for this section
  const sectionVerses = verses.filter(
    (v) => v.verse_num >= section.verse_start && v.verse_num <= section.verse_end
  );

  // Filter comparison verses for this section
  const sectionCompVerses = comparisonVerses?.filter(
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
    <View style={[styles.container, { borderBottomColor: base.border + '60' }]}>
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
        comparisonVerses={sectionCompVerses}
        comparisonLabel={comparisonLabel}
        primaryLabel={primaryLabel}
        redLetterVerses={redLetterVerses}
        onVerseLayout={onVerseLayout ? (verseNum, y) => onVerseLayout(verseNum, y, section.id) : undefined}
        highlightMap={highlightMap}
      />

      {/* Panel button row after verses */}
      {renderButtonRow?.(panels, section.id)}

      {/* Active panel content */}
      {activeSectionPanel && renderPanel?.(activeSectionPanel)}
    </View>
  );
}

const MemoizedSectionBlock = React.memo(SectionBlock);
export { MemoizedSectionBlock as SectionBlock };
export default MemoizedSectionBlock;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
  },
});
