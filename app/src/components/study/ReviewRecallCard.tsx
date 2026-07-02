/**
 * components/study/ReviewRecallCard.tsx — Single focused review card
 * on the Study hub (#1832). Shows one due prompt at a time; "Recall it"
 * completes the item, "Later" cycles to the next due item.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { formatChapterRef } from '../../services/guidedStudy';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { GuidedReviewItem } from '../../types';

interface Props {
  item: GuidedReviewItem;
  dueCount: number;
  onRecall: () => void;
  onLater: () => void;
}

export function ReviewRecallCard({ item, dueCount, onRecall, onLater }: Props) {
  const { base } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border }]}
    >
      <View style={styles.header}>
        <Clock size={14} color={base.gold} />
        <Text style={[styles.headerText, { color: base.textMuted }]}>
          {formatChapterRef(item.chapter_id)}
          {dueCount > 1 ? `  ·  1 of ${dueCount} due` : ''}
        </Text>
      </View>

      <Text style={[styles.prompt, { color: base.text }]}>{item.prompt}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onRecall}
          activeOpacity={0.72}
          style={[styles.action, { borderColor: `${base.gold}55` }]}
          accessibilityRole="button"
          accessibilityLabel="Recall it — mark this review complete"
        >
          <Text style={[styles.actionLabel, { color: base.gold }]}>Recall it</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLater}
          activeOpacity={0.72}
          style={[styles.action, { borderColor: base.border }]}
          accessibilityRole="button"
          accessibilityLabel="Later — show the next due review"
        >
          <Text style={[styles.actionLabel, { color: base.textMuted }]}>Later</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  prompt: {
    fontFamily: fontFamily.body,
    fontSize: 17,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  actionLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
});
