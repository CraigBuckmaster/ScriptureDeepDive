/**
 * ChapterFingerprint — Compact collapsible bar chart showing 6 study-depth
 * dimensions for the current chapter ("Chapter DNA").
 *
 * Collapsed by default; tap to expand. Uses react-native-svg for the bars.
 */

import React, { memo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { FingerprintScores } from '../hooks/useChapterFingerprint';
import { FINGERPRINT_LABELS } from '../hooks/useChapterFingerprint';

interface Props {
  scores: FingerprintScores;
}

/** Bar colors for each dimension (ordered to match FINGERPRINT_LABELS). */
const BAR_COLORS = [
  '#b8922e', // Scholars  — gold
  '#7a9e5a', // Context   — sage green
  '#5a8fb8', // Language  — blue
  '#b87a5a', // Connections — terracotta
  '#8a5ab8', // Structure — purple
  '#5ab8a0', // Links     — teal
];

const BAR_HEIGHT = 6;
const BAR_GAP = 10;
const CHART_HEIGHT = FINGERPRINT_LABELS.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP;
const LABEL_WIDTH = 80;
const BAR_MAX_WIDTH = 120;

export const ChapterFingerprint = memo(function ChapterFingerprint({ scores }: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }, []);

  const ChevronIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <View style={[styles.wrapper, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
      <TouchableOpacity
        onPress={toggle}
        style={styles.header}
        accessibilityLabel={expanded ? 'Collapse chapter DNA' : 'Expand chapter DNA'}
        accessibilityRole="button"
      >
        <Text style={[styles.headerText, { color: base.textMuted }]}>Chapter DNA</Text>
        <ChevronIcon size={14} color={base.textMuted} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.chartArea}>
          <Svg width={LABEL_WIDTH + BAR_MAX_WIDTH + 8} height={CHART_HEIGHT}>
            {FINGERPRINT_LABELS.map(({ key, label }, i) => {
              const value = scores[key];
              const y = i * (BAR_HEIGHT + BAR_GAP);
              const barWidth = Math.max(2, value * BAR_MAX_WIDTH);
              return (
                <React.Fragment key={key}>
                  <Rect
                    x={LABEL_WIDTH}
                    y={y}
                    width={barWidth}
                    height={BAR_HEIGHT}
                    rx={BAR_HEIGHT / 2}
                    fill={BAR_COLORS[i]}
                    opacity={value > 0 ? 0.85 : 0.15}
                  />
                </React.Fragment>
              );
            })}
          </Svg>
          {/* Labels rendered as RN Text for crisp rendering */}
          <View style={styles.labelCol}>
            {FINGERPRINT_LABELS.map(({ key, label }, i) => (
              <Text
                key={key}
                style={[styles.label, { color: base.textMuted }]}
              >
                {label}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chartArea: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    position: 'relative',
  },
  labelCol: {
    position: 'absolute',
    top: 0,
    left: spacing.sm,
    width: LABEL_WIDTH,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    height: BAR_HEIGHT + BAR_GAP,
    lineHeight: BAR_HEIGHT + BAR_GAP,
  },
});
