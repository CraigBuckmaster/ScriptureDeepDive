/**
 * ChapterListScreen — Chapter grid for a selected book.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getBook } from '../db/content';
import { base, spacing, radii, MIN_TOUCH_TARGET } from '../theme';
import type { Book } from '../types';

export default function ChapterListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookId } = route.params ?? {};
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    if (bookId) getBook(bookId).then(setBook);
  }, [bookId]);

  if (!book) return <View style={{ flex: 1, backgroundColor: base.bg }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {/* Header */}
        <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, marginBottom: spacing.xs }}>
          {book.name}
        </Text>
        <Text style={{ color: base.textMuted, fontSize: 12, fontFamily: 'SourceSans3_400Regular', marginBottom: spacing.md }}>
          {book.total_chapters} chapters{book.is_live ? ' · Live' : ''}
        </Text>

        {/* About This Book */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BookIntro', { bookId })}
          style={{ marginBottom: spacing.lg }}
        >
          <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 13 }}>
            About This Book →
          </Text>
        </TouchableOpacity>

        {/* Chapter grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => (
            <TouchableOpacity
              key={ch}
              onPress={() => book.is_live && navigation.navigate('Chapter', { bookId, chapterNum: ch })}
              disabled={!book.is_live}
              style={{
                width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET,
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: base.bgElevated, borderRadius: radii.sm,
              }}
            >
              <Text style={{
                color: book.is_live ? base.gold : base.textMuted + '40',
                fontFamily: 'SourceSans3_500Medium', fontSize: 14,
              }}>
                {ch}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
