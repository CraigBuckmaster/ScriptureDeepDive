/**
 * LensBrowseScreen — Browse all hermeneutic lenses with descriptions.
 *
 * Explains each interpretive framework and links to try it on a sample chapter.
 *
 * Card #1359 (UI polish phase 2): migrated from a raw ScrollView to the
 * BrowseScreenTemplate (FlatList). The intro paragraph is rendered via the
 * template's flatListProps.ListHeaderComponent so it scrolls with the list.
 *
 * Epic #820 / Phase 0: removed the hardcoded LENS_DETAILS map. Long-form
 * lens descriptions now live in the `hermeneutic_lenses.long_description`
 * column and are sourced from content/hermeneutic_lenses/lenses.json.
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
      {lens.long_description ? (
        <Text style={[styles.cardDetail, { color: base.textMuted }]}>
          {lens.long_description}
        </Text>
      ) : null}
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
