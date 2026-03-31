/**
 * StudyCoachCard — Contextual coaching tip shown between sections.
 *
 * Appears when Study Coach is enabled and coaching data exists for a chapter.
 * Dismissible per-chapter (local state). Designed to feel like a thoughtful
 * study partner leaning over and saying "notice this…"
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { base, spacing, fontFamily } from '../theme';

interface Props {
  tip: string;
  onDismiss: () => void;
}

export function StudyCoachCard({ tip, onDismiss }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Lightbulb size={12} color={base.gold} />
          <Text style={styles.label}>STUDY COACH</Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismiss}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.tip}>{tip}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    borderLeftColor: base.gold,
    backgroundColor: base.gold + '08',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    color: base.gold,
    letterSpacing: 0.5,
  },
  dismiss: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    color: base.textMuted,
  },
  tip: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: base.textDim,
    lineHeight: 20,
  },
});
