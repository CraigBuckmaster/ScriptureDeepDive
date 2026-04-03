/**
 * ChapterCoachingCard — End-of-chapter study coaching section.
 *
 * Shows study questions, observations, reflections, and cross-references
 * from the extended coaching data model. Collapsible, dismissible.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookOpen, HelpCircle, Eye, Heart, ArrowRight } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import type { ChapterCoaching } from '../types';

interface Props {
  coaching: ChapterCoaching;
  onRefPress?: (ref: string) => void;
}

function ChapterCoachingCard({ coaching, onRefPress }: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const hasQuestions = coaching.questions.length > 0;
  const hasObservations = coaching.observations.length > 0;
  const hasReflections = coaching.reflections.length > 0;
  const hasCrossRefs = (coaching.cross_refs?.length ?? 0) > 0;

  if (!hasQuestions && !hasObservations && !hasReflections) return null;

  return (
    <View style={[styles.container, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <BookOpen size={14} color={base.gold} />
          <Text style={[styles.title, { color: base.gold }]}>Study Guide</Text>
        </View>
        <Text style={[styles.toggle, { color: base.textMuted }]}>
          {expanded ? '▾' : '▸'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {hasObservations && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Eye size={11} color={base.textMuted} />
                <Text style={[styles.sectionLabel, { color: base.textMuted }]}>KEY OBSERVATIONS</Text>
              </View>
              {coaching.observations.map((obs, i) => (
                <Text key={i} style={[styles.item, { color: base.textDim }]}>• {obs}</Text>
              ))}
            </View>
          )}

          {hasQuestions && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <HelpCircle size={11} color={base.textMuted} />
                <Text style={[styles.sectionLabel, { color: base.textMuted }]}>STUDY QUESTIONS</Text>
              </View>
              {coaching.questions.map((q, i) => (
                <Text key={i} style={[styles.item, { color: base.textDim }]}>{i + 1}. {q}</Text>
              ))}
            </View>
          )}

          {hasReflections && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Heart size={11} color={base.textMuted} />
                <Text style={[styles.sectionLabel, { color: base.textMuted }]}>REFLECTIONS</Text>
              </View>
              {coaching.reflections.map((r, i) => (
                <Text key={i} style={[styles.item, { color: base.textDim }]}>• {r}</Text>
              ))}
            </View>
          )}

          {hasCrossRefs && onRefPress && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: base.textMuted }]}>EXPLORE FURTHER</Text>
              <View style={styles.refsRow}>
                {coaching.cross_refs!.map((ref, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.refChip, { backgroundColor: base.gold + '15', borderColor: base.gold + '30' }]}
                    onPress={() => onRefPress(ref)}
                  >
                    <Text style={[styles.refText, { color: base.gold }]}>{ref}</Text>
                    <ArrowRight size={10} color={base.gold} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const MemoizedChapterCoachingCard = React.memo(ChapterCoachingCard);
export { MemoizedChapterCoachingCard as ChapterCoachingCard };
export default MemoizedChapterCoachingCard;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  toggle: {
    fontSize: 14,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  section: {
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  item: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 4,
  },
  refsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  refChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  refText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
});
