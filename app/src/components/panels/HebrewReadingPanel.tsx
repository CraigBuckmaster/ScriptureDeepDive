import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing } from '../../theme';
import type { HebTextEntry } from '../../types';

interface Props { entries: HebTextEntry[]; }

export function HebrewReadingPanel({ entries }: Props) {
  const colors = getPanelColors('hebText');
  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((e, i) => (
        <View key={i} style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 17, fontFamily: 'EBGaramond_500Medium' }}>{e.word}</Text>
            <Text style={{ color: base.goldDim, fontSize: 12, fontFamily: 'EBGaramond_400Regular_Italic' }}>{e.tlit}</Text>
            <Text style={{ color: base.gold, fontSize: 13, fontFamily: 'EBGaramond_600SemiBold' }}>— {e.gloss}</Text>
          </View>
          {e.note ? <Text style={{ color: base.textDim, fontSize: 13, lineHeight: 20, fontFamily: 'EBGaramond_400Regular' }}>{e.note}</Text> : null}
        </View>
      ))}
    </View>
  );
}
