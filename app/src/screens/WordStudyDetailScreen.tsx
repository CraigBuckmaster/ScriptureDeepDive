/**
 * WordStudyDetailScreen — Full lexicon card for a single word.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getWordStudy } from '../db/content';
import { BadgeChip } from '../components/BadgeChip';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { base, spacing, fontFamily } from '../theme';
import type { WordStudy } from '../types';
import { logger } from '../utils/logger';

export default function WordStudyDetailScreen() {
  const navigation = useNavigation<ScreenNavProp<'Explore', 'WordStudyDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'WordStudyDetail'>>();
  const { wordId } = route.params ?? {};
  const [word, setWord] = useState<WordStudy | null>(null);

  useEffect(() => {
    if (wordId) getWordStudy(wordId).then(setWord);
  }, [wordId]);

  if (!word) {
    return (
      <View style={styles.loading}>
        <LoadingSkeleton lines={6} height={16} />
      </View>
    );
  }

  const accentColor = word.language === 'hebrew' ? '#e890b8' : '#70b8e8';
  let glosses: string[] = [];
  try { glosses = JSON.parse(word.glosses_json); } catch (err) { logger.warn('WordStudyDetailScreen', 'Operation failed', err); }
  let occurrences: string[] = [];
  try { occurrences = word.occurrences_json ? JSON.parse(word.occurrences_json) : []; } catch (err) { logger.warn('WordStudyDetailScreen', 'Operation failed', err); }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Word Study"
          titleColor={accentColor}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {/* Original word */}
        <Text style={[styles.original, { color: accentColor }]}>{word.original}</Text>
        <Text style={styles.transliteration}>{word.transliteration}</Text>
        {word.strongs && (
          <Text style={styles.strongs}>Strong's: {word.strongs}</Text>
        )}

        {/* Glosses */}
        {glosses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>GLOSSES</Text>
            <View style={styles.chipRow}>
              {glosses.map((g, i) => <BadgeChip key={i} label={g} color={accentColor} />)}
            </View>
          </View>
        )}

        {/* Semantic range */}
        {word.semantic_range && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SEMANTIC RANGE</Text>
            <Text style={styles.bodyText}>{word.semantic_range}</Text>
          </View>
        )}

        {/* Note */}
        {word.note && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>THEOLOGICAL NOTE</Text>
            <Text style={styles.bodyText}>{word.note}</Text>
          </View>
        )}

        {/* Occurrences */}
        {occurrences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>KEY OCCURRENCES</Text>
            <View style={styles.chipRow}>
              {occurrences.map((ref, i) => <BadgeChip key={i} label={ref} color={base.textMuted} />)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: base.bg,
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  original: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 36,
    textAlign: 'center',
  },
  transliteration: {
    color: base.goldDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  strongs: {
    color: base.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    color: base.gold,
    fontFamily: fontFamily.display,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  bodyText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
});
