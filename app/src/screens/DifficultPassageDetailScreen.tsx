/**
 * DifficultPassageDetailScreen — Full view of a difficult passage.
 *
 * Sections:
 * - Header: title, passage reference, category/severity badges
 * - Question section (prominent)
 * - Responses section: scholar cards with tradition and summary
 * - Related chapters: horizontal scroll of chapter pills
 * - Tags at bottom
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
import { ChevronLeft, BookOpen, User, HelpCircle } from 'lucide-react-native';
import { useDifficultPassage, DifficultPassageCategory } from '../hooks/useDifficultPassages';
import { base, spacing, radii, fontFamily } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExploreStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ExploreStackParamList, 'DifficultPassageDetail'>;
type Route = RouteProp<ExploreStackParamList, 'DifficultPassageDetail'>;

const CATEGORY_COLORS: Record<DifficultPassageCategory, string> = {
  ethical: '#E57373',
  contradiction: '#FFB74D',
  theological: '#64B5F6',
  historical: '#81C784',
  textual: '#BA68C8',
};

const SEVERITY_INFO: Record<string, { color: string; label: string }> = {
  minor: { color: '#4CAF50', label: 'Minor' },
  moderate: { color: '#FFC107', label: 'Moderate' },
  major: { color: '#F44336', label: 'Major' },
};

export default function DifficultPassageDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { passageId } = route.params;

  const { passage, scholars, relatedChapters, loading, error } = useDifficultPassage(passageId);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !passage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={base.gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Difficult Passage</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Passage not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const severityInfo = SEVERITY_INFO[passage.severity];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={24} color={base.gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {passage.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title & Meta Card */}
        <View style={styles.metaCard}>
          <Text style={styles.passageRef}>{passage.passage}</Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: CATEGORY_COLORS[passage.category] + '30' },
              ]}
            >
              <Text style={[styles.categoryText, { color: CATEGORY_COLORS[passage.category] }]}>
                {passage.category}
              </Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: severityInfo.color + '20' }]}>
              <View style={[styles.severityDot, { backgroundColor: severityInfo.color }]} />
              <Text style={[styles.severityText, { color: severityInfo.color }]}>
                {severityInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Question Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={16} color={base.gold} />
            <Text style={styles.sectionTitle}>The Question</Text>
          </View>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{passage.question}</Text>
          </View>
        </View>

        {/* Responses Section */}
        {passage.responses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={16} color={base.gold} />
              <Text style={styles.sectionTitle}>Scholarly Responses</Text>
            </View>
            {passage.responses.map((response, index) => {
              const scholar = scholars.get(response.scholar_id);
              return (
                <View key={`${response.scholar_id}-${index}`} style={styles.responseCard}>
                  <Text style={styles.traditionText}>{response.tradition}</Text>
                  {scholar && (
                    <TouchableOpacity
                      style={styles.scholarRow}
                      onPress={() =>
                        navigation.navigate('ScholarBio', { scholarId: scholar.id })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.scholarAvatar}>
                        <User size={14} color={base.gold} />
                      </View>
                      <View style={styles.scholarInfo}>
                        <Text style={styles.scholarName}>{scholar.name}</Text>
                        <Text style={styles.scholarMeta}>
                          {scholar.tradition}
                        </Text>
                      </View>
                      <ChevronLeft
                        size={14}
                        color={base.textMuted}
                        style={{ transform: [{ rotate: '180deg' }] }}
                      />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.summaryText}>{response.summary}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Related Chapters */}
        {relatedChapters.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={16} color={base.gold} />
              <Text style={styles.sectionTitle}>Related Chapters</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chapterScroll}
            >
              {relatedChapters.map((ch, idx) => (
                <TouchableOpacity
                  key={`${ch.book_dir}-${ch.chapter_num}-${idx}`}
                  style={styles.chapterPill}
                  onPress={() =>
                    navigation.navigate('Chapter', {
                      bookId: ch.book_dir,
                      chapterNum: ch.chapter_num,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.chapterText}>
                    {ch.book_name} {ch.chapter_num}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tags */}
        {passage.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {passage.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
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
  headerTitle: {
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

  // Meta Card
  metaCard: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '30',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  passageRef: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  categoryText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    gap: spacing.xs,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
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

  // Question
  questionCard: {
    backgroundColor: base.bgElevated,
    borderLeftWidth: 3,
    borderLeftColor: base.gold,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  questionText: {
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // Responses
  responseCard: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '20',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  traditionText: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  scholarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: base.bg,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  scholarAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: base.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scholarInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  scholarName: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  scholarMeta: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  summaryText: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
  },

  // Related Chapters
  chapterScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  chapterPill: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '30',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.xs,
  },
  chapterText: {
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },

  // Tags
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: base.gold + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  tagText: {
    color: base.gold,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});
