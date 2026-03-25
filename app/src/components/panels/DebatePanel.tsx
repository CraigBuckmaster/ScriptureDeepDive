import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';

interface Props { entries: any[]; onScholarPress?: (scholarId: string) => void; }

export function DebatePanel({ entries, onScholarPress }: Props) {
  const colors = getPanelColors('debate');
  if (!entries?.length) return null;

  return (
    <View style={{ gap: spacing.lg }}>
      {entries.map((d, i) => {
        // Handle both shapes: { topic, positions: [{scholar, position}] }
        // and legacy: { title, positions: [{name, proponents, argument}] }
        const heading = d.topic ?? d.title ?? 'Debate';
        const positions: any[] = d.positions ?? [];

        return (
          <View key={i} style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.accent, fontFamily: fontFamily.displayMedium, fontSize: 13 }}>
              {heading}
            </Text>
            {positions.map((p: any, j: number) => {
              const label = p.scholar ?? p.name ?? 'Scholar';
              const body = p.position ?? p.argument ?? p.proponents ?? '';

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
