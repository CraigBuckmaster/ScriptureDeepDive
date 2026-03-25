import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';
import type { HebTextEntry } from '../../types';

interface Props { entries: HebTextEntry[]; }

export function HebrewReadingPanel({ entries }: Props) {
  const colors = getPanelColors('hebText');
  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((e, i) => (
        <View key={i} style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 17, fontFamily: fontFamily.bodyMedium }}>{e.word}</Text>
            <Text style={{ color: base.goldDim, fontSize: 12, fontFamily: fontFamily.bodyItalic }}>{e.tlit}</Text>
            <Text style={{ color: base.gold, fontSize: 13, fontFamily: fontFamily.bodySemiBold }}>— {e.gloss}</Text>
          </View>
          {e.note ? <Text style={{ color: base.textDim, fontSize: 13, lineHeight: 20, fontFamily: fontFamily.body }}>{e.note}</Text> : null}
        </View>
      ))}
    </View>
  );
}
