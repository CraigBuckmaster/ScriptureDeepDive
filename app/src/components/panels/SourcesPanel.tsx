import React from 'react';
import { View, Text } from 'react-native';
import { TappableReference } from '../TappableReference';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';
import type { SourceEntry, ParsedRef } from '../../types';

interface Props { entries: SourceEntry[]; onRefPress?: (ref: ParsedRef) => void; }

export function SourcesPanel({ entries, onRefPress }: Props) {
  const colors = getPanelColors('src');
  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((e, i) => (
        <View key={i} style={{ gap: 4 }}>
          <Text style={{ color: colors.accent, fontFamily: fontFamily.display, fontSize: 12 }}>
            {e.title}
          </Text>
          <Text style={{ color: base.textDim, fontFamily: fontFamily.bodyItalic, fontSize: 14, lineHeight: 22 }}>
            {e.quote}
          </Text>
          <TappableReference text={e.note} style={{ color: base.textMuted, fontSize: 13, lineHeight: 20 }} onRefPress={onRefPress} />
        </View>
      ))}
    </View>
  );
}
