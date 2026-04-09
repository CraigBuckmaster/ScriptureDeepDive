/**
 * GettingStartedCard — Checklist for new users on the home screen.
 *
 * Shows 4 tappable items that introduce key features. Items check off
 * as the user completes them. The card hides when all items are done
 * or chaptersRead >= 3.
 *
 * Part of Epic #1048 — New User Experience (#1051).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowRight, CheckCircle, Circle } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

export interface GettingStartedItem {
  key: string;
  title: string;
  subtitle: string;
}

interface Props {
  items: GettingStartedItem[];
  completedKeys: Set<string>;
  onItemPress: (item: GettingStartedItem) => void;
}

export const GETTING_STARTED_ITEMS: GettingStartedItem[] = [
  {
    key: 'first_chapter',
    title: 'Read your first chapter',
    subtitle: 'Start with Genesis 1 and explore the study panels',
  },
  {
    key: 'first_panel',
    title: 'Tap a study panel',
    subtitle: 'Open any Hebrew, History, or scholar button below the text',
  },
  {
    key: 'meet_scholars',
    title: 'Meet the scholars',
    subtitle: 'Browse the 54 scholars behind the commentary',
  },
  {
    key: 'explore_timeline',
    title: 'Explore the timeline',
    subtitle: 'See where Genesis fits in 4,000 years of biblical history',
  },
];

export function GettingStartedCard({ items, completedKeys, onItemPress }: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[styles.sectionLabel, { color: base.textMuted }]}
        accessibilityRole="header"
      >
        GETTING STARTED
      </Text>
      <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '25' }]}>
        {items.map((item, i) => {
          const done = completedKeys.has(item.key);
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onItemPress(item)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}${done ? ', completed' : ''}`}
              style={[
                styles.row,
                i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: base.border },
              ]}
            >
              {done ? (
                <CheckCircle size={20} color={base.gold} />
              ) : (
                <Circle size={20} color={base.border} />
              )}
              <View style={styles.rowContent}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: done ? base.textMuted : base.text },
                    done && styles.rowTitleDone,
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={[styles.rowSubtitle, { color: base.textMuted }]}>
                  {item.subtitle}
                </Text>
              </View>
              {!done && <ArrowRight size={14} color={base.textMuted} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  rowTitleDone: {
    textDecorationLine: 'line-through',
  },
  rowSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 1,
  },
});
