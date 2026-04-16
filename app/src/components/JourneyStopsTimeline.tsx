/**
 * JourneyStopsTimeline — Vertical timeline rendering journey stops,
 * bridges, and linked journey indicators.
 *
 * Evolved from ConceptJourney.tsx to support the unified journey model.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Link2 } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { JourneyStop } from '../types';

interface Props {
  stops: JourneyStop[];
  isPremium: boolean;
  freeStopCount?: number;
  linkedJourneyTitles?: Map<string, string>;
  onNavigateToChapter: (bookId: string, chapterNum: number, verseNum?: number) => void;
  onLinkedJourneyPress?: (linkedJourneyId: string, intro: string | null) => void;
}

export function JourneyStopsTimeline({
  stops, isPremium, freeStopCount = 3,
  linkedJourneyTitles,
  onNavigateToChapter, onLinkedJourneyPress,
}: Props) {
  const { base } = useTheme();

  if (!stops || stops.length === 0) return null;

  const visibleStops = isPremium ? stops : stops.slice(0, freeStopCount);

  return (
    <View style={styles.container}>
      {visibleStops.map((stop, idx) => {
        const isLast = idx === visibleStops.length - 1;

        if (stop.stop_type === 'linked_journey' && stop.linked_journey_id) {
          const linkedTitle = linkedJourneyTitles?.get(stop.linked_journey_id) ?? 'Linked Journey';
          return (
            <View key={`linked-${stop.stop_order}`} style={styles.row}>
              <View style={styles.spine}>
                <View style={[styles.dot, { backgroundColor: base.gold, borderColor: base.gold + '40' }]} />
                {!isLast && <View style={[styles.line, { backgroundColor: base.goldDim + '60' }]} />}
              </View>
              <TouchableOpacity
                style={[styles.linkedCard, { backgroundColor: base.gold + '10', borderColor: base.gold + '30' }]}
                activeOpacity={0.7}
                onPress={() => onLinkedJourneyPress?.(stop.linked_journey_id!, stop.linked_journey_intro)}
              >
                <View style={styles.linkedHeader}>
                  <Link2 size={14} color={base.gold} />
                  <Text style={[styles.linkedTitle, { color: base.gold }]}>{linkedTitle}</Text>
                </View>
                {stop.linked_journey_intro && (
                  <Text style={[styles.linkedIntro, { color: base.textDim }]} numberOfLines={3}>
                    {stop.linked_journey_intro}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }

        const vm = stop.ref?.match(/:(\d+)/);
        const verseNum = vm ? parseInt(vm[1], 10) : undefined;

        return (
          <View key={`stop-${stop.stop_order}`}>
            <View style={styles.row}>
              <View style={styles.spine}>
                <View style={[styles.dot, { backgroundColor: base.gold, borderColor: base.goldDim }]} />
                {!isLast && <View style={[styles.line, { backgroundColor: base.goldDim + '60' }]} />}
              </View>
              <TouchableOpacity
                style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '18' }]}
                activeOpacity={0.7}
                onPress={() => stop.book_id && stop.chapter_num && onNavigateToChapter(stop.book_id, stop.chapter_num, verseNum)}
              >
                <View style={styles.cardHeader}>
                  {stop.ref && (
                    <View style={[styles.refBadge, { backgroundColor: base.gold + '20' }]}>
                      <Text style={[styles.refText, { color: base.gold }]}>{stop.ref}</Text>
                    </View>
                  )}
                  <ChevronRight size={14} color={base.textMuted} />
                </View>
                {stop.label && (
                  <Text style={[styles.label, { color: base.text }]}>{stop.label}</Text>
                )}
                {stop.development && (
                  <Text style={[styles.development, { color: base.textDim }]}>{stop.development}</Text>
                )}
                {stop.what_changes && (
                  <View style={[styles.changesBox, { backgroundColor: base.gold + '0A', borderLeftColor: base.gold + '40' }]}>
                    <Text style={[styles.changesTitle, { color: base.gold }]}>What Changes</Text>
                    <Text style={[styles.changesText, { color: base.textDim }]}>{stop.what_changes}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Bridge to next stop */}
            {stop.bridge_to_next && !isLast && (
              <View style={styles.bridgeRow}>
                <View style={styles.bridgeSpine}>
                  <View style={[styles.bridgeLine, { backgroundColor: base.goldDim + '40' }]} />
                </View>
                <Text style={[styles.bridgeText, { color: base.textMuted }]}>
                  {stop.bridge_to_next}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const DOT_SIZE = 12;
const LINE_WIDTH = 2;
const SPINE_WIDTH = DOT_SIZE + spacing.md;

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  spine: {
    width: SPINE_WIDTH,
    alignItems: 'center',
    paddingTop: 2,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
  },
  line: {
    flex: 1,
    width: LINE_WIDTH,
    marginTop: 2,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  refBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  refText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  label: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  development: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  changesBox: {
    borderLeftWidth: 2,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  changesTitle: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  changesText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 18,
  },
  linkedCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    borderStyle: 'dashed',
  },
  linkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  linkedTitle: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  linkedIntro: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  bridgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bridgeSpine: {
    width: SPINE_WIDTH,
    alignItems: 'center',
  },
  bridgeLine: {
    flex: 1,
    width: LINE_WIDTH,
  },
  bridgeText: {
    flex: 1,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    lineHeight: 19,
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
