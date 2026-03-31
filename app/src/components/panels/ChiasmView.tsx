/**
 * ChiasmView — Interactive chiasm visualization.
 *
 * Renders paired elements (A/A', B/B', etc.) as side-by-side cards
 * with matching colors, connected visually. The center/focal point
 * spans full width as a highlighted card.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { ChiasmData } from '../../types';

interface Props {
  data: ChiasmData;
}

export function ChiasmView({ data }: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={[styles.title, { color: base.gold }]}>{data.title}</Text>

      {/* Pairs — top half */}
      {data.pairs.map((pair, i) => (
        <View key={`top-${i}`} style={styles.pairRow}>
          {/* Label */}
          <View style={styles.labelCol}>
            <Text style={[styles.label, { color: pair.color }]}>{pair.label}</Text>
          </View>

          {/* Top card */}
          <View style={[
            styles.card,
            { backgroundColor: pair.color + '15', borderColor: pair.color + '30' },
          ]}>
            <Text style={[styles.cardText, { color: base.textDim }]}>{pair.top}</Text>
          </View>
        </View>
      ))}

      {/* Center / focal point */}
      <View style={[styles.centerCard, { borderColor: base.gold + '50', backgroundColor: base.gold + '10' }]}>
        <Text style={[styles.centerLabel, { color: base.gold }]}>{data.center.label}</Text>
        <Text style={[styles.centerText, { color: base.text }]}>{data.center.text}</Text>
      </View>

      {/* Pairs — bottom half (reversed) */}
      {[...data.pairs].reverse().map((pair, i) => (
        <View key={`bottom-${i}`} style={styles.pairRow}>
          {/* Label (primed) */}
          <View style={styles.labelCol}>
            <Text style={[styles.label, { color: pair.color }]}>{pair.label}ʹ</Text>
          </View>

          {/* Bottom card */}
          <View style={[
            styles.card,
            { backgroundColor: pair.color + '15', borderColor: pair.color + '30' },
          ]}>
            <Text style={[styles.cardText, { color: base.textDim }]}>{pair.bottom}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  labelCol: {
    width: 28,
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
  },
  cardText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  centerCard: {
    borderWidth: 2,
    borderRadius: 8,
    padding: spacing.sm + 2,
    marginLeft: 36,
  },
  centerLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
    marginBottom: 2,
  },
  centerText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
