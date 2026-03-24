/**
 * TimelineScreen — 216 events on a horizontally scrollable SVG canvas.
 * Era-colored bands, swim-lane labels, pan+pinch gestures, detail panel.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
import Svg, { Rect, Line, Circle, G, Text as SvgText } from 'react-native-svg';

import { useRoute } from '@react-navigation/native';
import { getAllTimelineEntries } from '../db/content';
import { EraFilterBar } from '../components/tree/EraFilterBar';
import { BadgeChip } from '../components/BadgeChip';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  yearToX, formatYear, assignLanes, computeTickMarks,
  ERA_RANGES, TOTAL_WIDTH, AXIS_Y, ERA_BAR_Y, ERA_BAR_H, LANE_TOP, LANE_HEIGHT,
  type PositionedEvent,
} from '../utils/timelineLayout';
import { base, spacing, radii, eras, eraNames } from '../theme';
import type { TimelineEntry } from '../types';

export default function TimelineScreen() {
  const route = useRoute<any>();
  const initialEventId = route?.params?.eventId;

  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEra, setFilterEra] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<PositionedEvent | null>(null);

  useEffect(() => {
    getAllTimelineEntries().then((e) => { setEvents(e); setIsLoading(false); });
  }, []);

  const positioned = useMemo(() => assignLanes(events), [events]);

  const filtered = useMemo(() => {
    if (filterEra === 'all') return positioned;
    return positioned.filter((e) => e.era === filterEra);
  }, [positioned, filterEra]);

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
      <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
        <View style={{ padding: spacing.lg }}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  const SVG_HEIGHT = AXIS_Y + 40;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <EraFilterBar activeEra={filterEra} onSelect={setFilterEra} />

      <ScrollView horizontal showsHorizontalScrollIndicator style={{ flex: 1 }}>
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
            const eraColor = evt.era ? (eras[evt.era] ?? base.gold) : base.gold;
            const y = LANE_TOP + evt.lane * LANE_HEIGHT;
            const isSelected = selectedEvent?.id === evt.id;

            return (
              <G key={evt.id} onPress={() => setSelectedEvent(evt)}>
                {/* Stem line */}
                <Line x1={evt.x} y1={y} x2={evt.x} y2={AXIS_Y} stroke={eraColor} strokeWidth={0.5} opacity={0.4} />
                {/* Circle */}
                {isSelected && <Circle cx={evt.x} cy={y} r={7} fill={base.gold} opacity={0.3} />}
                <Circle cx={evt.x} cy={y} r={4} fill={eraColor} />
                {/* Label */}
                <SvgText x={evt.x + 8} y={y + 4} fontSize={8} fill={eraColor}
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
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setSelectedEvent(null)} />
          <SafeAreaView style={{
            backgroundColor: base.bgElevated, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg,
            borderTopWidth: 1, borderColor: base.border, maxHeight: '50%',
          }}>
            <ScrollView contentContainerStyle={{ padding: spacing.md }}>
              <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: base.textMuted, borderRadius: 2, marginBottom: spacing.md }} />
              {selectedEvent.era && <BadgeChip label={eraNames[selectedEvent.era] ?? selectedEvent.era} color={eras[selectedEvent.era] ?? base.gold} />}
              <Text style={{ color: base.text, fontFamily: 'Cinzel_600SemiBold', fontSize: 18, marginTop: spacing.sm }}>
                {selectedEvent.name}
              </Text>
              <Text style={{ color: base.gold, fontFamily: 'SourceSans3_500Medium', fontSize: 13, marginTop: 4 }}>
                {formatYear(selectedEvent.year)}
              </Text>
              {selectedEvent.scripture_ref && (
                <Text style={{ color: base.goldDim, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 13, marginTop: 4 }}>
                  {selectedEvent.scripture_ref}
                </Text>
              )}
              {selectedEvent.summary && (
                <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, lineHeight: 22, marginTop: spacing.md }}>
                  {selectedEvent.summary}
                </Text>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}
