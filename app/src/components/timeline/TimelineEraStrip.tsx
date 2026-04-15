/**
 * TimelineEraStrip — Scrollable horizontal era-filter strip.
 *
 * Each era is a labeled pill with a minimum tappable width. The strip
 * scrolls horizontally so all eras are readable regardless of count.
 * Tapping a segment selects the era (or deselects if already active).
 * Selected segment shows a brighter fill + 2px bottom accent line.
 * A caption row below shows the selected era's full name and date range.
 *
 * Part of Card #1264 (Timeline Phase 1).
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet,
  type LayoutChangeEvent } from 'react-native';
import { useTheme, fontFamily, eraPillLabels, spacing } from '../../theme';
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

/** Short label for a pill — uses eraPillLabels or first word as fallback. */
export function pillLabel(era: EraRow): string {
  return eraPillLabels[era.id] ?? (era.name ?? '').split(/\s+/)[0] ?? '';
}

/** Human-friendly date range (negatives → "BC"). */
export function formatEraRange(start: number | null, end: number | null): string {
  if (start == null || end == null) return '';
  const fmt = (n: number) => (n < 0 ? `${Math.abs(n)} BC` : n === 0 ? 'AD 0' : `AD ${n}`);
  return `${fmt(start)} – ${fmt(end)}`;
}

/** @deprecated Kept for test compatibility. Use pillLabel instead. */
export function firstWord(label: string): string {
  const trimmed = (label ?? '').trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0];
}

/** Minimum segment width so every era is tappable and labeled. */
const MIN_SEGMENT_WIDTH = 72;
/** Extra width per proportional share unit, added on top of the minimum. */
const PROPORTIONAL_EXTRA = 40;

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

  const scrollRef = useRef<ScrollView>(null);
  const segmentLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const handleSegmentLayout = useCallback(
    (eraId: string) => (e: LayoutChangeEvent) => {
      segmentLayouts.current[eraId] = {
        x: e.nativeEvent.layout.x,
        width: e.nativeEvent.layout.width,
      };
    },
    [],
  );

  const handleSelect = useCallback(
    (eraId: string, isSelected: boolean) => {
      onSelectEra(isSelected ? null : eraId);
      if (!isSelected) {
        requestAnimationFrame(() => {
          const layout = segmentLayouts.current[eraId];
          if (layout && scrollRef.current) {
            scrollRef.current.scrollTo({
              x: Math.max(0, layout.x - 40),
              animated: true,
            });
          }
        });
      }
    },
    [onSelectEra],
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.strip, { backgroundColor: base.bgSurface }]}
        accessibilityRole="tablist"
      >
        {shares.map(({ id, share }) => {
          const era = eras.find((e) => e.id === id);
          if (!era) return null;
          const isSelected = id === activeEraId;
          const color = era.hex ?? base.gold;
          const width = MIN_SEGMENT_WIDTH + share * PROPORTIONAL_EXTRA * eras.length;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => handleSelect(id, isSelected)}
              onLayout={handleSegmentLayout(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${era.name} era, ${eventCounts[id] ?? 0} events`}
              style={[
                styles.segment,
                {
                  width,
                  backgroundColor: color + (isSelected ? '33' : '14'),
                  borderBottomColor: isSelected ? color : 'transparent',
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.segmentLabel, { color: isSelected ? base.text : base.textMuted }]}
              >
                {pillLabel(era)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  segmentLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.3,
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
