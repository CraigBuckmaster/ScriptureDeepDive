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
      {entries.map((d: any, i) => {
        const heading = d.topic ?? d.title ?? 'Debate';
        const positions = d.positions ?? [];

        return (
          <View key={i} style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.accent, fontFamily: fontFamily.displayMedium, fontSize: 13 }}>
              {heading}
            </Text>
            {positions.map((p: any, j: number) => {
              // Current shape: { scholar, position }
              // Legacy shape: { name, proponents, argument }
              const isLegacy = 'argument' in p;
              const label = isLegacy ? (p.name ?? 'Position') : (p.scholar ?? 'Scholar');
              const sublabel = isLegacy ? (p.proponents ?? '') : '';
              const body = isLegacy ? (p.argument ?? '') : (p.position ?? '');

              return (
                <View key={j} style={{ gap: 4, paddingLeft: spacing.sm }}>
                  <Text
                    style={{ color: base.gold, fontFamily: fontFamily.uiSemiBold, fontSize: 12 }}
                    onPress={() => !isLegacy && onScholarPress?.(label.toLowerCase())}
                  >
                    {label}
                  </Text>
                  {sublabel ? (
                    <Text style={{ color: base.textMuted, fontFamily: fontFamily.bodyItalic, fontSize: 11 }}>
                      {sublabel}
                    </Text>
                  ) : null}
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
