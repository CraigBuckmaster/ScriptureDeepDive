/**
 * WordStudyDetailScreen — Full lexicon card for a single word.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getWordStudy } from '../db/content';
import { BadgeChip } from '../components/BadgeChip';
import { ScreenHeader } from '../components/ScreenHeader';
import { base, spacing } from '../theme';
import type { WordStudy } from '../types';

export default function WordStudyDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { wordId } = route.params ?? {};
  const [word, setWord] = useState<WordStudy | null>(null);

  useEffect(() => {
    if (wordId) getWordStudy(wordId).then(setWord);
  }, [wordId]);

  if (!word) return <View style={{ flex: 1, backgroundColor: base.bg }} />;

  const accentColor = word.language === 'hebrew' ? '#e890b8' : '#70b8e8';
  let glosses: string[] = [];
  try { glosses = JSON.parse(word.glosses_json); } catch {}
  let occurrences: string[] = [];
  try { occurrences = word.occurrences_json ? JSON.parse(word.occurrences_json) : []; } catch {}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <ScreenHeader
          title="Word Study"
          titleColor={accentColor}
          onBack={() => navigation.goBack()}
          style={{ marginBottom: spacing.md }}
        />
        {/* Original word */}
        <Text style={{ color: accentColor, fontFamily: 'EBGaramond_500Medium', fontSize: 36, textAlign: 'center' }}>
          {word.original}
        </Text>
        <Text style={{ color: base.goldDim, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 16, textAlign: 'center', marginTop: 4 }}>
          {word.transliteration}
        </Text>
        {word.strongs && (
          <Text style={{ color: base.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Strong's: {word.strongs}
          </Text>
        )}

        {/* Glosses */}
        {glosses.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.4 }}>
              GLOSSES
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs }}>
              {glosses.map((g, i) => <BadgeChip key={i} label={g} color={accentColor} />)}
            </View>
          </View>
        )}

        {/* Semantic range */}
        {word.semantic_range && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.4 }}>
              SEMANTIC RANGE
            </Text>
            <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 15, lineHeight: 24, marginTop: spacing.xs }}>
              {word.semantic_range}
            </Text>
          </View>
        )}

        {/* Note */}
        {word.note && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.4 }}>
              THEOLOGICAL NOTE
            </Text>
            <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 15, lineHeight: 24, marginTop: spacing.xs }}>
              {word.note}
            </Text>
          </View>
        )}

        {/* Occurrences */}
        {occurrences.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.4 }}>
              KEY OCCURRENCES
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs }}>
              {occurrences.map((ref, i) => <BadgeChip key={i} label={ref} color={base.textMuted} />)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
