/**
 * BookIntroScreen — Full book introduction page.
 *
 * Renders title, subtitle, authorship, and all sections from book_intros.
 * Sections may contain: content (prose), outline (structured list), themes (tags).
 *
 * Enrichment sections (#1112): at_a_glance, outline bar, key_verses, christ_in.
 * These render above existing sections when present, with graceful null handling.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import type {
  BookIntroSection, BookIntroOutlineItem, BookIntroPlanItem,
  BookIntroKeyVerse, BookIntroEnrichedOutlineItem, BookIntroAtAGlance,
} from '../types';
import { useBookIntro } from '../hooks/useBookIntro';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { BadgeChip } from '../components/BadgeChip';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function BookIntroScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Read', 'BookIntro'>>();
  const route = useRoute<ScreenRouteProp<'Read', 'BookIntro'>>();
  const { bookId } = route.params ?? {};
  const { intro, isLoading } = useBookIntro(bookId);

  if (isLoading || !intro) {
    return (
      <View style={[styles.loading, { backgroundColor: base.bg }]}>
        <LoadingSkeleton lines={8} height={16} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={intro.title ?? 'About This Book'}
          subtitle={intro.subtitle ?? undefined}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {/* ── At-a-Glance Card (#1112) ── */}
        {intro.at_a_glance && (
          <View style={[styles.atAGlanceCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}>
            <Text style={[styles.enrichLabel, { color: base.gold }]}>AT A GLANCE</Text>
            <View style={styles.atAGlanceGrid}>
              {([
                ['Author', intro.at_a_glance.author],
                ['Date', intro.at_a_glance.date],
                ['Chapters', String(intro.at_a_glance.chapters)],
                ['Genre', intro.at_a_glance.genre],
                ['Key Theme', intro.at_a_glance.key_theme],
                ['Key Word', intro.at_a_glance.key_word],
              ] as [string, string][]).map(([label, value]) => (
                <View key={label} style={styles.atAGlanceCell}>
                  <Text style={[styles.atAGlanceCellLabel, { color: base.gold }]}>{label}</Text>
                  <Text style={[styles.atAGlanceCellValue, { color: base.text }]}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Enriched Outline Bar (#1112) ── */}
        {intro.outline && Array.isArray(intro.outline) && intro.outline.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.enrichLabel, { color: base.gold }]}>OUTLINE</Text>
            {/* Segmented bar — width proportional to chapter range */}
            <View style={[styles.outlineBar, { backgroundColor: base.bg3 ?? base.bgElevated }]}>
              {intro.outline.map((item: BookIntroEnrichedOutlineItem, j: number) => (
                <View
                  key={j}
                  style={[
                    styles.outlineBarSegment,
                    {
                      flex: 1,
                      backgroundColor: base.gold + (j % 2 === 0 ? '20' : '10'),
                      borderRightColor: base.border,
                      borderRightWidth: j < intro.outline!.length - 1 ? 1 : 0,
                    },
                  ]}
                >
                  <Text style={[styles.outlineBarLabel, { color: base.text }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={[styles.outlineBarRange, { color: base.goldDim }]} numberOfLines={1}>
                    {item.range}
                  </Text>
                </View>
              ))}
            </View>
            {/* Summaries below */}
            <View style={styles.outlineBlock}>
              {intro.outline.map((item: BookIntroEnrichedOutlineItem, j: number) => (
                <View key={j} style={[styles.outlineItem, { backgroundColor: base.bgElevated, borderLeftColor: base.gold + '40' }]}>
                  <View style={styles.outlineRow}>
                    <Text style={[styles.outlineLabel, { color: base.text }]}>{item.label}</Text>
                    <Text style={[styles.outlineChapters, { color: base.goldDim }]}>{item.range}</Text>
                  </View>
                  <Text style={[styles.outlineNote, { color: base.textMuted }]}>{item.summary}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Key Verses (#1112) ── */}
        {intro.key_verses && Array.isArray(intro.key_verses) && intro.key_verses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.enrichLabel, { color: base.gold }]}>KEY VERSES</Text>
            <View style={styles.keyVersesBlock}>
              {intro.key_verses.map((verse: BookIntroKeyVerse, j: number) => (
                <TouchableOpacity
                  key={j}
                  activeOpacity={0.7}
                  style={[styles.keyVerseCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                >
                  <Text style={[styles.keyVerseRef, { color: base.gold }]}>{verse.ref}</Text>
                  <Text style={[styles.keyVerseText, { color: base.text }]}>{verse.text}</Text>
                  <Text style={[styles.keyVerseWhy, { color: base.textMuted }]}>{verse.why}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Christ In This Book (#1112) ── */}
        {intro.christ_in && (
          <View style={[styles.christInBlock, { backgroundColor: base.gold + '0D', borderColor: base.gold + '30' }]}>
            <Text style={[styles.enrichLabel, { color: base.gold }]}>CHRIST IN THIS BOOK</Text>
            <Text style={[styles.bodyText, { color: base.text }]}>{intro.christ_in}</Text>
          </View>
        )}

        {/* Authorship */}
        {intro.authorship && (
          <View style={[styles.authorshipBlock, { borderBottomColor: base.border }]}>
            <Text style={[styles.authorshipLabel, { color: base.gold }]}>AUTHORSHIP</Text>
            {typeof intro.authorship === 'string' ? (
              <Text style={[styles.bodyText, { color: base.textDim }]}>{intro.authorship}</Text>
            ) : (
              <View style={styles.authorshipDetails}>
                {intro.authorship.author && (
                  <View>
                    <Text style={[styles.authorshipSubLabel, { color: base.gold }]}>Author</Text>
                    <Text style={[styles.bodyText, { color: base.textDim }]}>{intro.authorship.author}</Text>
                  </View>
                )}
                {intro.authorship.date && (
                  <View>
                    <Text style={[styles.authorshipSubLabel, { color: base.gold }]}>Date</Text>
                    <Text style={[styles.bodyText, { color: base.textDim }]}>{intro.authorship.date}</Text>
                  </View>
                )}
                {intro.authorship.prompt && (
                  <View>
                    <Text style={[styles.authorshipSubLabel, { color: base.gold }]}>Purpose</Text>
                    <Text style={[styles.bodyText, { color: base.textDim }]}>{intro.authorship.prompt}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Sections */}
        {intro.sections?.map((section: BookIntroSection, i: number) => (
          <View key={i} style={styles.section}>
            {section.heading && (
              <Text style={[styles.sectionHeading, { color: base.gold }]}>{section.heading}</Text>
            )}

            {/* Prose content — field is "content" in JSON, not "body" */}
            {(section.content || section.body) && (
              <Text style={[styles.bodyText, { color: base.textDim }]}>
                {section.content ?? section.body}
              </Text>
            )}

            {/* Outline (structured list with label + chapters + note) */}
            {section.outline && Array.isArray(section.outline) && (
              <View style={styles.outlineBlock}>
                {section.outline.map((item: BookIntroOutlineItem, j: number) => (
                  <View key={j} style={[styles.outlineItem, { backgroundColor: base.bgElevated, borderLeftColor: base.gold + '40' }]}>
                    <View style={styles.outlineRow}>
                      <Text style={[styles.outlineLabel, { color: base.text }]}>{item.label}</Text>
                      {item.chapters && (
                        <Text style={[styles.outlineChapters, { color: base.goldDim }]}>
                          Ch. {item.chapters[0]}–{item.chapters[1]}
                        </Text>
                      )}
                    </View>
                    {item.note && (
                      <Text style={[styles.outlineNote, { color: base.textMuted }]}>{item.note}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Themes (tag list) */}
            {section.themes && Array.isArray(section.themes) && (
              <View style={styles.themesRow}>
                {section.themes.map((theme: string, k: number) => (
                  <BadgeChip key={k} label={theme} color={base.gold} />
                ))}
              </View>
            )}

            {/* Reading Plan (ref + label list) */}
            {section.plan && Array.isArray(section.plan) && (
              <View style={styles.planBlock}>
                {section.plan.map((item: BookIntroPlanItem, j: number) => (
                  <View key={j} style={[styles.planItem, { backgroundColor: base.bgElevated, borderLeftColor: base.gold + '60' }]}>
                    <Text style={[styles.planRef, { color: base.gold }]}>{item.ref}</Text>
                    <Text style={[styles.planLabel, { color: base.textDim }]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Fallback text (no sections) */}
        {!intro.sections && intro.text && (
          <Text style={[styles.bodyText, { color: base.textDim }]}>{intro.text}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  /* ── Enrichment styles (#1112) ── */
  enrichLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  atAGlanceCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  atAGlanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  atAGlanceCell: {
    width: '50%',
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  atAGlanceCellLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  atAGlanceCellValue: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
  },
  outlineBar: {
    flexDirection: 'row',
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  outlineBarSegment: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  outlineBarLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
  },
  outlineBarRange: {
    fontFamily: fontFamily.ui,
    fontSize: 8,
    marginTop: 1,
  },
  keyVersesBlock: {
    gap: spacing.sm,
  },
  keyVerseCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  keyVerseRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  keyVerseText: {
    fontFamily: fontFamily.bodyItalic ?? fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  keyVerseWhy: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 18,
  },
  christInBlock: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  /* ── Existing styles ── */
  authorshipBlock: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  authorshipLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  authorshipDetails: {
    gap: spacing.sm,
  },
  authorshipSubLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    marginBottom: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
  },
  outlineBlock: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  outlineItem: {
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderLeftWidth: 3,
  },
  outlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outlineLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
    flex: 1,
  },
  outlineChapters: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  outlineNote: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    marginTop: 2,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  planBlock: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  planItem: {
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderLeftWidth: 3,
  },
  planRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
    marginBottom: 2,
  },
  planLabel: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default withErrorBoundary(BookIntroScreen);
