/**
 * VerseShareCard — Styled verse card for sharing as an image.
 */

import React, { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { base, spacing } from '../theme';

interface Props {
  verseRef: string;
  verseText: string;
  translation: string;
}

export const VerseShareCard = forwardRef<View, Props>(({ verseRef, verseText, translation }, ref) => (
  <View ref={ref} style={{
    width: 1080, height: 1080, backgroundColor: base.bg, padding: 120,
    justifyContent: 'center', alignItems: 'center',
  }}>
    <Text style={{
      color: base.text, fontFamily: 'EBGaramond_500Medium', fontSize: 48,
      lineHeight: 72, textAlign: 'center', marginBottom: 60,
    }}>
      "{verseText}"
    </Text>
    <Text style={{
      color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 28,
      letterSpacing: 1,
    }}>
      — {verseRef} ({translation.toUpperCase()})
    </Text>
    <Text style={{
      color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 18,
      letterSpacing: 2, marginTop: 80,
    }}>
      ✦ Scripture Deep Dive
    </Text>
  </View>
));
