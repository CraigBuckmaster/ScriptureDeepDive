import React from 'react';
import { View, Text } from 'react-native';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { DebateEntry } from '../../types';

interface Props { entries: DebateEntry[]; onScholarPress?: (scholarId: string) => void; }

export function DebatePanel({ entries, onScholarPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('debate');
  if (!entries?.length) return null;

  return (
    <View style={{ gap: spacing.lg }}>
      {entries.map((d, i) => {
        // Handle both shapes: { topic, positions: [{scholar, position}] }
        // and legacy: { title, positions: [{name, proponents, argument}] }
        const heading = d.topic ?? 'Debate';
        const positions = d.positions ?? [];

        return (
          <View key={i} style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.accent, fontFamily: fontFamily.displayMedium, fontSize: 13 }}>
              {heading}
            </Text>
            {positions.map((p, j: number) => {
              const label = p.scholar ?? 'Scholar';
              const body = p.position ?? '';

              return (
                <View key={j} style={{ gap: 4, paddingLeft: spacing.sm }}>
                  <Text
                    style={{ color: base.gold, fontFamily: fontFamily.uiSemiBold, fontSize: 12 }}
                    onPress={() => onScholarPress?.(label.toLowerCase())}
                  >
                    {label}
                  </Text>
                  <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 22 }}>
                    {body}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
