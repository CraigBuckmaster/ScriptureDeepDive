/**
 * HomeScreen — Landing page with hero, continue reading, search, book grid.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBooks } from '../hooks/useBooks';
import { useRecentChapters } from '../hooks/useRecentChapters';
import { useSearch } from '../hooks/useSearch';
import { BadgeChip } from '../components/BadgeChip';
import { base, spacing, radii, MIN_TOUCH_TARGET } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { liveBooks, books } = useBooks();
  const { recent } = useRecentChapters(5);
  const [query, setQuery] = useState('');
  const [testament, setTestament] = useState<'ot' | 'nt'>('ot');
  const { results, isLoading: searchLoading } = useSearch(query);

  const filteredBooks = useMemo(
    () => books.filter((b) => b.testament === testament),
    [books, testament]
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: base.bg }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      {/* Hero */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.xxl, paddingBottom: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 24, letterSpacing: 1, textAlign: 'center' }}>
          Scripture Deep Dive
        </Text>
        <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 15, marginTop: spacing.xs, textAlign: 'center' }}>
          Scholarly study of every chapter
        </Text>
      </View>

      {/* Continue Reading */}
      {recent.length > 0 && (
        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
          <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 10, letterSpacing: 0.5, marginBottom: spacing.sm }}>
            CONTINUE READING
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
            {recent.map((r, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => navigation.navigate('ReadTab', {
                  screen: 'Chapter',
                  params: { bookId: r.book_id, chapterNum: r.chapter_num },
                })}
              >
                <BadgeChip label={`${r.book_name} ${r.chapter_num}`} color={base.gold} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search */}
      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search verses, people..."
          placeholderTextColor={base.textMuted}
          style={{
            backgroundColor: base.bgElevated, color: base.text,
            fontFamily: 'SourceSans3_400Regular', fontSize: 14,
            borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
            borderWidth: 1, borderColor: base.border,
          }}
        />

        {/* Inline results */}
        {query.length >= 2 && (
          <View style={{ marginTop: spacing.sm, maxHeight: 300 }}>
            {results.people.length > 0 && results.people.slice(0, 3).map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => { setQuery(''); navigation.navigate('ExploreTab', { screen: 'PersonDetail', params: { personId: p.id } }); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs }}
              >
                <Text style={{ color: '#e86040', fontFamily: 'SourceSans3_500Medium', fontSize: 13 }}>
                  {p.name}
                </Text>
                <Text style={{ color: base.textMuted, fontSize: 11 }} numberOfLines={1}>{p.role}</Text>
              </TouchableOpacity>
            ))}
            {results.verses.length > 0 && results.verses.slice(0, 5).map((v, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { setQuery(''); navigation.navigate('ReadTab', { screen: 'Chapter', params: { bookId: v.book_id, chapterNum: v.chapter_num } }); }}
                style={{ paddingVertical: spacing.xs }}
              >
                <Text style={{ color: base.gold, fontFamily: 'SourceSans3_500Medium', fontSize: 12 }}>
                  {v.book_id} {v.chapter_num}:{v.verse_num}
                </Text>
                <Text style={{ color: base.textDim, fontSize: 12 }} numberOfLines={1}>{v.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* OT/NT Toggle */}
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.md, marginBottom: spacing.md }}>
        {(['ot', 'nt'] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTestament(t)}>
            <Text style={{
              color: testament === t ? base.gold : base.textMuted,
              fontFamily: 'Cinzel_500Medium', fontSize: 13,
              borderBottomWidth: testament === t ? 2 : 0,
              borderBottomColor: base.gold, paddingBottom: 4,
            }}>
              {t === 'ot' ? 'Old Testament' : 'New Testament'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Book list */}
      {filteredBooks.map((book) => (
        <TouchableOpacity
          key={book.id}
          onPress={() => navigation.navigate('ReadTab', { screen: 'ChapterList', params: { bookId: book.id } })}
          style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: spacing.md, minHeight: MIN_TOUCH_TARGET,
            borderBottomWidth: 1, borderBottomColor: base.border + '40',
          }}
        >
          <Text style={{
            color: book.is_live ? base.text : base.textMuted,
            fontFamily: 'Cinzel_400Regular', fontSize: 14,
          }}>
            {book.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {!!book.is_live && <BadgeChip label="LIVE" color={base.gold} />}
            <Text style={{ color: base.textMuted, fontSize: 11 }}>{book.total_chapters} ch</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Footer */}
      <View style={{ alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg }}>
        <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 9, letterSpacing: 0.5 }}>
          SCRIPTURE DEEP DIVE
        </Text>
      </View>
    </ScrollView>
  );
}
