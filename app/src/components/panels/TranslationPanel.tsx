import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing } from '../../theme';
import type { TransPanel } from '../../types';

interface Props { data: TransPanel; }

export function TranslationPanel({ data }: Props) {
  const colors = getPanelColors('trans');
  return (
    <View style={{ gap: spacing.md }}>
      {data.title ? (
        <Text style={{ color: colors.accent, fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.3 }}>
          {data.title}
        </Text>
      ) : null}
      {data.rows.map((row, i) => (
        <View key={i} style={{ gap: spacing.xs }}>
          {row.verse_ref ? (
            <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: 'SourceSans3_600SemiBold' }}>
              {row.verse_ref}
            </Text>
          ) : null}
          {row.translations.map((t, j) => (
            <View key={j} style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Text style={{ color: colors.accent, fontFamily: 'SourceSans3_600SemiBold', fontSize: 12, minWidth: 32 }}>
                {t.version}
              </Text>
              <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, flex: 1 }}>
                {t.text}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
