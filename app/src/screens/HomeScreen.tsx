/**
 * HomeScreen — Personal dashboard landing page.
 *
 * Layout (top to bottom):
 *   1. Time-aware greeting + dynamic stats subtitle
 *   2. Verse of the Day hero card
 *   3. Continue Reading card (or "Start Reading" if no history)
 *   4. Reading stats row (chapters read, streak, books explored)
 *   5. Explore quick-links (People, Timeline, Scholars)
 *   6. About footer (colophon)
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users, Clock, GraduationCap, BookOpen, ArrowRight } from 'lucide-react-native';
import { useHomeData } from '../hooks/useHomeData';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { base, spacing, radii, fontFamily } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { greeting, stats, verse, recentChapters, readingStats, isLoading } = useHomeData();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <LoadingSkeleton lines={6} />
        </View>
      </SafeAreaView>
    );
  }

  const mostRecent = recentChapters[0] ?? null;
  const uniqueBooks = new Set(recentChapters.map((r) => r.book_id)).size;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── 1. Greeting ──────────────────────────────── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{greeting}</Text>
          {stats && (
            <Text style={styles.greetingSubtitle}>
              {stats.liveBooks} books · {stats.liveChapters} chapters · {stats.scholarCount} scholars
            </Text>
          )}
        </View>

        {/* ── 2. Verse of the Day ──────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Chapter', {
            bookId: verse.bookId,
            chapterNum: verse.chapter,
          })}
          style={styles.verseCard}
        >
          <Text style={styles.verseCardLabel}>VERSE OF THE DAY</Text>
          <Text style={styles.verseCardRef}>{verse.ref}</Text>
          <Text style={styles.verseCardText}>{verse.text}</Text>
        </TouchableOpacity>

        {/* ── 3. Continue Reading ──────────────────────── */}
        {mostRecent ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Chapter', {
              bookId: mostRecent.book_id,
              chapterNum: mostRecent.chapter_num,
            })}
            style={styles.continueCard}
          >
            <View style={styles.continueCardContent}>
              <Text style={styles.continueBookName}>{mostRecent.book_name}</Text>
              <Text style={styles.continueChapter}>
                Chapter {mostRecent.chapter_num}
                {mostRecent.title ? ` · ${mostRecent.title}` : ''}
              </Text>
            </View>
            <View style={styles.continueAction}>
              <Text style={styles.continueLabel}>Continue</Text>
              <ArrowRight size={14} color={base.gold} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Chapter', {
              bookId: 'genesis',
              chapterNum: 1,
            })}
            style={styles.continueCard}
          >
            <View style={styles.continueCardContent}>
              <Text style={styles.continueBookName}>Begin Your Journey</Text>
              <Text style={styles.continueChapter}>
                Start reading through Scripture
              </Text>
            </View>
            <View style={styles.continueAction}>
              <Text style={styles.continueLabel}>Genesis 1</Text>
              <ArrowRight size={14} color={base.gold} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── 4. Reading Stats ─────────────────────────── */}
        {readingStats && readingStats.totalChapters > 0 && (
          <View style={styles.statsRow}>
            <StatBox value={readingStats.totalChapters} label="Chapters Read" />
            <StatBox value={readingStats.currentStreak} label="Day Streak" />
            <StatBox value={uniqueBooks || 1} label="Books Explored" />
          </View>
        )}

        {/* ── 5. Explore Quick Links ──────────────────── */}
        <View style={styles.exploreSection}>
          <Text style={styles.exploreSectionLabel}>EXPLORE</Text>
          <ExploreLink
            icon={Users}
            title="People"
            subtitle={stats ? `${stats.peopleCount} biblical figures` : 'Biblical figures across eras'}
            onPress={() => navigation.navigate('ExploreTab', { screen: 'GenealogyTree' })}
          />
          <ExploreLink
            icon={Clock}
            title="Timeline"
            subtitle={stats ? `${stats.timelineCount} events & figures` : 'Events from Creation to Revelation'}
            onPress={() => navigation.navigate('ExploreTab', { screen: 'Timeline' })}
          />
          <ExploreLink
            icon={GraduationCap}
            title="Scholars"
            subtitle={stats ? `${stats.scholarCount} commentators` : 'Commentators across traditions'}
            onPress={() => navigation.navigate('ExploreTab', { screen: 'ScholarBrowse' })}
          />
        </View>

        {/* ── 6. About Footer ─────────────────────────── */}
        <View style={styles.aboutFooter}>
          <BookOpen size={16} color={base.textMuted} style={styles.aboutIcon} />
          <Text style={styles.aboutText}>
            Scripture Deep Dive presents the Bible alongside scholarly commentary from evangelical,
            reformed, Jewish, critical, and patristic traditions.
          </Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface ExploreLinkProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ExploreLink({ icon: Icon, title, subtitle, onPress }: ExploreLinkProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={styles.exploreRow}
    >
      <Icon size={20} color={base.gold} />
      <View style={styles.exploreRowText}>
        <Text style={styles.exploreTitle}>{title}</Text>
        <Text style={styles.exploreSubtitle}>{subtitle}</Text>
      </View>
      <ArrowRight size={14} color={base.textMuted} />
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Greeting
  greetingSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  greetingText: {
    color: base.text,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  greetingSubtitle: {
    color: base.textDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    marginTop: spacing.xs,
  },

  // Verse of the Day
  verseCard: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: base.gold + '25',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  verseCardLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  verseCardRef: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  verseCardText: {
    color: base.text,
    fontFamily: fontFamily.body,
    fontSize: 20,
    lineHeight: 32,
  },

  // Continue Reading
  continueCard: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: base.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueCardContent: {
    flex: 1,
  },
  continueBookName: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  continueChapter: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: 2,
  },
  continueAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.md,
  },
  continueLabel: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },

  // Reading Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: base.border,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  statValue: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
  },
  statLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },

  // Explore
  exploreSection: {
    marginBottom: spacing.lg,
  },
  exploreSectionLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: base.border,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  exploreRowText: {
    flex: 1,
  },
  exploreTitle: {
    color: base.text,
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  exploreSubtitle: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 1,
  },

  // About Footer
  aboutFooter: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  aboutIcon: {
    marginBottom: spacing.sm,
  },
  aboutText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  aboutVersion: {
    color: base.textMuted + '80',
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: spacing.sm,
  },
});
