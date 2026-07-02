/**
 * components/guidedStudy/SessionReader.tsx — Embedded scripture reader
 * for guided sessions (#1834). The session shows the chapter it is
 * asking about: collapsed = the first few verses + count + an expand
 * affordance; expanded = the full chapter.
 *
 * Verses render word-for-word from the loaded rows (already in the
 * user's translation) — no trimming, no paraphrase, no skipping.
 * Rendered as mapped <Text> inside the session's ScrollView on
 * purpose: a nested list would fight the outer scroll.
 *
 * Expand preference lives in component state only (no DB). The screen
 * passes `onToggle` + re-seeds `initiallyExpanded` so the preference
 * survives step switches (the reader unmounts between scene/observe).
 */
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { Verse } from '../../types';

const COLLAPSED_VERSE_COUNT = 3;

interface Props {
  verses: Verse[];
  initiallyExpanded?: boolean;
  /** Fires with the new state so the session can persist it across steps. */
  onToggle?: (expanded: boolean) => void;
}

export function SessionReader({ verses, initiallyExpanded = false, onToggle }: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(initiallyExpanded);

  if (verses.length === 0) return null;

  // Chapters at or under the collapsed count are always fully shown —
  // an expand affordance would be a no-op.
  const collapsible = verses.length > COLLAPSED_VERSE_COUNT;
  const shown = expanded || !collapsible ? verses : verses.slice(0, COLLAPSED_VERSE_COUNT);
  const hiddenCount = verses.length - shown.length;

  const handleToggle = () => {
    setExpanded((prev) => {
      onToggle?.(!prev);
      return !prev;
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
      <View style={styles.verseBlock}>
        {shown.map((verse) => (
          <Text key={verse.verse_num} style={[styles.verseText, { color: base.text }]}>
            <Text style={[styles.verseNum, { color: base.gold }]}>{verse.verse_num} </Text>
            {verse.text}
          </Text>
        ))}
      </View>

      {collapsible ? (
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={
            expanded
              ? 'Collapse chapter text'
              : `Read chapter — ${hiddenCount} more ${hiddenCount === 1 ? 'verse' : 'verses'}`
          }
          style={styles.toggle}
        >
          <Text style={[styles.toggleLabel, { color: base.gold }]}>
            {expanded
              ? 'Collapse'
              : `Read chapter (${verses.length} ${verses.length === 1 ? 'verse' : 'verses'})`}
          </Text>
          {expanded ? (
            <ChevronUp size={14} color={base.gold} />
          ) : (
            <ChevronDown size={14} color={base.gold} />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.bottomPad} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  verseBlock: {
    gap: spacing.xs,
  },
  verseText: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 26,
  },
  verseNum: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
  },
  toggleLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  bottomPad: {
    height: spacing.md,
  },
});
