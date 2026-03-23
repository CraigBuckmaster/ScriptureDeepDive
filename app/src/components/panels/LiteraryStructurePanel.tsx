import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing } from '../../theme';
import type { LitPanel } from '../../types';

interface Props { data: LitPanel; }

export function LiteraryStructurePanel({ data }: Props) {
  const colors = getPanelColors('lit');
  return (
    <View style={{ gap: spacing.sm }}>
      {data.rows.map((row, i) => (
        <View key={i} style={{
          flexDirection: 'row', gap: spacing.sm,
          borderLeftWidth: row.is_key ? 3 : 0, borderLeftColor: base.gold,
          paddingLeft: row.is_key ? spacing.sm : 0,
        }}>
          <Text style={{ color: colors.accent, fontFamily: 'SourceSans3_600SemiBold', fontSize: 12, minWidth: 55 }}>
            {row.label}
          </Text>
          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, flex: 1 }}>
            {row.text}
          </Text>
        </View>
      ))}
      {data.note ? (
        <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 13, marginTop: spacing.xs }}>
          {data.note}
        </Text>
      ) : null}
    </View>
  );
}
