/**
 * DifficultPassageDetailScreen — Full view of a difficult passage.
 *
 * Layout (top to bottom):
 * - Header: title, back button
 * - Meta card: passage reference, category/severity badges
 * - The Question: prominent, gold left border
 * - Context: frames the difficulty
 * - Key Verses: tappable NIV verses
 * - Scholarly Consensus: muted banner
 * - Scholarly Responses: expandable cards with strengths/weaknesses
 * - Related Chapters: horizontal pills
 * - Further Reading: author/title/year list
 * - Tags
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ChevronLeft, ChevronDown, ChevronUp,
  BookOpen, User, HelpCircle, Quote, Target, BookMarked,
} from 'lucide-react-native';
import {
  useDifficultPassage,
  DifficultPassageCategory,
  DifficultPassageResponse,
} from '../hooks/useDifficultPassages';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExploreStackParamList } from '../navigation/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

const FAMILY_COLORS: Record<string, string> = {
  evangelical: '#64B5F6',
  critical: '#FFB74D',
  jewish: '#81C784',
  patristic: '#BA68C8',
  reformed: '#4FC3F7',
  catholic: '#E57373',
};

/* ── Response Card with expandable analysis ── */

function ResponseCard({
  response,
  scholar,
  defaultExpanded,
  onScholarPress,
}: {
  response: DifficultPassageResponse;
  scholar: { id: string; name: string; tradition: string } | undefined;
  defaultExpanded: boolean;
  onScholarPress: (id: string) => void;
}) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  const familyColor = FAMILY_COLORS[response.tradition_family ?? ''] ?? base.textMuted;
  const hasAnalysis = response.strengths || response.weaknesses ||
    (response.key_verses && response.key_verses.length > 0);

  return (
    <View style={[styles.responseCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}>
      {/* Tradition label + family badge */}
      <View style={styles.traditionRow}>
        <Text style={[styles.traditionText, { color: base.gold }]}>{response.tradition}</Text>
        {response.tradition_family && (
          <View style={[styles.familyBadge, { backgroundColor: familyColor + '20' }]}>
            <Text style={[styles.familyText, { color: familyColor }]}>
              {response.tradition_family}
            </Text>
          </View>
        )}
      </View>

      {/* Scholar row */}
      {scholar && (
        <TouchableOpacity
          style={[styles.scholarRow, { backgroundColor: base.bg }]}
          onPress={() => onScholarPress(scholar.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.scholarAvatar, { backgroundColor: base.gold + '20' }]}>
            <User size={14} color={base.gold} />
          </View>
          <View style={styles.scholarInfo}>
            <Text style={[styles.scholarName, { color: base.text }]}>{scholar.name}</Text>
            <Text style={[styles.scholarMeta, { color: base.textMuted }]}>{scholar.tradition}</Text>
          </View>
          <ChevronLeft
            size={14}
            color={base.textMuted}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>
      )}

      {/* Summary */}
      <Text style={[styles.summaryText, { color: base.textDim }]}>{response.summary}</Text>

      {/* Expand/Collapse toggle */}
      {hasAnalysis && (
        <TouchableOpacity
          onPress={toggleExpanded}
          style={styles.expandToggle}
          activeOpacity={0.7}
        >
          {expanded ? (
            <ChevronUp size={14} color={base.gold} />
          ) : (
            <ChevronDown size={14} color={base.gold} />
          )}
          <Text style={[styles.expandText, { color: base.gold }]}>
            {expanded ? 'Hide analysis' : 'See analysis'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Expanded analysis */}
      {expanded && hasAnalysis && (
        <View style={[styles.analysisSection, { borderTopColor: base.border }]}>
          {response.key_verses && response.key_verses.length > 0 && (
            <View style={styles.analysisBlock}>
              <Text style={[styles.analysisLabel, { color: base.textMuted }]}>Key Verses</Text>
              <View style={styles.verseChipRow}>
                {response.key_verses.map((v, i) => (
                  <View key={i} style={[styles.verseChip, { backgroundColor: base.gold + '15' }]}>
                    <Text style={[styles.verseChipText, { color: base.gold }]}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {response.strengths && (
            <View style={styles.analysisBlock}>
              <Text style={[styles.analysisLabel, { color: '#81C784' }]}>Strengths</Text>
              <Text style={[styles.analysisBody, { color: base.textDim }]}>{response.strengths}</Text>
            </View>
          )}

          {response.weaknesses && (
            <View style={styles.analysisBlock}>
              <Text style={[styles.analysisLabel, { color: '#E57373' }]}>Weaknesses</Text>
              <Text style={[styles.analysisBody, { color: base.textDim }]}>{response.weaknesses}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/* ── Main Screen ── */

export default function DifficultPassageDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { passageId } = route.params;

  const { passage, scholars, relatedChapters, loading, error } = useDifficultPassage(passageId);

  const handleScholarPress = useCallback(
    (scholarId: string) => {
      navigation.navigate('ScholarBio', { scholarId });
    },
    [navigation]
  );

  const handleChapterPress = useCallback(
    (bookDir: string, chapterNum: number) => {
      navigation.navigate('Chapter', { bookId: bookDir, chapterNum });
    },
    [navigation]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !passage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={base.gold} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: base.gold }]}>Difficult Passage</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: base.textMuted }]}>{error || 'Passage not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const severityInfo = SEVERITY_INFO[passage.severity];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={24} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: base.gold }]} numberOfLines={1}>
          {passage.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Meta Card */}
        <View style={[styles.metaCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}>
          <Text style={[styles.passageRef, { color: base.gold }]}>{passage.passage}</Text>
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

        {/* The Question — first, prominent */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={16} color={base.gold} />
            <Text style={[styles.sectionTitle, { color: base.gold }]}>The Question</Text>
          </View>
          <View style={[styles.questionCard, { backgroundColor: base.bgElevated, borderLeftColor: base.gold }]}>
            <Text style={[styles.questionText, { color: base.text }]}>{passage.question}</Text>
          </View>
        </View>

        {/* Context */}
        {passage.context ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Context</Text>
            </View>
            <View style={[styles.contextBlock, { borderLeftColor: base.border }]}>
              <Text style={[styles.contextText, { color: base.textDim }]}>{passage.context}</Text>
            </View>
          </View>
        ) : null}

        {/* Key Verses */}
        {passage.key_verses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Quote size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Key Verses</Text>
            </View>
            {passage.key_verses.map((v, i) => (
              <View key={i} style={[styles.keyVerseCard, { backgroundColor: base.bgElevated }]}>
                <Text style={[styles.keyVerseRef, { color: base.gold }]}>{v.ref}</Text>
                <Text style={[styles.keyVerseText, { color: base.textDim }]}>{v.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Scholarly Consensus */}
        {passage.consensus ? (
          <View style={[styles.consensusBanner, { backgroundColor: base.bgElevated, borderLeftColor: base.textMuted }]}>
            <View style={styles.consensusHeader}>
              <Target size={12} color={base.textMuted} />
              <Text style={[styles.consensusLabel, { color: base.textMuted }]}>Scholarly Consensus</Text>
            </View>
            <Text style={[styles.consensusText, { color: base.textMuted }]}>{passage.consensus}</Text>
          </View>
        ) : null}

        {/* Scholarly Responses */}
        {passage.responses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Scholarly Responses</Text>
              <Text style={[styles.responseCount, { color: base.textMuted }]}>({passage.responses.length})</Text>
            </View>
            {passage.responses.map((response, index) => (
              <ResponseCard
                key={`${response.scholar_id}-${index}`}
                response={response}
                scholar={scholars.get(response.scholar_id)}
                defaultExpanded={index === 0}
                onScholarPress={handleScholarPress}
              />
            ))}
          </View>
        )}

        {/* Related Chapters */}
        {relatedChapters.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Related Chapters</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chapterScroll}
            >
              {relatedChapters.map((ch, idx) => (
                <TouchableOpacity
                  key={`${ch.book_dir}-${ch.chapter_num}-${idx}`}
                  style={[styles.chapterPill, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}
                  onPress={() => handleChapterPress(ch.book_dir, ch.chapter_num)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chapterText, { color: base.text }]}>
                    {ch.book_name} {ch.chapter_num}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Further Reading */}
        {passage.further_reading.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookMarked size={16} color={base.gold} />
              <Text style={[styles.sectionTitle, { color: base.gold }]}>Further Reading</Text>
            </View>
            {passage.further_reading.map((r, i) => (
              <View key={i} style={[styles.readingItem, { borderLeftColor: base.border }]}>
                <Text style={[styles.readingTitle, { color: base.text }]}>{r.title}</Text>
                <Text style={[styles.readingMeta, { color: base.textMuted }]}>{r.author} ({r.year})</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        {passage.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {passage.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: base.gold + '15' }]}>
                <Text style={[styles.tagText, { color: base.gold }]}>{tag}</Text>
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

  // Meta Card
  metaCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  passageRef: {
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
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  responseCount: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginLeft: spacing.xs,
  },

  // Question
  questionCard: {
    borderLeftWidth: 3,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  questionText: {
    fontFamily: fontFamily.ui,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // Context
  contextBlock: {
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
  },
  contextText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 21,
  },

  // Key Verses
  keyVerseCard: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  keyVerseRef: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  keyVerseText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Consensus
  consensusBanner: {
    borderLeftWidth: 3,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  consensusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  consensusLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  consensusText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 18,
  },

  // Responses
  responseCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  traditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  traditionText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    flex: 1,
  },
  familyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  familyText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  scholarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  scholarAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scholarInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  scholarName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  scholarMeta: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  summaryText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 21,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  expandText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },

  // Analysis (expanded)
  analysisSection: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  analysisBlock: {
    marginBottom: spacing.sm,
  },
  analysisLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  analysisBody: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 18,
  },
  verseChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  verseChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  verseChipText: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },

  // Related Chapters
  chapterScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  chapterPill: {
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.xs,
  },
  chapterText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },

  // Further Reading
  readingItem: {
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    marginBottom: spacing.sm,
  },
  readingTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  readingMeta: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },

  // Tags
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  tagText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});
