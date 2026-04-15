/**
 * ConceptDetailScreen — Aggregated view of a theological concept.
 *
 * Sections: Overview, Word Studies, Key Chapters, Threads, Prophecy Chains, People.
 * Each section only renders if it has data.
 * Journey tab: progressive revelation timeline (Phase 9) when journey_stops exist.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, BookOpen, Users, Scroll, Link2, MapPin, ChevronRight } from 'lucide-react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useConceptData } from '../hooks/useConceptData';
import { useContentImages } from '../hooks/useContentImages';
import { ContentImageGallery } from '../components/ContentImageGallery';
import { usePremium } from '../hooks/usePremium';
import ConceptJourney from '../components/ConceptJourney';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ExploreStackParamList } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { DetailTabBar } from '../components/DetailTabBar';

type Nav = StackNavigationProp<ExploreStackParamList, 'ConceptDetail'>;
type Route = RouteProp<ExploreStackParamList, 'ConceptDetail'>;

function ConceptDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { conceptId, initialTab: paramInitialTab } = route.params;

  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const {
    concept,
    wordStudies,
    prophecyChains,
    threads,
    people,
    topChapters,
    loading,
    error,
  } = useConceptData(conceptId);
  const { images: contentImages } = useContentImages('concept', conceptId);

  const handleThreadPress = (threadId: string) => {
    if (!isPremium) {
      showUpgrade('feature', 'Cross-Reference Threading');
      return;
    }
    navigation.navigate('ThreadDetail', { threadId });
  };

  const hasJourney = (concept?.journey_stops?.length ?? 0) > 0;
  const [activeTab, setActiveTab] = useState<'overview' | 'journey'>(
    paramInitialTab === 'journey' ? 'journey' : 'overview',
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

  if (error || !concept) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
            <ChevronLeft size={24} color={base.gold} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: base.gold }]}>Concept</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: base.textMuted }]}>{error || 'Concept not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={24} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: base.gold }]} numberOfLines={1} accessibilityRole="header">{concept.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab bar — only shown when journey data exists */}
      {hasJourney && (
        <DetailTabBar
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'journey', label: 'Journey' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      )}

      {/* Journey tab */}
      {activeTab === 'journey' && hasJourney ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ConceptJourney
            stops={concept.journey_stops}
            onNavigate={(book, chapter) =>
              navigation.navigate('Chapter', { bookId: book, chapterNum: chapter })
            }
          />
          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {contentImages.length > 0 && <ContentImageGallery images={contentImages} />}

        {/* Overview */}
        <View style={[styles.overviewCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}>
          <Text style={[styles.overviewText, { color: base.text }]}>{concept.description}</Text>
        </View>

        {/* Word Studies */}
        {wordStudies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Word Studies</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {wordStudies.map((ws) => (
                <TouchableOpacity
                  key={ws.id}
                  style={[styles.wordCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('WordStudyDetail', { wordId: ws.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`Word study: ${ws.transliteration}`}
                >
                  <Text style={[styles.wordOriginal, { color: base.gold }]}>{ws.original}</Text>
                  <Text style={[styles.wordTranslit, { color: base.text }]}>{ws.transliteration}</Text>
                  <Text style={[styles.wordGloss, { color: base.textMuted }]} numberOfLines={1}>
                    {Array.isArray(ws.glosses) ? ws.glosses.join(', ') : ws.glosses}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Key Chapters */}
        {topChapters.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Scroll size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Key Chapters</Text>
            </View>
            {topChapters.map((ch) => (
              <TouchableOpacity
                key={ch.chapter_id}
                style={[styles.chapterRow, { backgroundColor: base.bgElevated }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Chapter', { bookId: ch.book_dir, chapterNum: ch.chapter_num })}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${ch.book_name} ${ch.chapter_num}`}
              >
                <Text style={[styles.chapterText, { color: base.text }]}>
                  {ch.book_name} {ch.chapter_num}
                </Text>
                <View style={[styles.scoreBadge, { backgroundColor: base.gold + '20' }]}>
                  <Text style={[styles.scoreText, { color: base.gold }]}>{ch.score}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Prophecy Chains */}
        {prophecyChains.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Link2 size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Prophecy Chains</Text>
            </View>
            {prophecyChains.map((pc) => (
              <TouchableOpacity
                key={pc.id}
                style={[styles.chainCard, { backgroundColor: base.bgElevated }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ProphecyDetail', { chainId: pc.id })}
                accessibilityRole="button"
                accessibilityLabel={`View prophecy chain: ${pc.title}`}
              >
                <Text style={[styles.chainTitle, { color: base.text }]}>{pc.title}</Text>
                <Text style={[styles.chainSummary, { color: base.textMuted }]} numberOfLines={2}>{pc.summary}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Cross-Ref Threads */}
        {threads.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Cross-Reference Threads</Text>
            </View>
            {threads.map((t) => {
              const tags = JSON.parse(t.tags_json || '[]');
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.threadCard, { backgroundColor: base.bgElevated }]}
                  activeOpacity={0.7}
                  onPress={() => handleThreadPress(t.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`View thread: ${t.theme}`}
                >
                  <View style={styles.threadCardHeader}>
                    <Text style={[styles.threadTheme, { color: base.text }]}>{t.theme}</Text>
                    <ChevronRight size={14} color={base.gold} />
                  </View>
                  {tags.length > 0 && (
                    <View style={styles.threadTags}>
                      {tags.slice(0, 4).map((tag: string) => (
                        <View key={tag} style={[styles.threadTag, { backgroundColor: base.gold + '15' }]}>
                          <Text style={[styles.threadTagText, { color: base.gold }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* People */}
        {people.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Key Figures</Text>
            </View>
            <View style={styles.peopleGrid}>
              {people.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personCard, { backgroundColor: base.bgElevated }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('PersonDetail', { personId: p.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`View person: ${p.name}`}
                >
                  <Text style={[styles.personName, { color: base.text }]}>{p.name}</Text>
                  {p.role && <Text style={[styles.personRole, { color: base.textMuted }]} numberOfLines={1}>{p.role}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {concept.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {concept.tags.map((tag) => (
              <View key={tag} style={[styles.conceptTag, { backgroundColor: base.gold + '15' }]}>
                <Text style={[styles.conceptTagText, { color: base.gold }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      )}

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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  headerSpacer: {
    width: 24,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },

  // Overview
  overviewCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  overviewText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    lineHeight: 22,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },

  // Word Studies
  hScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  wordCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    width: 120,
  },
  wordOriginal: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
    marginBottom: 2,
  },
  wordTranslit: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    fontStyle: 'italic',
  },
  wordGloss: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: spacing.xs,
  },

  // Key Chapters
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  chapterText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  scoreBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  scoreText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
  },

  // Prophecy Chains
  chainCard: {
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  chainTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: 2,
  },
  chainSummary: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },

  // Threads
  threadCard: {
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  threadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadTheme: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  threadTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  threadTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  threadTagText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },

  // People
  peopleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  personCard: {
    borderRadius: radii.md,
    padding: spacing.sm,
    minWidth: '48%',
    flex: 1,
  },
  personName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  personRole: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 2,
  },

  // Tags
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  conceptTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  conceptTagText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});

export default withErrorBoundary(ConceptDetailScreen);
