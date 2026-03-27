/**
 * WordStudyBrowseScreen — 15 lexicon entries with Hebrew/Greek filter + search.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWordStudies } from '../hooks/useWordStudies';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { base, spacing, radii, fontFamily } from '../theme';
import { logger } from '../utils/logger';

export default function WordStudyBrowseScreen() {
  const navigation = useNavigation<any>();
  const { studies, isLoading } = useWordStudies();
  const [langFilter, setLangFilter] = useState<'all' | 'hebrew' | 'greek'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = studies;
    if (langFilter !== 'all') list = list.filter((w) => w.language === langFilter);
    if (search.length >= 2) {
      const q = search.toLowerCase();
      list = list.filter((w) =>
        w.transliteration.toLowerCase().includes(q) ||
        w.original.includes(search) ||
        (w.glosses_json && w.glosses_json.toLowerCase().includes(q))
      );
    }
    return list;
  }, [studies, langFilter, search]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingPad}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <ScreenHeader
          title="Word Studies"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        <View style={{ marginBottom: spacing.sm }}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by word or gloss..."
          />
        </View>

        <View style={styles.langRow}>
          {(['all', 'hebrew', 'greek'] as const).map((l) => (
            <TouchableOpacity key={l} onPress={() => setLangFilter(l)}>
              <Text style={[styles.langLabel, langFilter === l && styles.langLabelActive]}>
                {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(w) => w.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: w }) => {
          const accentColor = w.language === 'hebrew' ? '#e890b8' : '#70b8e8';
          let glosses = '';
          try { glosses = JSON.parse(w.glosses_json).join(', '); } catch (err) { glosses = w.glosses_json; }

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('WordStudyDetail', { wordId: w.id })}
              style={styles.row}
              accessibilityLabel={`${w.transliteration}, ${w.language}`}
              accessibilityRole="button"
            >
              <View style={styles.wordRow}>
                <Text style={[styles.original, { color: accentColor }]}>{w.original}</Text>
                <Text style={styles.transliteration}>{w.transliteration}</Text>
              </View>
              <Text style={styles.glosses}>{glosses}</Text>
              {w.strongs && <Text style={styles.strongs}>Strong's: {w.strongs}</Text>}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  headerSpacing: {
    marginBottom: spacing.md,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  langLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    paddingBottom: 4,
  },
  langLabelActive: {
    color: base.gold,
    borderBottomWidth: 2,
    borderBottomColor: base.gold,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  original: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 20,
  },
  transliteration: {
    color: base.goldDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
  },
  glosses: {
    color: base.gold,
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    marginTop: 2,
  },
  strongs: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
});
