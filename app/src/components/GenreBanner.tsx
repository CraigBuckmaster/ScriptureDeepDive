/**
 * GenreBanner — Dismissible genre guidance shown at top of chapter.
 *
 * Displays genre label + reading guidance. Dismissible per-session
 * (state resets on app restart). Hidden when no genre data exists.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { base, spacing, fontFamily } from '../theme';

interface Props {
  genreLabel: string;
  genreGuidance: string;
}

export function GenreBanner({ genreLabel, genreGuidance }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{genreLabel.toUpperCase()}</Text>
        <TouchableOpacity
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismiss}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.guidance}>{genreGuidance}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: base.gold + '0A',
    borderWidth: 1,
    borderColor: base.gold + '25',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    color: base.gold,
    letterSpacing: 0.5,
  },
  dismiss: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    color: base.textMuted,
  },
  guidance: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: base.textMuted,
    lineHeight: 18,
  },
});
