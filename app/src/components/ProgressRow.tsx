/**
 * ProgressRow — Collapsible progress summary for HomeScreen.
 *
 * Collapsed (default): "247 of 1,189 chapters" + percentage + chevron + bar
 * Expanded: testament breakdown rows slide in below
 *
 * Part of Epic #1089 (#1092).
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, StyleSheet, Platform, UIManager } from 'react-native';
import { ChevronDown, Share2 } from 'lucide-react-native';
import { getTestamentProgress, type TestamentProgress } from '../db/user';
import { shareProgress } from '../utils/shareVerse';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { logger } from '../utils/logger';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TOTAL_BIBLE_CHAPTERS = 1189;

interface Props {
  chaptersRead: number;
}

export function ProgressRow({ chaptersRead }: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [testamentProgress, setTestamentProgress] = useState<TestamentProgress[]>([]);

  useEffect(() => {
    getTestamentProgress()
      .then(setTestamentProgress)
      .catch((err) => { logger.warn('ProgressRow', 'Failed to load', err); });
  }, [chaptersRead]);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  if (chaptersRead <= 0) return null;

  const pct = ((chaptersRead / TOTAL_BIBLE_CHAPTERS) * 100).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
      {/* Collapsed header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Reading progress: ${chaptersRead} of ${TOTAL_BIBLE_CHAPTERS} chapters, ${pct}%`}
      >
        <Text style={[styles.label, { color: base.text }]}>
          {chaptersRead} of {TOTAL_BIBLE_CHAPTERS} chapters
        </Text>
        <View style={styles.right}>
          <Text style={[styles.pct, { color: base.gold }]}>{pct}%</Text>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); shareProgress(pct, chaptersRead); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Share reading progress"
          >
            <Share2 size={13} color={base.gold} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
          <ChevronDown
            size={14}
            color={base.textMuted}
            style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={[styles.bar, { backgroundColor: base.border }]}>
        <View style={[styles.barFill, { width: `${Math.max(1, parseFloat(pct))}%`, backgroundColor: base.gold }]} />
      </View>

      {/* Expanded: testament breakdown */}
      {expanded && testamentProgress.length > 0 && (
        <View style={styles.breakdown}>
          {testamentProgress.map((tp) => {
            if (tp.chaptersRead === 0) return null;
            const tpPct = tp.totalChapters > 0
              ? ((tp.chaptersRead / tp.totalChapters) * 100).toFixed(0)
              : '0';
            return (
              <View key={tp.testament} style={styles.testamentRow}>
                <View style={styles.testamentHeader}>
                  <Text style={[styles.testamentLabel, { color: base.textDim }]}>{tp.testament}</Text>
                  <Text style={[styles.testamentPct, { color: base.textMuted }]}>
                    {tp.chaptersRead}/{tp.totalChapters} ({tpPct}%)
                  </Text>
                </View>
                <View style={[styles.bar, { backgroundColor: base.border }]}>
                  <View style={[styles.barFill, { width: `${Math.max(1, parseFloat(tpPct))}%`, backgroundColor: base.gold + '80' }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm + 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pct: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  bar: {
    height: 3,
    borderRadius: 1.5,
    marginTop: spacing.xs + 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 1.5,
    minWidth: 4,
  },
  breakdown: {
    marginTop: spacing.sm,
    gap: spacing.xs + 2,
  },
  testamentRow: {},
  testamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  testamentLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  testamentPct: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
});
