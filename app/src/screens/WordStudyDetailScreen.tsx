/**
 * WordStudyDetailScreen — Full lexicon card for a single word.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getWordStudy } from '../db/content';
import { BadgeChip } from '../components/BadgeChip';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing, fontFamily } from '../theme';
import type { WordStudy } from '../types';
import { logger } from '../utils/logger';

export default function WordStudyDetailScreen() {
  const { base, panels } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'WordStudyDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'WordStudyDetail'>>();
  const { wordId } = route.params ?? {};
  const [word, setWord] = useState<WordStudy | null>(null);

  useEffect(() => {
    if (wordId) getWordStudy(wordId).then(setWord);
  }, [wordId]);

  if (!word) {
    return (
      <View style={[styles.loading, { backgroundColor: base.bg }]}>
        <LoadingSkeleton lines={6} height={16} />
      </View>
    );
  }

  const accentColor = word.language === 'hebrew' ? panels.heb.accent : panels.hist.accent;
  let glosses: string[] = [];
  try { glosses = JSON.parse(word.glosses_json); } catch (err) { logger.warn('WordStudyDetailScreen', 'Operation failed', err); }
  type Occurrence = { ref: string; gloss: string; ctx: string };
  let occurrences: Occurrence[] = [];
  try {
    const raw = word.occurrences_json ? JSON.parse(word.occurrences_json) : [];
    // Normalize: support both string[] (legacy) and object[] shapes
    occurrences = raw.map((item: string | Occurrence) =>
      typeof item === 'string' ? { ref: item, gloss: '', ctx: '' } : item
    );
  } catch (err) { logger.warn('WordStudyDetailScreen', 'Operation failed', err); }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Word Study"
          titleColor={accentColor}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {/* Original word */}
        <Text style={[styles.original, { color: accentColor }]}>{word.original}</Text>
        <Text style={[styles.transliteration, { color: base.goldDim }]}>{word.transliteration}</Text>
        {word.strongs && (
          <Text style={[styles.strongs, { color: base.textMuted }]}>Strong's: {word.strongs}</Text>
        )}

        {/* Concordance link */}
        {word.strongs && (
          <TouchableOpacity
            style={styles.concordanceBtn}
            accessibilityRole="button"
            accessibilityLabel="See every occurrence in Scripture"
            onPress={() => navigation.navigate('Concordance', {
              strongs: word.strongs!,
              original: word.original,
              transliteration: word.transliteration,
              gloss: glosses[0] ?? null,
            })}
            activeOpacity={0.7}
          >
            <BookOpen size={14} color={base.gold} />
            <Text style={[styles.concordanceBtnText, { color: base.gold }]}>
              See every occurrence in Scripture
            </Text>
          </TouchableOpacity>
        )}

        {/* Glosses */}
        {glosses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: base.gold }]}>GLOSSES</Text>
            <View style={styles.chipRow}>
              {glosses.map((g, i) => <BadgeChip key={i} label={g} color={accentColor} />)}
            </View>
          </View>
        )}

        {/* Semantic range */}
        {word.semantic_range && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: base.gold }]}>SEMANTIC RANGE</Text>
            <Text style={[styles.bodyText, { color: base.textDim }]}>{word.semantic_range}</Text>
          </View>
        )}

        {/* Note */}
        {word.note && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: base.gold }]}>THEOLOGICAL NOTE</Text>
            <Text style={[styles.bodyText, { color: base.textDim }]}>{word.note}</Text>
          </View>
        )}

        {/* Occurrences */}
        {occurrences.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: base.gold }]}>KEY OCCURRENCES</Text>
            {occurrences.map((occ, i) => (
              <View key={i} style={[styles.occurrenceRow, { borderBottomColor: base.textMuted + '22' }]}>
                <View style={styles.occurrenceHeader}>
                  <BadgeChip label={occ.ref} color={base.textMuted} />
                  {occ.gloss ? <Text style={[styles.occurrenceGloss, { color: base.goldDim }]}>{occ.gloss}</Text> : null}
                </View>
                {occ.ctx ? <Text style={[styles.occurrenceCtx, { color: base.textDim }]}>{occ.ctx}</Text> : null}
              </View>
            ))}
          </View>
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
  original: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 36,
    textAlign: 'center',
  },
  transliteration: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  strongs: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  concordanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  concordanceBtnText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
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
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  occurrenceRow: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  occurrenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  occurrenceGloss: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
  },
  occurrenceCtx: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
});
