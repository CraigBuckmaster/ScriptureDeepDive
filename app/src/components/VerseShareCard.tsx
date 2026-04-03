/**
 * VerseShareCard — Styled verse card for sharing as an image.
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '../theme';

interface Props {
  verseRef: string;
  verseText: string;
  translation: string;
}

export const VerseShareCard = forwardRef<View, Props>(({ verseRef, verseText, translation }, ref) => {
  const { base } = useTheme();
  return (
    <View ref={ref} style={[styles.cardContainer, { backgroundColor: base.bg }]}>
      <Text style={[styles.verseText, { color: base.text }]}>
        "{verseText}"
      </Text>
      <Text style={[styles.verseRef, { color: base.gold }]}>
        — {verseRef} ({translation.toUpperCase()})
      </Text>
      <Text style={[styles.brandText, { color: base.textMuted }]}>
        ✦ Companion Study
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    width: 1080,
    height: 1080,
    padding: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 48,
    lineHeight: 72,
    textAlign: 'center',
    marginBottom: 60,
  },
  verseRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 28,
    letterSpacing: 1,
  },
  brandText: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    letterSpacing: 2,
    marginTop: 80,
  },
});
