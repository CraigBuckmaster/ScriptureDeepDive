/**
 * TimelineEraStrip — Proportional horizontal era-filter strip.
 *
 * Each era's width is proportional to its event count. Tapping a segment
 * selects the era (or deselects if already active). Selected segment
 * shows a brighter gradient + 2px bottom accent line.
 *
 * Part of Card #1264 (Timeline Phase 1).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, fontFamily, spacing } from '../../theme';
import type { EraRow } from '../../db/content/reference';

export interface TimelineEraStripProps {
  eras: EraRow[];
  eventCounts: Record<string, number>;
  activeEraId: string | null;
  onSelectEra: (eraId: string | null) => void;
}

/**
 * Compute the proportional width fraction (0..1) for each era based on event count.
 * Every era has a minimum visible slice so the segment remains tappable.
 */
export function computeEraShares(
  eras: EraRow[],
  eventCounts: Record<string, number>,
  minShare = 0.04,
): { id: string; share: number }[] {
  const totalCount = eras.reduce((sum, e) => sum + (eventCounts[e.id] ?? 0), 0);
  if (totalCount <= 0) {
    const equal = 1 / Math.max(1, eras.length);
    return eras.map((e) => ({ id: e.id, share: equal }));
  }
  const raw = eras.map((e) => ({
    id: e.id,
    share: Math.max(minShare, (eventCounts[e.id] ?? 0) / totalCount),
  }));
  const total = raw.reduce((s, r) => s + r.share, 0);
  return raw.map((r) => ({ id: r.id, share: r.share / total }));
}

/** First word of a label — e.g., "Divided Kingdom" → "Divided". */
export function firstWord(label: string): string {
  const trimmed = (label ?? '').trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0];
}

/** Human-friendly date range (negatives → "BC"). */
export function formatEraRange(start: number | null, end: number | null): string {
  if (start == null || end == null) return '';
  const fmt = (n: number) => (n < 0 ? `${Math.abs(n)} BC` : n === 0 ? 'AD 0' : `AD ${n}`);
  return `${fmt(start)} – ${fmt(end)}`;
}

export function TimelineEraStrip({
  eras,
  eventCounts,
  activeEraId,
  onSelectEra,
}: TimelineEraStripProps) {
  const { base } = useTheme();
  const shares = computeEraShares(eras, eventCounts);
  const active = eras.find((e) => e.id === activeEraId) ?? null;
  const activeCount = active ? eventCounts[active.id] ?? 0 : 0;

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.strip, { backgroundColor: base.bgSurface }]}
        accessibilityRole="tablist"
      >
        {shares.map(({ id, share }) => {
          const era = eras.find((e) => e.id === id);
          if (!era) return null;
          const isSelected = id === activeEraId;
          const isWide = (eventCounts[id] ?? 0) > 30;
          const color = era.hex ?? base.gold;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => onSelectEra(isSelected ? null : id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${era.name} era, ${eventCounts[id] ?? 0} events`}
              style={[
                styles.segment,
                {
                  flex: share,
                  backgroundColor: color + (isSelected ? '33' : '14'),
                  borderBottomColor: isSelected ? color : 'transparent',
                  borderBottomWidth: 2,
                },
              ]}
            >
              {isWide ? (
                <Text
                  numberOfLines={1}
                  style={[styles.segmentLabel, { color: isSelected ? base.text : base.textMuted }]}
                >
                  {firstWord(era.name)}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
      {active ? (
        <View style={styles.caption}>
          <Text style={[styles.captionEra, { color: active.hex ?? base.gold }]}>
            {active.name}
          </Text>
          <Text style={[styles.captionMeta, { color: base.textMuted }]}>
            {formatEraRange(active.range_start, active.range_end)}
            {activeCount > 0 ? ` • ${activeCount} events` : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  strip: {
    flexDirection: 'row',
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segmentLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  caption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.sm,
  },
  captionEra: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    letterSpacing: 1,
  },
  captionMeta: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
});
