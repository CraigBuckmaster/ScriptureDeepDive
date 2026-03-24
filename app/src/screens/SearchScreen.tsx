/**
 * SearchScreen — Full FTS5 search across verses, people, word studies.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SectionList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSearch } from '../hooks/useSearch';
import { BadgeChip } from '../components/BadgeChip';
import { base, spacing, radii, eras } from '../theme';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const { results, isLoading } = useSearch(query);

  const sections = [
    ...(results.people.length ? [{ title: 'People', data: results.people.map((p) => ({ type: 'person' as const, item: p })) }] : []),
    ...(results.wordStudies.length ? [{ title: 'Word Studies', data: results.wordStudies.map((w) => ({ type: 'word' as const, item: w })) }] : []),
    ...(results.verses.length ? [{ title: 'Verses', data: results.verses.slice(0, 20).map((v) => ({ type: 'verse' as const, item: v })) }] : []),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search verses, people, word studies..."
          placeholderTextColor={base.textMuted}
          autoFocus
          style={{
            backgroundColor: base.bgElevated, color: base.text,
            fontFamily: 'SourceSans3_400Regular', fontSize: 16,
            borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
            borderWidth: 1, borderColor: base.border,
          }}
        />
      </View>

      {query.length < 2 ? (
        <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
          <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 15 }}>
            Search verses, people, and more...
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, i) => `${item.type}-${i}`}
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
          renderSectionHeader={({ section }) => (
            <View style={{ paddingTop: spacing.md, paddingBottom: spacing.xs, backgroundColor: base.bg }}>
              <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 10, letterSpacing: 0.5 }}>
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          renderItem={({ item: { type, item } }) => {
            if (type === 'person') {
              const p = item as any;
              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExploreTab', { screen: 'PersonDetail', params: { personId: p.id } })}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.era ? (eras[p.era] ?? base.textMuted) : base.textMuted }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: base.text, fontFamily: 'SourceSans3_500Medium', fontSize: 14 }}>{p.name}</Text>
                    <Text style={{ color: base.textMuted, fontSize: 11 }} numberOfLines={1}>{p.role}</Text>
                  </View>
                </TouchableOpacity>
              );
            }
            if (type === 'word') {
              const w = item as any;
              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExploreTab', { screen: 'WordStudyDetail', params: { wordId: w.id } })}
                  style={{ paddingVertical: spacing.sm }}
                >
                  <Text style={{ color: '#e890b8', fontFamily: 'EBGaramond_500Medium', fontSize: 16 }}>{w.original}</Text>
                  <Text style={{ color: base.goldDim, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 12 }}>{w.transliteration}</Text>
                </TouchableOpacity>
              );
            }
            const v = item as any;
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('ReadTab', { screen: 'Chapter', params: { bookId: v.book_id, chapterNum: v.chapter_num } })}
                style={{ paddingVertical: spacing.xs }}
              >
                <Text style={{ color: base.gold, fontFamily: 'SourceSans3_500Medium', fontSize: 12 }}>
                  {v.book_id} {v.chapter_num}:{v.verse_num}
                </Text>
                <Text style={{ color: base.textDim, fontSize: 12 }} numberOfLines={2}>{v.text}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
