/**
 * WordStudyBrowseScreen — 15 lexicon entries with Hebrew/Greek filter + search.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWordStudies } from '../hooks/useWordStudies';
import { base, spacing, radii, MIN_TOUCH_TARGET } from '../theme';

export default function WordStudyBrowseScreen() {
  const navigation = useNavigation<any>();
  const { studies } = useWordStudies();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg }}>
        <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, marginBottom: spacing.md }}>
          Word Studies
        </Text>

        {/* Search */}
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Search by word or gloss..."
          placeholderTextColor={base.textMuted}
          style={{
            backgroundColor: base.bgElevated, color: base.text,
            fontFamily: 'SourceSans3_400Regular', fontSize: 14,
            borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
            borderWidth: 1, borderColor: base.border, marginBottom: spacing.sm,
          }}
        />

        {/* Language filter */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
          {(['all', 'hebrew', 'greek'] as const).map((l) => (
            <TouchableOpacity key={l} onPress={() => setLangFilter(l)}>
              <Text style={{
                color: langFilter === l ? base.gold : base.textMuted,
                fontFamily: 'Cinzel_500Medium', fontSize: 12,
                borderBottomWidth: langFilter === l ? 2 : 0,
                borderBottomColor: base.gold, paddingBottom: 4,
              }}>
                {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(w) => w.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item: w }) => {
          const accentColor = w.language === 'hebrew' ? '#e890b8' : '#70b8e8';
          let glosses = '';
          try { glosses = JSON.parse(w.glosses_json).join(', '); } catch { glosses = w.glosses_json; }

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('WordStudyDetail', { wordId: w.id })}
              style={{
                paddingVertical: spacing.md,
                borderBottomWidth: 1, borderBottomColor: base.border + '40',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
                <Text style={{ color: accentColor, fontFamily: 'EBGaramond_500Medium', fontSize: 20 }}>
                  {w.original}
                </Text>
                <Text style={{ color: base.goldDim, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 13 }}>
                  {w.transliteration}
                </Text>
              </View>
              <Text style={{ color: base.gold, fontFamily: 'EBGaramond_600SemiBold', fontSize: 13, marginTop: 2 }}>
                {glosses}
              </Text>
              {w.strongs && (
                <Text style={{ color: base.textMuted, fontFamily: 'SourceSans3_400Regular', fontSize: 10, marginTop: 2 }}>
                  Strong's: {w.strongs}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
