/**
 * PanelRenderer — Dispatches panel_type to the correct component.
 *
 * Parses content_json and passes typed data to the matching panel.
 * Unknown types (scholar panels) fall back to CommentaryPanel.
 */

import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme, spacing, fontFamily } from '../../theme';
import { isScholarPanel } from '../../utils/panelLabels';
import { logger } from '../../utils/logger';
import type { ParsedRef } from '../../types';

// Section-level panels
import { HebrewPanel } from './HebrewPanel';
import { ContextPanel } from './ContextPanel';
import { HistoricalContextPanel } from './HistoricalContextPanel';
import { CrossRefPanel } from './CrossRefPanel';
import { CompositeContextPanel } from './CompositeContextPanel';
import { CompositeConnectionsPanel } from './CompositeConnectionsPanel';
import { CommentaryPanel } from './CommentaryPanel';
import { PlacesPanel } from './PlacesPanel';
import { TimelinePanel } from './TimelinePanel';

// Chapter-level panels
import { LiteraryStructurePanel } from './LiteraryStructurePanel';
import { HebrewReadingPanel } from './HebrewReadingPanel';
import { ThemesRadarPanel } from './ThemesRadarPanel';
import { PeoplePanel } from './PeoplePanel';
import { TranslationPanel } from './TranslationPanel';
import { SourcesPanel } from './SourcesPanel';
import { ReceptionPanel } from './ReceptionPanel';
import { ThreadingPanel } from './ThreadingPanel';
import { TextualPanel, CompositeTextualPanel } from './TextualPanel';
import { DebatePanel } from './DebatePanel';
import { DiscoursePanel } from './DiscoursePanel';

interface Props {
  panelType: string;
  contentJson: string;
  onRefPress?: (ref: ParsedRef) => void;
  onWordStudyPress?: (word: string) => void;
  onScholarPress?: (scholarId: string) => void;
  onPersonPress?: (name: string) => void;
  onPlacePress?: (name: string) => void;
  onEventPress?: (name: string) => void;
}

export function PanelRenderer({
  panelType, contentJson,
  onRefPress, onWordStudyPress, onScholarPress,
  onPersonPress, onPlacePress, onEventPress,
}: Props) {
  const { base } = useTheme();

  const data = useMemo(() => {
    try {
      return JSON.parse(contentJson);
    } catch (err) {
      logger.warn('PanelRenderer', `Failed to parse ${panelType} content`, err);
      return null;
    }
  }, [contentJson, panelType]);

  if (data === null) {
    return (
      <Text style={{ color: base.textMuted, fontSize: 12, fontFamily: fontFamily.ui }}>
        Unable to load panel content.
      </Text>
    );
  }

  /**
   * COMPOSITE PANEL PATTERN (Phases 2-4, 8):
   *
   * Several panel types will evolve from single-view to tabbed composites.
   * Detection is based on data shape, not panel_type:
   *
   *   hist: string → legacy single view
   *   hist: { historical, context?, audience?, ane? } → CompositeContextPanel
   *
   *   cross: array → legacy single view
   *   cross: { refs, echoes? } → CompositeConnectionsPanel
   *
   *   lit: { rows, note } → legacy single view
   *   lit: { rows, note, chiasm? } → adds Chiasm View tab
   *
   *   tx: array → legacy single view
   *   tx: { notes, stories? } → adds Manuscript Stories tab
   *
   * This pattern ensures full backward compatibility — old data renders
   * unchanged, new data lights up additional tabs automatically.
   */

  // ── Section-level panels ──
  switch (panelType) {
    case 'heb':
      return <HebrewPanel entries={data} onWordStudyPress={onWordStudyPress} onRefPress={onRefPress} />;
    case 'ctx':
      return <ContextPanel text={typeof data === 'string' ? data : JSON.stringify(data)} onRefPress={onRefPress} />;
    case 'hist':
      // Composite detection: object with historical/context keys → tabbed panel
      if (data && typeof data === 'object' && !Array.isArray(data) && (data.historical || data.context)) {
        return <CompositeContextPanel data={data} onRefPress={onRefPress} />;
      }
      // Legacy: plain string → single-view
      return <HistoricalContextPanel text={typeof data === 'string' ? data : JSON.stringify(data)} onRefPress={onRefPress} />;
    case 'cross':
      // Composite detection: object with refs key → tabbed panel
      if (data && typeof data === 'object' && !Array.isArray(data) && data.refs) {
        return <CompositeConnectionsPanel data={data} onRefPress={onRefPress} />;
      }
      // Legacy: plain array → single-view
      return <CrossRefPanel entries={data} onRefPress={onRefPress} />;
    case 'poi':
    case 'places':
      return <PlacesPanel entries={data} onPlacePress={onPlacePress} onRefPress={onRefPress} />;
    case 'tl':
      return <TimelinePanel events={data} onEventPress={onEventPress} onRefPress={onRefPress} />;

    // ── Chapter-level panels ──
    case 'lit':
      return <LiteraryStructurePanel data={data} />;
    case 'hebtext':
      return <HebrewReadingPanel entries={Array.isArray(data) ? data : []} />;
    case 'themes':
      return <ThemesRadarPanel data={data} />;
    case 'ppl':
      return <PeoplePanel entries={Array.isArray(data) ? data : []} onPersonPress={onPersonPress} onRefPress={onRefPress} />;
    case 'trans':
      return <TranslationPanel data={data} />;
    case 'src':
      return <SourcesPanel entries={data} onRefPress={onRefPress} />;
    case 'rec':
      return <ReceptionPanel entries={data} onRefPress={onRefPress} />;
    case 'thread':
      return <ThreadingPanel entries={data} onRefPress={onRefPress} />;
    case 'tx':
    case 'textual':
      // Shape detection: array → legacy. {notes, stories} → composite with Manuscript Stories tab.
      if (data && !Array.isArray(data) && data.notes !== undefined) {
        return <CompositeTextualPanel data={data} />;
      }
      return <TextualPanel entries={Array.isArray(data) ? data : []} />;
    case 'debate':
      return <DebatePanel entries={Array.isArray(data) ? data : []} onScholarPress={onScholarPress} />;
    case 'discourse':
      return <DiscoursePanel data={data} />;

    default:
      // Scholar commentary panels (mac, calvin, sarna, etc.)
      if (isScholarPanel(panelType)) {
        const notes = data?.notes ?? (Array.isArray(data) ? data : []);
        return <CommentaryPanel notes={notes} scholarId={panelType} onScholarPress={() => onScholarPress?.(panelType)} onRefPress={onRefPress} />;
      }

      // True unknown — render raw
      return (
        <View style={{ padding: spacing.sm }}>
          <Text style={{ color: base.textMuted, fontSize: 12, fontFamily: fontFamily.ui }}>
            Panel type: {panelType}
          </Text>
        </View>
      );
  }
}
