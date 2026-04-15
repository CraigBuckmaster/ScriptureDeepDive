/**
 * LensBrowseScreen — Browse all hermeneutic lenses with descriptions.
 *
 * Explains each interpretive framework and links to try it on a sample chapter.
 *
 * Card #1359 (UI polish phase 2): migrated from a raw ScrollView to the
 * BrowseScreenTemplate (FlatList). The intro paragraph is rendered via the
 * template's flatListProps.ListHeaderComponent so it scrolls with the list.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { BrowseScreenTemplate, browseCardStyle } from '../components/BrowseScreenTemplate';
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

  const handleTry = useCallback((_lensId: string) => {
    navigation.navigate('Chapter', {
      bookId: SAMPLE_CHAPTER.bookId,
      chapterNum: SAMPLE_CHAPTER.chapterNum,
    });
  }, [navigation]);

  const cardStyle = browseCardStyle(base);

  const renderItem = useCallback(({ item: lens }: { item: HermeneuticLens }) => (
    <View style={cardStyle}>
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
  ), [base, cardStyle, handleTry]);

  const intro = (
    <Text style={[styles.intro, { color: base.textDim }]}>
      Read Scripture through different interpretive frameworks. Each lens highlights
      different aspects of the text and reshapes the study tools shown alongside it.
    </Text>
  );

  return (
    <BrowseScreenTemplate
      title="Hermeneutic Lenses"
      loading={loading}
      data={lenses}
      renderItem={renderItem}
      keyExtractor={(lens: HermeneuticLens) => lens.id}
      emptyMessage="No lenses available."
      flatListProps={{ ListHeaderComponent: intro }}
    />
  );
}

const styles = StyleSheet.create({
  intro: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.lg,
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
