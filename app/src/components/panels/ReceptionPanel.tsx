import React from 'react';
import { View, Text } from 'react-native';
import { TappableReference } from '../TappableReference';
import { getPanelColors, base, spacing } from '../../theme';
import type { RecEntry, ParsedRef } from '../../types';

interface Props { entries: RecEntry[]; onRefPress?: (ref: ParsedRef) => void; }

export function ReceptionPanel({ entries, onRefPress }: Props) {
  const colors = getPanelColors('rec');
  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((e, i) => (
        <View key={i} style={{ gap: 4 }}>
          <Text style={{ color: colors.accent, fontFamily: 'Cinzel_400Regular', fontSize: 12 }}>
            {e.title}
          </Text>
          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 14, lineHeight: 22 }}>
            {e.quote}
          </Text>
          <TappableReference text={e.note} style={{ color: base.textMuted, fontSize: 13, lineHeight: 20 }} onRefPress={onRefPress} />
        </View>
      ))}
    </View>
  );
}
