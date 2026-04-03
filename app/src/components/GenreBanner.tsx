/**
 * GenreBanner — Dismissible genre guidance shown at top of chapter.
 *
 * Displays genre label + reading guidance. Dismissible per-session
 * (state resets on app restart). Hidden when no genre data exists.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';

interface Props {
  genreLabel: string;
  genreGuidance: string;
}

function GenreBanner({ genreLabel, genreGuidance }: Props) {
  const { base } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <View style={[styles.container, { backgroundColor: base.gold + '0A', borderColor: base.gold + '25' }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: base.gold }]}>{genreLabel.toUpperCase()}</Text>
        <TouchableOpacity
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.dismiss, { color: base.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.guidance, { color: base.textMuted }]}>{genreGuidance}</Text>
    </View>
  );
}

const MemoizedGenreBanner = React.memo(GenreBanner);
export { MemoizedGenreBanner as GenreBanner };
export default MemoizedGenreBanner;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
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
    letterSpacing: 0.5,
  },
  dismiss: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  guidance: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
