/**
 * ConceptJourney — Vertical timeline showing how a concept develops
 * across the canon (progressive revelation).
 *
 * Each node: reference badge + label + development text + "what changes" callout.
 * Nodes are tappable — navigate to the chapter.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

export interface JourneyStop {
  ref: string;
  book: string;
  chapter: number;
  label: string;
  development: string;
  what_changes: string;
}

interface Props {
  stops: JourneyStop[];
  onNavigate: (book: string, chapter: number) => void;
}

export default function ConceptJourney({ stops, onNavigate }: Props) {
  const { base } = useTheme();

  if (!stops || stops.length === 0) return null;

  return (
    <View style={styles.container}>
      {stops.map((stop, idx) => {
        const isLast = idx === stops.length - 1;
        return (
          <View key={`${stop.book}-${stop.chapter}-${idx}`} style={styles.row}>
            {/* Timeline spine */}
            <View style={styles.spine}>
              <View style={[styles.dot, { backgroundColor: base.gold, borderColor: base.goldDim }]} />
              {!isLast && <View style={[styles.line, { backgroundColor: base.goldDim + '60' }]} />}
            </View>

            {/* Content card */}
            <TouchableOpacity
              style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '18' }]}
              activeOpacity={0.7}
              onPress={() => onNavigate(stop.book, stop.chapter)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.refBadge, { backgroundColor: base.gold + '20' }]}>
                  <Text style={[styles.refText, { color: base.gold }]}>{stop.ref}</Text>
                </View>
                <ChevronRight size={14} color={base.textMuted} />
              </View>
              <Text style={[styles.label, { color: base.text }]}>{stop.label}</Text>
              <Text style={[styles.development, { color: base.textDim }]}>{stop.development}</Text>
              <View style={[styles.changesBox, { backgroundColor: base.gold + '0A', borderLeftColor: base.gold + '40' }]}>
                <Text style={[styles.changesTitle, { color: base.gold }]}>What Changes</Text>
                <Text style={[styles.changesText, { color: base.textDim }]}>{stop.what_changes}</Text>
              </View>
            </TouchableOpacity>
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
    marginBottom: spacing.md,
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
});
