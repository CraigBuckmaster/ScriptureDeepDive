/**
 * DebateDetailScreen — "The Round Table" immersive debate view.
 *
 * Shows question card, context, tradition filter, position cards,
 * synthesis, and related passages. Premium feature.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { useDebateTopic } from '../hooks/useDebateTopics';
import { usePremium } from '../hooks/usePremium';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { DebatePositionCard } from '../components/DebatePositionCard';
import { DebateTraditionFilter } from '../components/DebateTraditionFilter';
import { parseVerseRef } from '../utils/verseRef';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = ScreenNavProp<'Explore', 'DebateDetail'>;
type Route = ScreenRouteProp<'Explore', 'DebateDetail'>;

function DebateDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { topicId } = route.params;
  const { topic, loading } = useDebateTopic(topicId);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const [traditionFilter, setTraditionFilter] = useState('all');

  const traditions = useMemo(() => {
    if (!topic) return [];
    const set = new Set<string>();
    for (const p of topic.positions) {
      if (p.tradition_family) set.add(p.tradition_family);
    }
    return Array.from(set).sort();
  }, [topic]);

  const filteredPositions = useMemo(() => {
    if (!topic) return [];
    if (traditionFilter === 'all') return topic.positions;
    return topic.positions.filter((p) => p.tradition_family === traditionFilter);
  }, [topic, traditionFilter]);

  const handleTraditionChange = useCallback((t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTraditionFilter(t);
  }, []);

  const handleScholarPress = useCallback(
    (scholarId: string) => {
      (navigation as any).navigate('ScholarBio', { scholarId });
    },
    [navigation]
  );

  const handleVersePress = useCallback(
    (ref: string) => {
      const parsed = parseVerseRef(ref);
      if (parsed) {
        (navigation as any).navigate('Chapter', { bookId: parsed.bookId, chapterNum: parsed.ch });
      }
    },
    [navigation]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (!topic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={22} color={base.gold} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: base.gold }]}>Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: base.gold }]} numberOfLines={1}>
          {topic.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Question card */}
        <View style={[styles.questionCard, { backgroundColor: base.bgElevated, borderLeftColor: base.gold }]}>
          <Text style={[styles.questionLabel, { color: base.textMuted }]}>THE QUESTION</Text>
          <Text style={[styles.questionText, { color: base.text }]}>{topic.question}</Text>
          {topic.passage ? (
            <Text style={[styles.passageText, { color: base.gold }]}>{topic.passage}</Text>
          ) : null}
        </View>

        {/* Context */}
        {topic.context ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: base.textMuted }]}>CONTEXT</Text>
            <Text style={[styles.bodyText, { color: base.text }]}>{topic.context}</Text>
          </View>
        ) : null}

        {/* Tradition filter */}
        {traditions.length > 1 && (
          <DebateTraditionFilter
            traditions={traditions}
            activeFilter={traditionFilter}
            onSelect={handleTraditionChange}
          />
        )}

        {/* Position cards — free users see only first position */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>
            POSITIONS ({filteredPositions.length})
          </Text>
          {filteredPositions.map((pos, i) => {
            if (!isPremium && i > 0) return null;
            return (
              <DebatePositionCard
                key={pos.id || `pos-${i}`}
                position={pos}
                defaultExpanded={i === 0}
                onScholarPress={handleScholarPress}
                onVersePress={handleVersePress}
              />
            );
          })}
          {!isPremium && filteredPositions.length > 1 && (
            <TouchableOpacity
              onPress={() => showUpgrade('feature', 'Scholar Debate Mode')}
              activeOpacity={0.7}
              style={[styles.unlockCard, { backgroundColor: base.gold + '10', borderColor: base.gold + '30' }]}
            >
              <Text style={[styles.unlockText, { color: base.gold }]}>
                Unlock to see all {filteredPositions.length} positions
              </Text>
              <Text style={[styles.unlockHint, { color: base.textDim }]}>
                Companion+ includes full debate analysis
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Synthesis */}
        {topic.synthesis ? (
          <View style={[styles.synthesisCard, { borderColor: base.gold + '40', backgroundColor: base.gold + '08' }]}>
            <Text style={[styles.synthesisLabel, { color: base.gold }]}>SYNTHESIS</Text>
            <Text style={[styles.bodyText, { color: base.text }]}>{topic.synthesis}</Text>
          </View>
        ) : null}

        {/* Related chapters */}
        {topic.chapters.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: base.textMuted }]}>CHAPTERS</Text>
            <View style={styles.chipWrap}>
              {topic.chapters.map((ch) => (
                <View
                  key={ch}
                  style={[styles.chapterChip, { backgroundColor: base.bgElevated, borderColor: base.border }]}
                >
                  <Text style={[styles.chipLabel, { color: base.textDim }]}>
                    {topic.book_id} {ch}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {topic.tags.length > 0 && (
          <View style={styles.tagRow}>
            {topic.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: base.bgElevated }]}>
                <Text style={[styles.tagText, { color: base.textMuted }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {upgradeRequest && (
        <UpgradePrompt
          visible
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
          onClose={dismissUpgrade}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  headerTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  questionCard: {
    borderLeftWidth: 4,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  questionLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  questionText: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  passageText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    lineHeight: 22,
  },
  synthesisCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  synthesisLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chapterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  chipLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  tagText: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  unlockCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  unlockText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  unlockHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withErrorBoundary(DebateDetailScreen);
