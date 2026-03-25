import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';
import type { TextualEntry } from '../../types';

interface Props { entries: TextualEntry[]; }

export function TextualPanel({ entries }: Props) {
  const colors = getPanelColors('tx');
  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((e, i) => (
        <View key={i} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Text style={{ color: colors.accent, fontFamily: fontFamily.uiSemiBold, fontSize: 12 }}>
              {e.ref}
            </Text>
            <Text style={{ color: base.textDim, fontFamily: fontFamily.display, fontSize: 11 }}>
              {e.title}
            </Text>
          </View>
          <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 22 }}>
            {e.content}
          </Text>
          {e.note ? (
            <Text style={{ color: base.textMuted, fontFamily: fontFamily.bodyItalic, fontSize: 13 }}>
              {e.note}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
