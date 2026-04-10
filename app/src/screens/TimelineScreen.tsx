/**
 * TimelineScreen — 203+ events on a horizontally scrollable SVG canvas.
 *
 * Modernized visual design:
 *   - Gradient era bands with depth and bottom accent borders
 *   - Polished axis with edge fade and gold-glow tick marks
 *   - Smart label density (major events labeled, minor markers only)
 *   - Visual marker hierarchy (3 sizes + glow rings for major events)
 *   - Dashed/solid stem lines with category gradient opacity
 *   - Bottom sheet detail panel (replaces Modal)
 */

import React, { useState, useCallback, useMemo, useEffect, useRef, useReducer } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs, LinearGradient, Stop,
  Rect, Line, Circle, G, Text as SvgText,
} from 'react-native-svg';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRoute, useNavigation } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getAllTimelineEntries } from '../db/content';
import { useContentImages } from '../hooks/useContentImages';
import { ContentImageGallery } from '../components/ContentImageGallery';
import { EraFilterBar } from '../components/tree/EraFilterBar';
import { BadgeChip } from '../components/BadgeChip';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useLandscapeUnlock } from '../hooks/useLandscapeUnlock';
import {
  yearToX, formatYear, assignLanes, computeTickMarks, computeSvgHeight,
  ERA_RANGES, TOTAL_WIDTH, AXIS_Y, ERA_BAR_Y, ERA_BAR_H,
  type PositionedEvent,
} from '../utils/timelineLayout';
import { useTheme, spacing, radii, eraNames, fontFamily } from '../theme';
import type { TimelineEntry } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { useSettingsStore } from '../stores';

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

/** Lighten a hex color by blending toward white. */
function lighten(hex: string, amount: number = 0.3): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function TimelineScreen() {
  const { base, eras, categoryColors, timelineSvg } = useTheme();
  useLandscapeUnlock();
  const route = useRoute<ScreenRouteProp<'Explore', 'Timeline'>>();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'Timeline'>>();
  const initialEventId = route?.params?.eventId;

  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEra, setFilterEra] = useState<string>('all');
  const [filters, dispatchFilter] = useReducer(filterReducer, INITIAL_FILTERS);
  const [selectedEvent, setSelectedEvent] = useState<PositionedEvent | null>(null);
  const { images: eventImages } = useContentImages('timeline', selectedEvent?.id);
  const timelineScrollRef = useRef<ScrollView>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getAllTimelineEntries().then((e) => { setEvents(e); setIsLoading(false); });
  }, []);

  // Mark getting-started checklist item
  useEffect(() => { useSettingsStore.getState().markGettingStartedDone('explore_timeline'); }, []);

  // Filter by active categories
  const categoryFiltered = useMemo(() => {
    const cats = new Set<string>();
    if (filters.event) cats.add('event');
    if (filters.book) cats.add('book');
    if (filters.person) cats.add('person');
    if (filters.world) cats.add('world');
    if (cats.size === 0) { cats.add('event'); cats.add('book'); }
    return events.filter((e) => cats.has(e.category));
  }, [events, filters]);

  const positioned = useMemo(() => assignLanes(categoryFiltered), [categoryFiltered]);

  const filtered = useMemo(() => {
    if (filterEra === 'all') return positioned;
    return positioned.filter((e) => e.era === filterEra);
  }, [positioned, filterEra]);

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
      const scrollTarget = Math.max(0, centreX - screenWidth / 2);
      timelineScrollRef.current?.scrollTo({ x: scrollTarget, animated: true });
    }
  }, [screenWidth]);

  const ticks = useMemo(() => computeTickMarks(), []);
  const snapPoints = useMemo(() => ['35%', '60%'], []);

  // Handle event selection → open bottom sheet
  const handleSelectEvent = useCallback((evt: PositionedEvent) => {
    setSelectedEvent(evt);
    sheetRef.current?.snapToIndex(0);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // Deep-link
  useEffect(() => {
    if (initialEventId && positioned.length) {
      const evt = positioned.find((e) =>
        e.id === initialEventId ||
        e.id === `evt_${initialEventId}` ||
        e.id === `bk_${initialEventId}`
      );
      if (evt) {
        // Scroll to centre the event horizontally
        const scrollTarget = Math.max(0, evt.x - screenWidth / 2);
        setTimeout(() => {
          timelineScrollRef.current?.scrollTo({ x: scrollTarget, animated: true });
        }, 100);
        handleSelectEvent(evt);
      }
    }
  }, [initialEventId, positioned.length, handleSelectEvent, screenWidth]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={[styles.loadingPad, { paddingTop: insets.top + spacing.lg }]}>
          <LoadingSkeleton lines={6} />
        </View>
      </View>
    );
  }

  const hasBelow = filters.person || filters.world;
  const SVG_HEIGHT = computeSvgHeight(hasBelow);

  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
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
              style={[styles.categoryChip, { borderColor: base.border, backgroundColor: base.bg + 'EE' }, filters[key] && [styles.categoryChipActive, { borderColor: base.gold + '55' }]]}
              accessibilityRole="button"
              accessibilityLabel={`${label} filter: ${filters[key] ? 'on' : 'off'}`}
              accessibilityState={{ selected: filters[key] }}
            >
              <View style={[styles.categoryDot, { backgroundColor: color }]} />
              <Text style={[styles.categoryLabel, { color: base.textMuted }, filters[key] && { color }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView ref={timelineScrollRef} horizontal showsHorizontalScrollIndicator style={styles.timelineScroll} accessible accessibilityLabel="Timeline" accessibilityHint="Scroll horizontally to explore events">
        <Svg width={TOTAL_WIDTH} height={SVG_HEIGHT}>
          {/* ── Gradient definitions ────────────────────── */}
          <Defs>
            {/* Era band gradients — vertical fade for depth */}
            {Object.keys(ERA_RANGES).map((era) => {
              const color = eras[era] ?? base.bgSurface;
              return (
                <LinearGradient key={`grad-${era}`} id={`grad-${era}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={lighten(color, 0.15)} stopOpacity={0.85} />
                  <Stop offset="1" stopColor={color} stopOpacity={0.4} />
                </LinearGradient>
              );
            })}
            {/* Axis fade — transparent at edges */}
            <LinearGradient id="axis-grad" x1="0" y1="0" x2={TOTAL_WIDTH} y2="0" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor={timelineSvg.axis} stopOpacity={0} />
              <Stop offset="3%" stopColor={timelineSvg.axis} stopOpacity={1} />
              <Stop offset="97%" stopColor={timelineSvg.axis} stopOpacity={1} />
              <Stop offset="100%" stopColor={timelineSvg.axis} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* ── Era bands with gradient depth ──────────── */}
          {Object.entries(ERA_RANGES).map(([era, [start, end]]) => {
            const x1 = yearToX(start);
            const x2 = yearToX(end);
            const eraColor = eras[era] ?? base.bgSurface;
            return (
              <G key={era}>
                <Rect x={x1} y={ERA_BAR_Y} width={x2 - x1} height={ERA_BAR_H}
                  fill={`url(#grad-${era})`} />
                {/* Bottom accent border */}
                <Line x1={x1} y1={ERA_BAR_Y + ERA_BAR_H} x2={x2} y2={ERA_BAR_Y + ERA_BAR_H}
                  stroke={lighten(eraColor, 0.4)} strokeWidth={1} opacity={0.5} />
                {/* Text shadow */}
                <SvgText x={(x1 + x2) / 2 + 1} y={ERA_BAR_Y + 27} textAnchor="middle"
                  fontSize={11} fill="#000" opacity={0.5} fontFamily="Cinzel_400Regular">
                  {(eraNames[era] ?? era).toUpperCase()}
                </SvgText>
                {/* Era label */}
                <SvgText x={(x1 + x2) / 2} y={ERA_BAR_Y + 26} textAnchor="middle"
                  fontSize={11} fill={base.text} fontFamily="Cinzel_400Regular">
                  {(eraNames[era] ?? era).toUpperCase()}
                </SvgText>
              </G>
            );
          })}

          {/* ── Polished axis line ─────────────────────── */}
          <Line x1={0} y1={AXIS_Y} x2={TOTAL_WIDTH} y2={AXIS_Y}
            stroke="url(#axis-grad)" strokeWidth={1.5} />

          {/* ── Tick marks with gold glow ──────────────── */}
          {ticks.map((tick, i) => (
            <G key={i}>
              {/* Gold glow behind major ticks */}
              {tick.major && (
                <Line x1={tick.x} y1={AXIS_Y - 8} x2={tick.x} y2={AXIS_Y + 8}
                  stroke={base.gold} strokeWidth={3} opacity={0.12} />
              )}
              <Line x1={tick.x} y1={AXIS_Y - (tick.major ? 7 : 4)} x2={tick.x} y2={AXIS_Y + (tick.major ? 7 : 4)}
                stroke={timelineSvg.tick} strokeWidth={tick.major ? 1.5 : 0.5} />
              {tick.major && (
                <SvgText x={tick.x} y={AXIS_Y + 22} textAnchor="middle" fontSize={10} fill={base.gold}
                  fontFamily="SourceSans3_400Regular">
                  {tick.label}
                </SvgText>
              )}
            </G>
          ))}

          {/* ── Events with visual hierarchy ───────────── */}
          {filtered.map((evt) => {
            const catColor = evt.category === 'world' ? categoryColors.world
              : evt.category === 'person' ? categoryColors.person
              : evt.category === 'book' ? categoryColors.book
              : evt.era ? (eras[evt.era] ?? categoryColors.event) : categoryColors.event;
            const isSelected = selectedEvent?.id === evt.id;
            const isBook = evt.category === 'book';
            const isMajor = evt.significance === 'major';
            const markerR = isMajor ? 6 : 3.5;

            return (
              <G key={evt.id} onPress={() => handleSelectEvent(evt)}>
                {/* Hit area */}
                <Rect x={evt.x - 15} y={evt.y - 15} width={isMajor ? evt.labelWidth : 30} height={30}
                  fill="transparent" />

                {/* Stem — dashed upper, solid lower */}
                {evt.y < AXIS_Y ? (
                  <>
                    <Line x1={evt.x} y1={evt.y + markerR} x2={evt.x} y2={(evt.y + AXIS_Y) / 2}
                      stroke={catColor} strokeWidth={0.6} opacity={0.25} strokeDasharray="3,2" />
                    <Line x1={evt.x} y1={(evt.y + AXIS_Y) / 2} x2={evt.x} y2={AXIS_Y}
                      stroke={catColor} strokeWidth={0.6} opacity={0.5} />
                  </>
                ) : (
                  <>
                    <Line x1={evt.x} y1={AXIS_Y} x2={evt.x} y2={(evt.y + AXIS_Y) / 2}
                      stroke={catColor} strokeWidth={0.6} opacity={0.5} />
                    <Line x1={evt.x} y1={(evt.y + AXIS_Y) / 2} x2={evt.x} y2={evt.y - markerR}
                      stroke={catColor} strokeWidth={0.6} opacity={0.25} strokeDasharray="3,2" />
                  </>
                )}

                {/* Selection glow */}
                {isSelected && (
                  <Circle cx={evt.x} cy={evt.y} r={markerR + 6} fill={base.gold} opacity={0.25} />
                )}

                {/* Outer glow ring for major events */}
                {isMajor && !isBook && (
                  <Circle cx={evt.x} cy={evt.y} r={markerR + 3}
                    stroke={catColor} strokeWidth={1} fill="none" opacity={0.25} />
                )}

                {/* Marker */}
                {isBook ? (
                  <G>
                    <Rect x={evt.x - 6} y={evt.y - 7} width={12} height={14} rx={2}
                      fill={catColor} stroke={lighten(catColor, 0.3)} strokeWidth={0.5} />
                    {/* Book spine */}
                    <Line x1={evt.x - 4} y1={evt.y - 6} x2={evt.x - 4} y2={evt.y + 6}
                      stroke={lighten(catColor, 0.5)} strokeWidth={0.5} opacity={0.6} />
                  </G>
                ) : (
                  <Circle cx={evt.x} cy={evt.y} r={markerR}
                    fill={catColor} stroke={lighten(catColor, 0.3)} strokeWidth={0.5} />
                )}

                {/* Label — only for major events or selected */}
                {(isMajor || isSelected) && (
                  <SvgText x={evt.x + (isBook ? 10 : markerR + 5)} y={evt.y + 4} fontSize={11}
                    fill={isSelected ? base.gold : catColor}
                    fontFamily="SourceSans3_400Regular"
                    fontWeight={isSelected ? '600' : '400'}>
                    {evt.name} · {formatYear(evt.year)}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </ScrollView>

      {/* ── Bottom sheet detail panel ──────────────── */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleCloseSheet}
        backgroundStyle={{
          backgroundColor: base.bgElevated,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderTopWidth: 1,
          borderColor: base.border,
        }}
        handleIndicatorStyle={{ backgroundColor: base.textMuted, width: 36 }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.detailContent}>
          {selectedEvent && (
            <>
              {/* Era accent bar */}
              {selectedEvent.era && (
                <View style={[styles.eraAccentBar, { backgroundColor: eras[selectedEvent.era] ?? base.gold }]} />
              )}
              {selectedEvent.era && <BadgeChip label={eraNames[selectedEvent.era] ?? selectedEvent.era} color={eras[selectedEvent.era] ?? base.gold} />}
              {eventImages.length > 0 && <ContentImageGallery images={eventImages} />}
              <Text style={[styles.detailTitle, { color: base.text }]}>
                {selectedEvent.name}
              </Text>
              <Text style={[styles.detailYear, { color: base.gold }]}>
                {formatYear(selectedEvent.year)}
              </Text>
              {selectedEvent.scripture_ref && (
                <Text style={[styles.detailRef, { color: base.goldDim }]}>
                  {selectedEvent.scripture_ref}
                </Text>
              )}
              {selectedEvent.summary && (
                <Text style={[styles.detailSummary, { color: base.textDim }]}>
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
                    style={[styles.chapterButton, { backgroundColor: base.gold + '22', borderColor: base.gold + '55' }]}
                    onPress={() => {
                      sheetRef.current?.close();
                      setSelectedEvent(null);
                      (navigation as any).navigate('ReadTab', {
                        screen: 'Chapter',
                        params: { bookId, chapterNum },
                      });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to chapter ${chapterNum}`}
                  >
                    <Text style={[styles.chapterButtonText, { color: base.gold }]}>Go to Chapter →</Text>
                  </TouchableOpacity>
                );
              })()}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  detailContent: {
    padding: spacing.md,
  },
  detailTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  detailYear: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    marginTop: 4,
  },
  detailRef: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    marginTop: 4,
  },
  detailSummary: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  chapterButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  chapterButtonText: {
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
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    height: 28,
    opacity: 0.5,
  },
  categoryChipActive: {
    opacity: 1,
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
  },
  timelineScroll: {
    flex: 1,
  },
  eraAccentBar: {
    height: 3,
    borderRadius: 1.5,
    marginBottom: spacing.md,
    width: '30%',
    alignSelf: 'center',
  },
});

export default withErrorBoundary(TimelineScreen);
