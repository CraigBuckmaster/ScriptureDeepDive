/**
 * BookIntroScreen — Full book introduction page.
 *
 * Renders title, subtitle, authorship, and all sections from book_intros.
 * Sections may contain: content (prose), outline (structured list), themes (tags).
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import type { BookIntroSection, BookIntroOutlineItem, BookIntroPlanItem } from '../types';
import { useBookIntro } from '../hooks/useBookIntro';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { BadgeChip } from '../components/BadgeChip';
import { base, useTheme, spacing, radii, fontFamily } from '../theme';

export default function BookIntroScreen() {
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

        {/* Authorship */}
        {intro.authorship && (
          <View style={[styles.authorshipBlock, { borderBottomColor: base.border }]}>
            <Text style={[styles.authorshipLabel, { color: base.gold }]}>AUTHORSHIP</Text>
            {typeof intro.authorship === 'string' ? (
              <Text style={[styles.bodyText, { color: base.textDim }]}>{intro.authorship}</Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
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
