import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TappableReference } from '../TappableReference';
import { BadgeChip } from '../BadgeChip';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';
import type { ThreadEntry, ParsedRef } from '../../types';

interface Props { entries: ThreadEntry[]; onRefPress?: (ref: ParsedRef) => void; }

export function ThreadingPanel({ entries, onRefPress }: Props) {
  const colors = getPanelColors('thread');
  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((e, i) => (
        <View key={i} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Text style={{ color: colors.accent, fontFamily: fontFamily.uiSemiBold, fontSize: 13 }}>
              {e.anchor}
            </Text>
            <Text style={{ color: base.textMuted, fontSize: 14 }}>→</Text>
            <Text style={{ color: colors.accent, fontFamily: fontFamily.uiSemiBold, fontSize: 13 }}>
              {e.target}
            </Text>
            {e.type ? <BadgeChip label={e.type} color={colors.accent} /> : null}
          </View>
          <TappableReference text={e.text} style={{ color: base.textDim, fontSize: 13, lineHeight: 20 }} onRefPress={onRefPress} />
        </View>
      ))}
    </View>
  );
}
