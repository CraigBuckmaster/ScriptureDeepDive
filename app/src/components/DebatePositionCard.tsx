/**
 * DebatePositionCard — Expandable scholarly position card.
 *
 * Left border colored by tradition_family. Shows label, proponents, argument.
 * Expand for strengths/weaknesses analysis, key verses, scholar links.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { families } from '../theme/colors';
import type { DebatePosition } from '../types';

interface Props {
  position: DebatePosition;
  defaultExpanded?: boolean;
  onScholarPress?: (scholarId: string) => void;
  onVersePress?: (ref: string) => void;
}

function DebatePositionCard({
  position,
  defaultExpanded = false,
  onScholarPress,
  onVersePress,
}: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const color = families[position.tradition_family as keyof typeof families] || base.textDim;

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderLeftColor: color }]}>
      {/* Header */}
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${position.label}, ${expanded ? 'collapse' : 'expand'}`}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.traditionPill, { backgroundColor: color + '20' }]}>
            <Text style={[styles.traditionText, { color }]}>
              {position.tradition_family}
            </Text>
          </View>
          <Text style={[styles.label, { color: base.text }]}>{position.label}</Text>
          {position.proponents ? (
            <Text style={[styles.proponents, { color: base.textDim }]} numberOfLines={1}>
              {position.proponents}
            </Text>
          ) : null}
        </View>
        {expanded ? (
          <ChevronUp size={18} color={base.textMuted} />
        ) : (
          <ChevronDown size={18} color={base.textMuted} />
        )}
      </TouchableOpacity>

      {/* Argument (always visible) */}
      <Text
        style={[styles.argument, { color: base.text }]}
        numberOfLines={expanded ? undefined : 4}
      >
        {position.argument}
      </Text>

      {/* Expanded analysis */}
      {expanded && (
        <View style={styles.analysis}>
          {/* Strengths */}
          {position.strengths ? (
            <View style={[styles.analysisCard, { backgroundColor: '#4CAF5010' }]}>
              <Text style={[styles.analysisLabel, { color: '#4CAF50' }]}>Strengths</Text>
              <Text style={[styles.analysisText, { color: base.text }]}>
                {position.strengths}
              </Text>
            </View>
          ) : null}

          {/* Weaknesses */}
          {position.weaknesses ? (
            <View style={[styles.analysisCard, { backgroundColor: '#F4433610' }]}>
              <Text style={[styles.analysisLabel, { color: '#F44336' }]}>Weaknesses</Text>
              <Text style={[styles.analysisText, { color: base.text }]}>
                {position.weaknesses}
              </Text>
            </View>
          ) : null}

          {/* Key verses */}
          {position.key_verses && position.key_verses.length > 0 && (
            <View style={styles.versesRow}>
              <Text style={[styles.versesLabel, { color: base.textMuted }]}>Key Verses</Text>
              <View style={styles.verseChips}>
                {position.key_verses.map((ref, i) => (
                  <TouchableOpacity
                    key={`${ref}-${i}`}
                    onPress={() => onVersePress?.(ref)}
                    style={[styles.verseChip, { backgroundColor: base.gold + '15', borderColor: base.gold + '30' }]}
                  >
                    <Text style={[styles.verseText, { color: base.gold }]}>{ref}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Scholar links */}
          {position.scholar_ids && position.scholar_ids.length > 0 && onScholarPress && (
            <View style={styles.scholarRow}>
              {position.scholar_ids.map((sid) => (
                <TouchableOpacity
                  key={sid}
                  onPress={() => onScholarPress(sid)}
                  style={[styles.scholarPill, { borderColor: base.gold + '40' }]}
                >
                  <Text style={[styles.scholarText, { color: base.gold }]}>{sid}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const MemoizedDebatePositionCard = React.memo(DebatePositionCard);
export { MemoizedDebatePositionCard as DebatePositionCard };
export default MemoizedDebatePositionCard;

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  traditionPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginBottom: 4,
  },
  traditionText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 15,
    marginBottom: 2,
  },
  proponents: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  argument: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
  },
  analysis: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  analysisCard: {
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  analysisLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  analysisText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 19,
  },
  versesRow: {
    marginTop: spacing.xs,
  },
  versesLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  verseChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  verseChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  verseText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  scholarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  scholarPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  scholarText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
  },
});
