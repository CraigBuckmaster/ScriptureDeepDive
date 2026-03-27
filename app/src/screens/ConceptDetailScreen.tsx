/**
 * ConceptDetailScreen — Aggregated view of a theological concept.
 *
 * Sections: Overview, Word Studies, Key Chapters, Threads, Prophecy Chains, People.
 * Each section only renders if it has data.
 */

import React from 'react';
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
import { ChevronLeft, BookOpen, Users, Scroll, Link2, MapPin } from 'lucide-react-native';
import { useConceptData } from '../hooks/useConceptData';
import { base, spacing, radii, fontFamily } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExploreStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ExploreStackParamList, 'ConceptDetail'>;
type Route = RouteProp<ExploreStackParamList, 'ConceptDetail'>;

export default function ConceptDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { conceptId } = route.params;

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !concept) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={base.gold} />
          </TouchableOpacity>
          <Text style={styles.title}>Concept</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Concept not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ChevronLeft size={24} color={base.gold} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{concept.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewText}>{concept.description}</Text>
        </View>

        {/* Word Studies */}
        {wordStudies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={16} color={base.gold} />
              <Text style={styles.sectionTitle}>Word Studies</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {wordStudies.map((ws) => (
                <TouchableOpacity
                  key={ws.id}
                  style={styles.wordCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('WordStudyDetail', { wordId: ws.id })}
                >
                  <Text style={styles.wordOriginal}>{ws.original}</Text>
                  <Text style={styles.wordTranslit}>{ws.transliteration}</Text>
                  <Text style={styles.wordGloss} numberOfLines={1}>
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
              <Text style={styles.sectionTitle}>Key Chapters</Text>
            </View>
            {topChapters.map((ch) => (
              <TouchableOpacity
                key={ch.chapter_id}
                style={styles.chapterRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Chapter', { bookId: ch.book_dir, chapterNum: ch.chapter_num })}
              >
                <Text style={styles.chapterText}>
                  {ch.book_name} {ch.chapter_num}
                </Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{ch.score}</Text>
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
              <Text style={styles.sectionTitle}>Prophecy Chains</Text>
            </View>
            {prophecyChains.map((pc) => (
              <TouchableOpacity
                key={pc.id}
                style={styles.chainCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ProphecyDetail', { chainId: pc.id })}
              >
                <Text style={styles.chainTitle}>{pc.title}</Text>
                <Text style={styles.chainSummary} numberOfLines={2}>{pc.summary}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Cross-Ref Threads */}
        {threads.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={16} color={base.gold} />
              <Text style={styles.sectionTitle}>Cross-Reference Threads</Text>
            </View>
            {threads.map((t) => {
              const tags = JSON.parse(t.tags_json || '[]');
              return (
                <View key={t.id} style={styles.threadCard}>
                  <Text style={styles.threadTheme}>{t.theme}</Text>
                  {tags.length > 0 && (
                    <View style={styles.threadTags}>
                      {tags.slice(0, 4).map((tag: string) => (
                        <View key={tag} style={styles.threadTag}>
                          <Text style={styles.threadTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* People */}
        {people.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={16} color={base.gold} />
              <Text style={styles.sectionTitle}>Key Figures</Text>
            </View>
            <View style={styles.peopleGrid}>
              {people.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.personCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('PersonDetail', { personId: p.id })}
                >
                  <Text style={styles.personName}>{p.name}</Text>
                  {p.role && <Text style={styles.personRole} numberOfLines={1}>{p.role}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {concept.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {concept.tags.map((tag) => (
              <View key={tag} style={styles.conceptTag}>
                <Text style={styles.conceptTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
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
    color: base.gold,
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
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },

  // Overview
  overviewCard: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '30',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  overviewText: {
    color: base.text,
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
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },

  // Word Studies
  hScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  wordCard: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '20',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    width: 120,
  },
  wordOriginal: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
    marginBottom: 2,
  },
  wordTranslit: {
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 12,
    fontStyle: 'italic',
  },
  wordGloss: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: spacing.xs,
  },

  // Key Chapters
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  chapterText: {
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  scoreBadge: {
    backgroundColor: base.gold + '20',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  scoreText: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
  },

  // Prophecy Chains
  chainCard: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  chainTitle: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: 2,
  },
  chainSummary: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },

  // Threads
  threadCard: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  threadTheme: {
    color: base.text,
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
    backgroundColor: base.gold + '15',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  threadTagText: {
    color: base.gold,
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
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    minWidth: '48%',
    flex: 1,
  },
  personName: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  personRole: {
    color: base.textMuted,
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
    backgroundColor: base.gold + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  conceptTagText: {
    color: base.gold,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});
