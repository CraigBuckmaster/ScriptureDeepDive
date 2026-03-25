import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';
import type { TransPanel } from '../../types';

interface Props { data: TransPanel; }

export function TranslationPanel({ data }: Props) {
  const colors = getPanelColors('trans');
  return (
    <View style={{ gap: spacing.md }}>
      {data.title ? (
        <Text style={{ color: colors.accent, fontFamily: fontFamily.display, fontSize: 11, letterSpacing: 0.3 }}>
          {data.title}
        </Text>
      ) : null}
      {data.rows.map((row, i) => (
        <View key={i} style={{ gap: spacing.xs }}>
          {row.verse_ref ? (
            <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: fontFamily.uiSemiBold }}>
              {row.verse_ref}
            </Text>
          ) : null}
          {row.translations.map((t, j) => (
            <View key={j} style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Text style={{ color: colors.accent, fontFamily: fontFamily.uiSemiBold, fontSize: 12, minWidth: 32 }}>
                {t.version}
              </Text>
              <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, flex: 1 }}>
                {t.text}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
