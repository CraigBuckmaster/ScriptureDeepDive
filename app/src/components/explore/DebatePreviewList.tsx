/**
 * DebatePreviewList — Top 3 debates as vertical list cards + "see all" link.
 *
 * No icons — a 3px gold left border is the accent. Data loads internally.
 *
 * Part of Card #1263 (Explore redesign).
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, radii, fontFamily, spacing } from '../../theme';
import { getDebateTopics } from '../../db/content';
import type { DebateTopicSummary } from '../../types';

const PREVIEW_COUNT = 3;

export interface DebatePreviewListProps {
  onDebatePress: (id: string) => void;
  onSeeAll: () => void;
  /** Override data fetching — useful for tests and custom integrations. */
  debates?: DebateTopicSummary[];
  /** Total count shown in the "All N debates" link. If omitted, the loaded list length is used. */
  totalCount?: number;
}

/** Count positions encoded in `positions_json`. Safe on malformed JSON. */
export function countPositions(json: string | null | undefined): number {
  if (!json) return 0;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/** Sort debates by position count (desc), return the top `n`. */
export function pickTopDebates(
  all: DebateTopicSummary[],
  n: number = PREVIEW_COUNT,
): DebateTopicSummary[] {
  return [...all]
    .sort((a, b) => {
      const aCount = a.position_count ?? countPositions(a.positions_json);
      const bCount = b.position_count ?? countPositions(b.positions_json);
      return bCount - aCount;
    })
    .slice(0, n);
}

export function DebatePreviewList({
  onDebatePress,
  onSeeAll,
  debates,
  totalCount,
}: DebatePreviewListProps) {
  const { base } = useTheme();
  const [loaded, setLoaded] = useState<DebateTopicSummary[] | null>(
    debates !== undefined ? debates : null,
  );

  useEffect(() => {
    if (debates !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(debates);
      return;
    }
    let cancelled = false;
    getDebateTopics()
      .then((rows) => {
        if (!cancelled) setLoaded(rows);
      })
      .catch(() => {
        if (!cancelled) setLoaded([]);
      });
    return () => {
      cancelled = true;
    };
  }, [debates]);

  if (!loaded || loaded.length === 0) return null;

  const top = pickTopDebates(loaded, PREVIEW_COUNT);
  const total = totalCount ?? loaded.length;

  return (
    <View style={styles.container}>
      {top.map((debate) => {
        const count = debate.position_count ?? countPositions(debate.positions_json);
        const verseRef = debate.passage ?? debate.book_id;
        return (
          <TouchableOpacity
            key={debate.id}
            style={[
              styles.row,
              {
                backgroundColor: base.tintEmber || base.bgElevated,
                borderLeftColor: base.gold,
              },
            ]}
            onPress={() => onDebatePress(debate.id)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${debate.title}, ${count} positions`}
          >
            <View style={styles.rowText}>
              <Text style={[styles.question, { color: base.text }]} numberOfLines={2}>
                {debate.title}
              </Text>
              <Text style={[styles.meta, { color: base.textMuted }]} numberOfLines={1}>
                <Text style={{ color: base.gold }}>{verseRef}</Text>
                {verseRef ? ' • ' : ''}
                {count} positions
              </Text>
            </View>
            <Text style={[styles.chevron, { color: base.textMuted }]}>›</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        onPress={onSeeAll}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`See all ${total} debates`}
      >
        <Text style={[styles.seeAll, { color: base.gold }]}>All {total} debates ›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.sm,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  question: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    lineHeight: 14,
  },
  meta: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
  },
  chevron: {
    fontSize: 18,
    lineHeight: 18,
  },
  seeAll: {
    alignSelf: 'flex-end',
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    paddingVertical: 4,
  },
});
