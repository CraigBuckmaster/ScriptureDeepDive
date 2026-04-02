/**
 * ComparisonVerse — Renders the comparison translation text below a primary verse.
 * Display-only: no VHL, no highlights, no interlinear, no long-press.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily, spacing } from '../theme';

interface Props {
  text: string | null;
  translationLabel: string;
}

export function ComparisonVerse({ text, translationLabel }: Props) {
  const { base } = useTheme();

  if (text === null) {
    return (
      <View style={styles.container}>
        <Text style={[styles.missing, { color: base.textMuted + '40' }]}>—</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.compText, { color: base.textMuted }]}>{text}</Text>
      <Text style={[styles.label, { color: base.textMuted + '80' }]}>{translationLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    paddingLeft: 32,
  },
  compText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  missing: {
    fontStyle: 'italic',
    fontSize: 13,
  },
});
