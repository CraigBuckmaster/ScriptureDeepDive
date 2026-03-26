/**
 * PanelRenderer — Dispatches panel_type to the correct component.
 *
 * Parses content_json and passes typed data to the matching panel.
 * Unknown types (scholar panels) fall back to CommentaryPanel.
 */

import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { base, spacing, fontFamily } from '../../theme';
import { isScholarPanel } from '../../utils/panelLabels';
import { logger } from '../../utils/logger';
import type { ParsedRef } from '../../types';

// Section-level panels
import { HebrewPanel } from './HebrewPanel';
import { ContextPanel } from './ContextPanel';
import { HistoricalContextPanel } from './HistoricalContextPanel';
import { CrossRefPanel } from './CrossRefPanel';
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
import { TextualPanel } from './TextualPanel';
import { DebatePanel } from './DebatePanel';

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

  // ── Section-level panels ──
  switch (panelType) {
    case 'heb':
      return <HebrewPanel entries={data} onWordStudyPress={onWordStudyPress} onRefPress={onRefPress} />;
    case 'ctx':
      return <ContextPanel text={typeof data === 'string' ? data : JSON.stringify(data)} onRefPress={onRefPress} />;
    case 'hist':
      return <HistoricalContextPanel text={typeof data === 'string' ? data : JSON.stringify(data)} onRefPress={onRefPress} />;
    case 'cross':
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
      return <TextualPanel entries={Array.isArray(data) ? data : []} />;
    case 'debate':
      return <DebatePanel entries={Array.isArray(data) ? data : []} onScholarPress={onScholarPress} />;

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
