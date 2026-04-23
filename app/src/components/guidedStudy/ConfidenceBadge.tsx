import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { ConfidenceLevel } from '../../services/guidedStudy';

const LABELS: Record<ConfidenceLevel, string> = {
  consensus: 'Consensus',
  majority: 'Majority',
  debated: 'Debated',
  minority: 'Minority',
};

interface Props {
  level?: ConfidenceLevel;
}

export function ConfidenceBadge({ level }: Props) {
  const { base } = useTheme();
  if (!level) return null;

  return (
    <View
      style={[styles.badge, { borderColor: `${base.gold}30`, backgroundColor: `${base.gold}12` }]}
    >
      <Text style={[styles.text, { color: base.gold }]}>{LABELS[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },
});
