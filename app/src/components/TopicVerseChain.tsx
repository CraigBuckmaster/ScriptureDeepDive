/**
 * TopicVerseChain — Vertical timeline of verses within a single subtopic.
 *
 * Gold circles with connecting lines, tappable references, and optional annotations.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import type { TopicVerse } from '../types/topic';

interface Props {
  verses: TopicVerse[];
  onVersePress?: (ref: string) => void;
}

export function TopicVerseChain({ verses, onVersePress }: Props) {
  const { base } = useTheme();

  if (verses.length === 0) return null;

  return (
    <View style={styles.container}>
      {verses.map((verse, idx) => {
        const isLast = idx === verses.length - 1;
        return (
          <View key={`${verse.ref}-${idx}`} style={styles.step}>
            {/* Indicator column: circle + connecting line */}
            <View style={styles.indicator}>
              <View style={[styles.circle, { borderColor: base.gold, backgroundColor: base.gold + '40' }]} />
              {!isLast && <View style={[styles.line, { backgroundColor: base.border }]} />}
            </View>

            {/* Content column: ref + text + note */}
            <View style={styles.content}>
              {onVersePress ? (
                <TouchableOpacity
                  onPress={() => onVersePress(verse.ref)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Text style={[styles.ref, { color: base.gold }]}>{verse.ref}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.ref, { color: base.gold }]}>{verse.ref}</Text>
              )}
              <Text style={[styles.verseText, { color: base.textDim }]}>{verse.text}</Text>
              {verse.note ? (
                <Text style={[styles.note, { color: base.textMuted }]}>{verse.note}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: spacing.xs,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  indicator: {
    width: 20,
    alignItems: 'center',
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.xs,
  },
  ref: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    marginBottom: 2,
  },
  verseText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  note: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
    marginTop: 3,
  },
});
