/**
 * AlphabetBar — Horizontal letter strip for jump navigation.
 *
 * Renders A–Z as small tap targets. Active letter highlighted in gold.
 * Unavailable letters dimmed and disabled.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '../theme';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface Props {
  activeLetter: string | null;
  availableLetters: Set<string>;
  onSelect: (letter: string) => void;
}

export function AlphabetBar({ activeLetter, availableLetters, onSelect }: Props) {
  const { base } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
      scrollEventThrottle={16}
      directionalLockEnabled
      alwaysBounceVertical={false}
      bounces={false}
      nestedScrollEnabled={false}
    >
      {LETTERS.map((letter) => {
        const available = availableLetters.has(letter);
        const active = letter === activeLetter;
        return (
          <TouchableOpacity
            key={letter}
            onPress={() => available && onSelect(letter)}
            disabled={!available}
            style={[
              styles.letterBtn,
              active && { backgroundColor: base.gold + '20' },
            ]}
          >
            <Text
              style={[
                styles.letterText,
                {
                  color: active
                    ? base.gold
                    : available
                      ? base.textDim
                      : base.textMuted + '4D',
                },
              ]}
            >
              {letter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    height: 36,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  letterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
  },
});
