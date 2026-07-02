/**
 * components/study/RhythmLine.tsx — One italic Garamond sentence
 * describing this week's study rhythm (#1832). Deliberately NOT a
 * streak: no counters, no flames, no emojis — just a gentle cadence
 * observation derived from getWeeklyRhythm().
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { WeeklyRhythm } from '../../services/study';
import { fontFamily, spacing, useTheme } from '../../theme';

const NUMBER_WORDS = [
  'no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
];

function asWord(n: number): string {
  return n >= 0 && n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n);
}

/** Pure sentence builder — exported for tests. */
export function buildRhythmSentence(rhythm: WeeklyRhythm[]): string {
  const week = rhythm.length > 0 ? rhythm[rhythm.length - 1] : null;
  const sessions = week?.sessions ?? 0;
  const reviews = week?.reviews ?? 0;

  if (sessions === 0 && reviews === 0) {
    const previous = rhythm.length > 1 ? rhythm[rhythm.length - 2] : null;
    const wasActive = (previous?.sessions ?? 0) + (previous?.reviews ?? 0) > 0;
    return wasActive
      ? 'A quiet week so far — the text will keep until you return.'
      : 'A quiet stretch — one unhurried session would begin a rhythm.';
  }

  const parts: string[] = [];
  if (sessions > 0) parts.push(`${asWord(sessions)} ${sessions === 1 ? 'session' : 'sessions'}`);
  if (reviews > 0) parts.push(`${asWord(reviews)} ${reviews === 1 ? 'review' : 'reviews'}`);
  const summary = parts.join(' and ');
  const sentence = `${summary} this week — a steady rhythm of study.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

export function RhythmLine({ rhythm }: { rhythm: WeeklyRhythm[] }) {
  const { base } = useTheme();
  return (
    <Text style={[styles.line, { color: base.textMuted }]}>{buildRhythmSentence(rhythm)}</Text>
  );
}

const styles = StyleSheet.create({
  line: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: spacing.xs,
  },
});
