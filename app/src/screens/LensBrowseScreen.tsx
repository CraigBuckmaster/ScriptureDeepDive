/**
 * LensBrowseScreen — Browse all hermeneutic lenses with descriptions.
 *
 * Explains each interpretive framework and links to try it on a sample chapter.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { useAsyncData } from '../hooks/useAsyncData';
import { getAllLenses } from '../db/content/hermeneutics';
import type { HermeneuticLens } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

/** Sample chapter to navigate to for trying a lens. */
const SAMPLE_CHAPTER = { bookId: 'genesis', chapterNum: 1 };

const LENS_DETAILS: Record<string, string> = {
  'historical-grammatical':
    'Seeks the original meaning of the text by analyzing grammar, syntax, and historical context. This approach asks: "What did the author intend, and what did the original audience understand?"',
  'redemptive-historical':
    'Reads every passage within the grand story of God\'s plan of redemption unfolding across Scripture. Traces how each text contributes to the arc from creation to new creation.',
  literary:
    'Focuses on the literary artistry of the text: genre, structure, chiasm, parallelism, and narrative technique. Asks how the form of the text shapes its meaning.',
  typological:
    'Identifies patterns (types) in earlier Scripture that find their fulfillment (antitypes) in later revelation. Traces shadows and substance across the testaments.',
  canonical:
    'Reads each passage in light of the whole canon of Scripture, asking how earlier and later books illuminate and qualify one another. Emphasizes intertextual connections.',
};

function LensBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'LensBrowse'>>();
  const { data: lenses, loading } = useAsyncData<HermeneuticLens[]>(
    () => getAllLenses(),
    [],
    [],
  );

  const handleTry = (_lensId: string) => {
    navigation.navigate('Chapter', {
      bookId: SAMPLE_CHAPTER.bookId,
      chapterNum: SAMPLE_CHAPTER.chapterNum,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Hermeneutic Lenses" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: base.textDim }]}>
          Read Scripture through different interpretive frameworks. Each lens highlights
          different aspects of the text and reshapes the study tools shown alongside it.
        </Text>

        {loading && (
          <Text style={[styles.loadingText, { color: base.textMuted }]}>Loading lenses...</Text>
        )}

        {lenses.map((lens) => (
          <View
            key={lens.id}
            style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
          >
            <View style={styles.cardHeader}>
              {lens.icon ? <Text style={styles.cardIcon}>{lens.icon}</Text> : null}
              <Text style={[styles.cardTitle, { color: base.text }]}>{lens.name}</Text>
            </View>
            <Text style={[styles.cardDescription, { color: base.textDim }]}>
              {lens.description}
            </Text>
            {LENS_DETAILS[lens.id] && (
              <Text style={[styles.cardDetail, { color: base.textMuted }]}>
                {LENS_DETAILS[lens.id]}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => handleTry(lens.id)}
              activeOpacity={0.7}
              style={[styles.tryButton, { borderColor: base.gold }]}
            >
              <Text style={[styles.tryButtonText, { color: base.gold }]}>
                Try on Genesis 1
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPad: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  intro: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  cardTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  cardDescription: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
  cardDetail: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  tryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  tryButtonText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});

export default withErrorBoundary(LensBrowseScreen);
