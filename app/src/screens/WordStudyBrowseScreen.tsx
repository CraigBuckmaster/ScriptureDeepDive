/**
 * WordStudyBrowseScreen — 15 lexicon entries with Hebrew/Greek filter + search.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useWordStudies } from '../hooks/useWordStudies';
import type { WordStudy } from '../types';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
import { useTheme, spacing, fontFamily, panels } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function WordStudyBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'WordStudyBrowse'>>();
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

  const renderItem = useCallback(
    ({ item: w }: { item: WordStudy }) => {
      const accentColor = w.language === 'hebrew' ? panels.heb.accent : panels.hist.accent;
      let glosses = '';
      try { glosses = JSON.parse(w.glosses_json).join(', '); } catch { glosses = w.glosses_json; }

      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('WordStudyDetail', { wordId: w.id })}
          style={[styles.row, { borderBottomColor: base.border + '40' }]}
          accessibilityLabel={`${w.transliteration}, ${w.language}`}
          accessibilityRole="button"
        >
          <View style={styles.wordRow}>
            <Text style={[styles.original, { color: accentColor }]}>{w.original}</Text>
            <Text style={[styles.transliteration, { color: base.goldDim }]}>{w.transliteration}</Text>
          </View>
          <Text style={[styles.glosses, { color: base.gold }]}>{glosses}</Text>
          {w.strongs && <Text style={[styles.strongs, { color: base.textMuted }]}>Strong&apos;s: {w.strongs}</Text>}
        </TouchableOpacity>
      );
    },
    [base, navigation]
  );

  const filterBar = (
    <View style={styles.langRow}>
      {(['all', 'hebrew', 'greek'] as const).map((l) => (
        <TouchableOpacity key={l} onPress={() => setLangFilter(l)}>
          <Text style={[
            styles.langLabel,
            { color: base.textMuted },
            langFilter === l && { color: base.gold, borderBottomColor: base.gold },
            langFilter === l && styles.langLabelActive,
          ]}>
            {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <BrowseScreenTemplate
      title="Word Studies"
      loading={isLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by word or gloss..."
      filterBar={filterBar}
      data={filtered}
      renderItem={renderItem}
      keyExtractor={(w: WordStudy) => w.id}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  langLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    paddingBottom: 4,
  },
  langLabelActive: {
    borderBottomWidth: 2,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
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
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
  },
  glosses: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    marginTop: 2,
  },
  strongs: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
});

export default withErrorBoundary(WordStudyBrowseScreen);
