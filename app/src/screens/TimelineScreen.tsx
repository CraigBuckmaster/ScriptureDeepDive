/**
 * TimelineScreen — 216 events on a horizontally scrollable SVG canvas.
 * Era-colored bands, swim-lane labels, pan+pinch gestures, detail panel.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef, useReducer } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Line, Circle, G, Text as SvgText } from 'react-native-svg';

import { useRoute, useNavigation } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
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
import { base, spacing, radii, eras, eraNames, fontFamily, categoryColors } from '../theme';
import type { TimelineEntry } from '../types';

interface CategoryFilters {
  event: boolean;
  book: boolean;
  person: boolean;
  world: boolean;
}

type FilterAction = { type: 'toggle'; category: keyof CategoryFilters };

function filterReducer(state: CategoryFilters, action: FilterAction): CategoryFilters {
  return { ...state, [action.category]: !state[action.category] };
}

const INITIAL_FILTERS: CategoryFilters = { event: true, book: true, person: true, world: true };

export default function TimelineScreen() {
  useLandscapeUnlock();
  const route = useRoute<ScreenRouteProp<'Explore', 'Timeline'>>();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'Timeline'>>();
  const initialEventId = route?.params?.eventId;

  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEra, setFilterEra] = useState<string>('all');
  const [filters, dispatchFilter] = useReducer(filterReducer, INITIAL_FILTERS);
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
    if (filters.event) cats.add('event');
    if (filters.book) cats.add('book');
    if (filters.person) cats.add('person');
    if (filters.world) cats.add('world');
    if (cats.size === 0) { cats.add('event'); cats.add('book'); } // fallback
    return events.filter((e) => cats.has(e.category));
  }, [events, filters]);

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

  // Deep-link — chapter JSON stores raw IDs (e.g. "creation") while
  // the timelines table uses prefixed IDs (e.g. "evt_creation", "bk_book-genesis").
  useEffect(() => {
    if (initialEventId && positioned.length) {
      const evt = positioned.find((e) =>
        e.id === initialEventId ||
        e.id === `evt_${initialEventId}` ||
        e.id === `bk_${initialEventId}`
      );
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

  const hasBelow = filters.person || filters.world;
  const SVG_HEIGHT = computeSvgHeight(hasBelow);

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <EraFilterBar activeEra={filterEra} onSelect={handleEraChange} />

        {/* Category toggles */}
        <View style={styles.categoryRow}>
          {([
            { key: 'event' as const, label: 'Events', color: categoryColors.event },
            { key: 'book' as const, label: 'Books', color: categoryColors.book },
            { key: 'person' as const, label: 'People', color: categoryColors.person },
            { key: 'world' as const, label: 'World History', color: categoryColors.world },
          ]).map(({ key, label, color }) => (
            <TouchableOpacity
              key={key}
              onPress={() => dispatchFilter({ type: 'toggle', category: key })}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              style={[styles.categoryChip, filters[key] && styles.categoryChipActive]}
            >
              <View style={[styles.categoryDot, { backgroundColor: color }]} />
              <Text style={[styles.categoryLabel, filters[key] && { color }]}>{label}</Text>
            </TouchableOpacity>
          ))}
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
            const catColor = evt.category === 'world' ? categoryColors.world
              : evt.category === 'person' ? categoryColors.person
              : evt.category === 'book' ? categoryColors.book
              : evt.era ? (eras[evt.era] ?? categoryColors.event) : categoryColors.event;
            const isSelected = selectedEvent?.id === evt.id;
            const isBook = evt.category === 'book';

            return (
              <G key={evt.id} onPress={() => setSelectedEvent(evt)}>
                {/* Invisible hit rect — makes the entire label area tappable */}
                <Rect x={evt.x - 10} y={evt.y - 14} width={evt.labelWidth} height={28}
                  fill="transparent" />
                {/* Stem line — connects event dot to axis */}
                <Line x1={evt.x} y1={evt.y} x2={evt.x} y2={AXIS_Y} stroke={catColor} strokeWidth={0.5} opacity={0.4} />
                {/* Marker — square for books, circle for everything else */}
                {isSelected && (
                  isBook
                    ? <Rect x={evt.x - 10} y={evt.y - 10} width={20} height={20} rx={3} fill={catColor} opacity={0.3} />
                    : <Circle cx={evt.x} cy={evt.y} r={10} fill={base.gold} opacity={0.3} />
                )}
                {isBook
                  ? <Rect x={evt.x - 5} y={evt.y - 5} width={10} height={10} rx={2} fill={catColor} />
                  : <Circle cx={evt.x} cy={evt.y} r={6} fill={catColor} />
                }
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
              {selectedEvent.chapter_link && (() => {
                const match = selectedEvent.chapter_link!.match(/(\w+)\/(\w+)_(\d+)\.html/);
                if (!match) return null;
                const bookId = match[2].toLowerCase();
                const chapterNum = parseInt(match[3], 10);
                return (
                  <TouchableOpacity
                    style={styles.chapterButton}
                    onPress={() => {
                      setSelectedEvent(null);
                      navigation.navigate('ReadTab', {
                        screen: 'Chapter',
                        params: { bookId, chapterNum },
                      });
                    }}
                  >
                    <Text style={styles.chapterButtonText}>Go to Chapter →</Text>
                  </TouchableOpacity>
                );
              })()}
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
  chapterButton: {
    marginTop: spacing.md,
    backgroundColor: base.gold + '22',
    borderWidth: 1,
    borderColor: base.gold + '55',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  chapterButtonText: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
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
