/**
 * BookListScreen — Full library with OT/NT sections and tradition groupings.
 */

import React from 'react';
import { View, Text, TouchableOpacity, SectionList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBooks } from '../hooks/useBooks';
import { BadgeChip } from '../components/BadgeChip';
import { base, spacing, MIN_TOUCH_TARGET } from '../theme';
import type { Book } from '../types';

const OT_GROUPS = [
  { title: 'Law', range: [0, 5] },
  { title: 'History', range: [5, 17] },
  { title: 'Poetry & Wisdom', range: [17, 22] },
  { title: 'Major Prophets', range: [22, 27] },
  { title: 'Minor Prophets', range: [27, 39] },
];

const NT_GROUPS = [
  { title: 'Gospels & Acts', range: [39, 44] },
  { title: 'Pauline Epistles', range: [44, 57] },
  { title: 'General Epistles', range: [57, 65] },
  { title: 'Apocalypse', range: [65, 66] },
];

export default function BookListScreen() {
  const navigation = useNavigation<any>();
  const { books } = useBooks();

  const sections = [...OT_GROUPS, ...NT_GROUPS]
    .map((g) => ({
      title: g.title,
      data: books.slice(g.range[0], g.range[1]),
    }))
    .filter((s) => s.data.length > 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <Text style={{
        color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22,
        paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md,
      }}>
        Library
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={{ backgroundColor: base.bg, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs }}>
            <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 10, letterSpacing: 0.5 }}>
              {section.title.toUpperCase()}
            </Text>
          </View>
        )}
        renderItem={({ item: book }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ChapterList', { bookId: book.id })}
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
        )}
      />
    </SafeAreaView>
  );
}
