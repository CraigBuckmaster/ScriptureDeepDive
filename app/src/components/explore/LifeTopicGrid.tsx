/**
 * LifeTopicGrid — 2×2 grid of life topic categories (text-only, no icons).
 *
 * Loads the top categories via `getLifeTopicCategories()` sorted by display_order.
 * Passes the tapped category's id up so the consumer can route to a filtered screen.
 *
 * Part of Card #1263 (Explore redesign).
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, radii, fontFamily, spacing } from '../../theme';
import { getLifeTopicCategories } from '../../db/content';
import type { LifeTopicCategory } from '../../types';

const GRID_COUNT = 4;

export interface LifeTopicGridProps {
  onCategoryPress: (categoryId: string) => void;
  /** Override data fetching — useful for tests. */
  categories?: LifeTopicCategory[];
  /** Optional topic counts keyed by category id. Shown as a subtitle when provided. */
  topicCounts?: Record<string, number>;
}

/** Sort categories by display_order and take the top N. */
export function pickTopCategories(
  all: LifeTopicCategory[],
  n: number = GRID_COUNT,
): LifeTopicCategory[] {
  return [...all]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .slice(0, n);
}

export function LifeTopicGrid({
  onCategoryPress,
  categories,
  topicCounts,
}: LifeTopicGridProps) {
  const { base } = useTheme();
  const [loaded, setLoaded] = useState<LifeTopicCategory[] | null>(
    categories !== undefined ? categories : null,
  );

  useEffect(() => {
    if (categories !== undefined) {
      setLoaded(categories);
      return;
    }
    let cancelled = false;
    getLifeTopicCategories()
      .then((rows) => {
        if (!cancelled) setLoaded(rows);
      })
      .catch(() => {
        if (!cancelled) setLoaded([]);
      });
    return () => {
      cancelled = true;
    };
  }, [categories]);

  if (!loaded || loaded.length === 0) return null;

  const top = pickTopCategories(loaded, GRID_COUNT);

  return (
    <View style={styles.grid}>
      {top.map((cat) => {
        const count = topicCounts?.[cat.id];
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onCategoryPress(cat.id)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={cat.name}
            style={[
              styles.cell,
              {
                backgroundColor: base.tintDusk || base.bgElevated,
                borderColor: base.gold + '10',
              },
            ]}
          >
            <Text style={[styles.name, { color: base.text }]} numberOfLines={2}>
              {cat.name}
            </Text>
            {count != null ? (
              <Text style={[styles.count, { color: base.textMuted }]}>
                {count} {count === 1 ? 'topic' : 'topics'}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    flexBasis: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    minHeight: 64,
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  count: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
  },
});
