import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { DebateEntry } from '../../types';

interface Props { entries: DebateEntry[]; onScholarPress?: (scholarId: string) => void; }

export function DebatePanel({ entries, onScholarPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('debate');
  if (!entries?.length) return null;

  return (
    <View style={styles.container}>
      {entries.map((d: any, i) => {
        const heading = d.topic ?? d.title ?? 'Debate';
        const positions = d.positions ?? [];

        return (
          <View key={i} style={styles.entryBlock}>
            <Text style={[styles.heading, { color: colors.accent }]}>
              {heading}
            </Text>
            {positions.map((p: any, j: number) => {
              const isLegacy = 'argument' in p;
              const label = isLegacy ? (p.name ?? 'Position') : (p.scholar ?? 'Scholar');
              const sublabel = isLegacy ? (p.proponents ?? '') : '';
              const body = isLegacy ? (p.argument ?? '') : (p.position ?? '');

              return (
                <View key={j} style={styles.positionBlock}>
                  <Text
                    style={[styles.scholarLabel, { color: base.gold }]}
                    onPress={() => !isLegacy && onScholarPress?.(label.toLowerCase())}
                  >
                    {label}
                  </Text>
                  {sublabel ? (
                    <Text style={[styles.sublabel, { color: base.textMuted }]}>
                      {sublabel}
                    </Text>
                  ) : null}
                  <Text style={[styles.body, { color: base.textDim }]}>
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

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  entryBlock: {
    gap: spacing.sm,
  },
  heading: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  positionBlock: {
    gap: 4,
    paddingLeft: spacing.sm,
  },
  scholarLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  sublabel: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
});
