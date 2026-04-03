/**
 * SubmissionPreview — Preview card shown before final submission.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { SubmissionType } from '../../types';

const TYPE_LABELS: Record<SubmissionType, string> = {
  verse_collection: 'Verse Collection',
  personal_reflection: 'Personal Reflection',
  topical_study: 'Topical Study',
};

interface Props {
  type: SubmissionType;
  title: string;
  body: string;
  verses: string[];
  topicName?: string;
}

function SubmissionPreview({ type, title, body, verses, topicName }: Props) {
  const { base } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border + '40' }]}>
      {/* Type badge */}
      <View style={[styles.typeBadge, { backgroundColor: base.gold + '20' }]}>
        <Text style={[styles.typeText, { color: base.gold }]}>{TYPE_LABELS[type]}</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: base.text }]}>{title}</Text>

      {/* Topic */}
      {topicName ? (
        <Text style={[styles.topic, { color: base.textDim }]}>Topic: {topicName}</Text>
      ) : null}

      {/* Body preview */}
      <Text style={[styles.body, { color: base.text }]} numberOfLines={6}>
        {body}
      </Text>

      {/* Verses */}
      {verses.length > 0 && (
        <View style={styles.versesRow}>
          <Text style={[styles.versesLabel, { color: base.textMuted }]}>
            {verses.length} verse{verses.length !== 1 ? 's' : ''} selected
          </Text>
          <Text style={[styles.versesList, { color: base.textDim }]} numberOfLines={2}>
            {verses.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  typeText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
  },
  topic: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  versesRow: {
    gap: 2,
  },
  versesLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  versesList: {
    fontFamily: fontFamily.body,
    fontSize: 12,
  },
});

export default React.memo(SubmissionPreview);
