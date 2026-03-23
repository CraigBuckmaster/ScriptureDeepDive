import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing } from '../../theme';
import type { TextualEntry } from '../../types';

interface Props { entries: TextualEntry[]; }

export function TextualPanel({ entries }: Props) {
  const colors = getPanelColors('tx');
  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((e, i) => (
        <View key={i} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Text style={{ color: colors.accent, fontFamily: 'SourceSans3_600SemiBold', fontSize: 12 }}>
              {e.ref}
            </Text>
            <Text style={{ color: base.textDim, fontFamily: 'Cinzel_400Regular', fontSize: 11 }}>
              {e.title}
            </Text>
          </View>
          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, lineHeight: 22 }}>
            {e.content}
          </Text>
          {e.note ? (
            <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 13 }}>
              {e.note}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
