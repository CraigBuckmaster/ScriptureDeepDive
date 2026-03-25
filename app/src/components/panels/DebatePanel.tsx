import React from 'react';
import { View, Text } from 'react-native';
import { ScholarTag } from '../ScholarTag';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';
import type { DebateEntry } from '../../types';

interface Props { entries: DebateEntry[]; onScholarPress?: (scholarId: string) => void; }

export function DebatePanel({ entries, onScholarPress }: Props) {
  const colors = getPanelColors('debate');
  return (
    <View style={{ gap: spacing.lg }}>
      {entries.map((d, i) => (
        <View key={i} style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.accent, fontFamily: fontFamily.displayMedium, fontSize: 13 }}>
            {d.topic}
          </Text>
          {d.positions.map((p, j) => (
            <View key={j} style={{ gap: 4, paddingLeft: spacing.sm }}>
              <ScholarTag scholarId={p.scholar.toLowerCase()} onPress={() => onScholarPress?.(p.scholar.toLowerCase())} />
              <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 22 }}>
                {p.position}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
