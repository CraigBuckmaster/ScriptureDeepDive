/**
 * TimelineScreen — 216 events on a horizontally scrollable SVG canvas.
 * Era-colored bands, swim-lane labels, pan+pinch gestures, detail panel.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Line, Circle, G, Text as SvgText } from 'react-native-svg';

import { useRoute } from '@react-navigation/native';
import { getAllTimelineEntries } from '../db/content';
import { EraFilterBar } from '../components/tree/EraFilterBar';
import { BadgeChip } from '../components/BadgeChip';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useLandscapeUnlock } from '../hooks/useLandscapeUnlock';
import {
  yearToX, formatYear, assignLanes, computeTickMarks, computeSvgHeight,
  ERA_RANGES, TOTAL_WIDTH, AXIS_Y, ERA_BAR_Y, ERA_BAR_H,
  type PositionedEvent,
} from '../utils/timelineLayout';
import { base, spacing, radii, eras, eraNames, fontFamily } from '../theme';
import type { TimelineEntry } from '../types';

export default function TimelineScreen() {
  useLandscapeUnlock();
  const route = useRoute<any>();
  const initialEventId = route?.params?.eventId;

  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEra, setFilterEra] = useState<string>('all');
  const [showEvents, setShowEvents] = useState(true);
  const [showPeople, setShowPeople] = useState(true);
  const [showWorld, setShowWorld] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<PositionedEvent | null>(null);
  const timelineScrollRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getAllTimelineEntries().then((e) => { setEvents(e); setIsLoading(false); });
  }, []);

  // Filter by active categories
  const categoryFiltered = useMemo(() => {
    const cats = new Set<string>();
    if (showEvents) cats.add('event');
    if (showPeople) cats.add('person');
    if (showWorld) cats.add('world');
    if (cats.size === 0) cats.add('event'); // fallback
    return events.filter((e) => cats.has(e.category));
  }, [events, showEvents, showPeople, showWorld]);

  const positioned = useMemo(() => assignLanes(categoryFiltered), [categoryFiltered]);

  const filtered = useMemo(() => {
    if (filterEra === 'all') return positioned;
    return positioned.filter((e) => e.era === filterEra);
  }, [positioned, filterEra]);

  /** Select era filter and scroll the timeline to centre on that era's band. */
  const handleEraChange = useCallback((era: string) => {
    setFilterEra(era);
    if (era === 'all') {
      timelineScrollRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }
    const range = ERA_RANGES[era];
    if (range) {
      const x1 = yearToX(range[0]);
      const x2 = yearToX(range[1]);
      const centreX = (x1 + x2) / 2;
      // Scroll so the era midpoint is centred on screen
      const scrollTarget = Math.max(0, centreX - screenWidth / 2);
      timelineScrollRef.current?.scrollTo({ x: scrollTarget, animated: true });
    }
  }, [screenWidth]);

  const ticks = useMemo(() => computeTickMarks(), []);

  // Deep-link
  useEffect(() => {
    if (initialEventId && positioned.length) {
      const evt = positioned.find((e) => e.id === initialEventId);
      if (evt) setSelectedEvent(evt);
    }
  }, [initialEventId, positioned.length]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingPad, { paddingTop: insets.top + spacing.lg }]}>
          <LoadingSkeleton lines={6} />
        </View>
      </View>
    );
  }

  const hasBelow = showPeople || showWorld;
  const SVG_HEIGHT = computeSvgHeight(hasBelow);

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <EraFilterBar activeEra={filterEra} onSelect={handleEraChange} />

        {/* Category toggles */}
        <View style={styles.categoryRow}>
          <TouchableOpacity
            onPress={() => setShowEvents((v) => !v)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            style={[styles.categoryChip, showEvents && styles.categoryChipActive]}
          >
            <View style={[styles.categoryDot, { backgroundColor: base.gold }]} />
            <Text style={[styles.categoryLabel, showEvents && { color: base.gold }]}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowPeople((v) => !v)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            style={[styles.categoryChip, showPeople && styles.categoryChipActive]}
          >
            <View style={[styles.categoryDot, { backgroundColor: '#6a9fb5' }]} />
            <Text style={[styles.categoryLabel, showPeople && { color: '#6a9fb5' }]}>People</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowWorld((v) => !v)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            style={[styles.categoryChip, showWorld && styles.categoryChipActive]}
          >
            <View style={[styles.categoryDot, { backgroundColor: '#b07d4f' }]} />
            <Text style={[styles.categoryLabel, showWorld && { color: '#b07d4f' }]}>World History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={timelineScrollRef} horizontal showsHorizontalScrollIndicator style={{ flex: 1 }} accessible accessibilityLabel="Timeline" accessibilityHint="Scroll horizontally to explore events">
        <Svg width={TOTAL_WIDTH} height={SVG_HEIGHT}>
          {/* Era bands */}
          {Object.entries(ERA_RANGES).map(([era, [start, end]]) => {
            const x1 = yearToX(start);
            const x2 = yearToX(end);
            return (
              <G key={era}>
                <Rect x={x1} y={ERA_BAR_Y} width={x2 - x1} height={ERA_BAR_H}
                  fill={eras[era] ?? base.bgSurface} opacity={0.75} />
                <SvgText x={(x1 + x2) / 2} y={ERA_BAR_Y + 26} textAnchor="middle"
                  fontSize={11} fill="#f0e8d8" fontFamily="Cinzel_400Regular">
                  {(eraNames[era] ?? era).toUpperCase()}
                </SvgText>
              </G>
            );
          })}

          {/* Axis line */}
          <Line x1={0} y1={AXIS_Y} x2={TOTAL_WIDTH} y2={AXIS_Y} stroke="#3a2808" strokeWidth={1} />

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <G key={i}>
              <Line x1={tick.x} y1={AXIS_Y - (tick.major ? 7 : 4)} x2={tick.x} y2={AXIS_Y + (tick.major ? 7 : 4)}
                stroke="#5a4a28" strokeWidth={tick.major ? 1.5 : 0.5} />
              {tick.major && (
                <SvgText x={tick.x} y={AXIS_Y + 20} textAnchor="middle" fontSize={8} fill={base.textMuted}
                  fontFamily="SourceSans3_400Regular">
                  {tick.label}
                </SvgText>
              )}
            </G>
          ))}

          {/* Events */}
          {filtered.map((evt) => {
            // Color by category: events use era color, people are teal, world is amber
            const catColor = evt.category === 'world' ? '#b07d4f'
              : evt.category === 'person' ? '#6a9fb5'
              : evt.era ? (eras[evt.era] ?? base.gold) : base.gold;
            const isSelected = selectedEvent?.id === evt.id;

            return (
              <G key={evt.id} onPress={() => setSelectedEvent(evt)}>
                {/* Invisible hit rect — makes the entire label area tappable */}
                <Rect x={evt.x - 10} y={evt.y - 14} width={evt.labelWidth} height={28}
                  fill="transparent" />
                {/* Stem line — connects event dot to axis */}
                <Line x1={evt.x} y1={evt.y} x2={evt.x} y2={AXIS_Y} stroke={catColor} strokeWidth={0.5} opacity={0.4} />
                {/* Circle */}
                {isSelected && <Circle cx={evt.x} cy={evt.y} r={10} fill={base.gold} opacity={0.3} />}
                <Circle cx={evt.x} cy={evt.y} r={6} fill={catColor} />
                {/* Label */}
                <SvgText x={evt.x + 10} y={evt.y + 5} fontSize={11} fill={catColor}
                  fontFamily="SourceSans3_400Regular">
                  {evt.name} · {formatYear(evt.year)}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>

      {/* Detail panel */}
      {selectedEvent && (
        <Modal visible transparent animationType="slide">
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelectedEvent(null)} />
          <View style={styles.detailSheet}>
            <ScrollView contentContainerStyle={styles.detailContent}>
              <View style={styles.grabHandle} />
              {selectedEvent.era && <BadgeChip label={eraNames[selectedEvent.era] ?? selectedEvent.era} color={eras[selectedEvent.era] ?? base.gold} />}
              <Text style={styles.detailTitle}>
                {selectedEvent.name}
              </Text>
              <Text style={styles.detailYear}>
                {formatYear(selectedEvent.year)}
              </Text>
              {selectedEvent.scripture_ref && (
                <Text style={styles.detailRef}>
                  {selectedEvent.scripture_ref}
                </Text>
              )}
              {selectedEvent.summary && (
                <Text style={styles.detailSummary}>
                  {selectedEvent.summary}
                </Text>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  modalBackdrop: {
    flex: 1,
  },
  detailSheet: {
    backgroundColor: base.bgElevated,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: 1,
    borderColor: base.border,
    maxHeight: '50%',
  },
  detailContent: {
    padding: spacing.md,
  },
  grabHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: base.textMuted,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  detailTitle: {
    color: base.text,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  detailYear: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    marginTop: 4,
  },
  detailRef: {
    color: base.goldDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    marginTop: 4,
  },
  detailSummary: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: base.border,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    height: 28,
    backgroundColor: base.bg + 'EE',
    opacity: 0.5,
  },
  categoryChipActive: {
    opacity: 1,
    borderColor: base.gold + '55',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.3,
    color: base.textMuted,
  },
});
