/**
 * DictionaryDetailScreen — Full entry view with tappable refs + cross-links.
 *
 * Shows definition text with inline tappable scripture references,
 * a references chip section, related entries, cross-link banner to
 * richer CS features, and attribution footer.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { useDictionaryDetail } from '../hooks/useDictionary';
import { DictionaryCrossLink } from '../components/DictionaryCrossLink';
import { TappableRefs } from '../components/TappableRefs';
import { splitTextWithRefs } from '../utils/refDetector';
import { parseVerseRef } from '../utils/verseRef';
import { CATEGORY_LABELS, type DictionaryCategory } from '../types/dictionary';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = ScreenNavProp<'Explore', 'DictionaryDetail'>;
type Route = ScreenRouteProp<'Explore', 'DictionaryDetail'>;

function DictionaryDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { entryId } = route.params;
  const { entry, isLoading } = useDictionaryDetail(entryId);

  const handleRefPress = useCallback(
    (ref: string) => {
      const parsed = parseVerseRef(ref);
      if (parsed) {
        (navigation as any).navigate('Chapter', { bookId: parsed.bookId, chapterNum: parsed.ch });
      }
    },
    [navigation]
  );

  const handleRelatedPress = useCallback(
    (relatedId: string) => {
      (navigation as any).push('DictionaryDetail', { entryId: relatedId });
    },
    [navigation]
  );

  const handlePersonPress = useCallback(
    (personId: string) => {
      (navigation as any).navigate('PersonDetail', { personId });
    },
    [navigation]
  );

  const handlePlacePress = useCallback(
    (placeId: string) => {
      (navigation as any).navigate('Map', { placeId });
    },
    [navigation]
  );

  const handleWordStudyPress = useCallback(
    (wordId: string) => {
      (navigation as any).navigate('WordStudyDetail', { wordId });
    },
    [navigation]
  );

  const handleConceptPress = useCallback(
    (conceptId: string) => {
      (navigation as any).navigate('ConceptDetail', { conceptId });
    },
    [navigation]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={22} color={base.gold} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: base.gold }]}>Not Found</Text>
        </View>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: base.textDim }]}>Entry not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryLabel = CATEGORY_LABELS[entry.category as DictionaryCategory] || entry.category;
  const segments = splitTextWithRefs(entry.definition);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={base.gold} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: base.gold }]} numberOfLines={1}>
            {entry.term}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: base.gold + '15' }]}>
          <Text style={[styles.categoryText, { color: base.gold }]}>{categoryLabel}</Text>
        </View>

        {/* Cross-link banner */}
        <DictionaryCrossLink
          personId={entry.crossLinks.personId}
          placeId={entry.crossLinks.placeId}
          wordStudyId={entry.crossLinks.wordStudyId}
          conceptId={entry.crossLinks.conceptId}
          onPersonPress={handlePersonPress}
          onPlacePress={handlePlacePress}
          onWordStudyPress={handleWordStudyPress}
          onConceptPress={handleConceptPress}
        />

        {/* Definition with inline tappable refs */}
        <Text style={[styles.sectionLabel, { color: base.textMuted }]}>DEFINITION</Text>
        <Text style={[styles.definition, { color: base.text }]}>
          {segments.map((seg, i) =>
            seg.type === 'ref' ? (
              <Text
                key={i}
                style={{ color: base.gold }}
                onPress={() => handleRefPress(seg.value)}
              >
                {seg.value}
              </Text>
            ) : (
              <Text key={i}>{seg.value}</Text>
            )
          )}
        </Text>

        {/* References section */}
        {entry.refs.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: base.textMuted, marginTop: spacing.lg }]}>
              REFERENCES
            </Text>
            <TappableRefs refs={entry.refs} onRefPress={handleRefPress} />
          </>
        )}

        {/* Related entries */}
        {entry.related.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: base.textMuted, marginTop: spacing.lg }]}>
              RELATED ENTRIES
            </Text>
            <View style={styles.relatedRow}>
              {entry.related.map((relId, i) => (
                <React.Fragment key={relId}>
                  {i > 0 && (
                    <Text style={[styles.relatedSep, { color: base.textMuted }]}> · </Text>
                  )}
                  <TouchableOpacity onPress={() => handleRelatedPress(relId)}>
                    <Text style={[styles.relatedText, { color: base.gold }]}>
                      {relId.replace(/-/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        {/* Attribution */}
        <View style={[styles.attribution, { borderTopColor: base.border }]}>
          <Text style={[styles.attributionText, { color: base.textMuted }]}>
            Source: Easton's Bible Dictionary{'\n'}
            M.G. Easton, 1897 (public domain)
          </Text>
        </View>
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  categoryText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  definition: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    lineHeight: 22,
  },
  relatedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  relatedText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  relatedSep: {
    fontSize: 13,
  },
  attribution: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  attributionText: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
});

export default withErrorBoundary(DictionaryDetailScreen);
