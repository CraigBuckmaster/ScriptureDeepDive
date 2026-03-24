/**
 * ScholarBrowseScreen — Grid of 43 scholar cards, filterable by tradition.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useScholars } from '../hooks/useScholars';
import { getScholarColor, base, spacing, radii } from '../theme';

export default function ScholarBrowseScreen() {
  const navigation = useNavigation<any>();
  const { scholars } = useScholars();
  const [search, setSearch] = useState('');
  const [tradition, setTradition] = useState<string>('all');

  const traditions = useMemo(() => {
    const set = new Set<string>();
    for (const s of scholars) {
      if (s.tradition) set.add(s.tradition);
    }
    return ['all', ...Array.from(set).sort()];
  }, [scholars]);

  const filtered = useMemo(() => {
    let list = scholars;
    if (tradition !== 'all') list = list.filter((s) => s.tradition === tradition);
    if (search.length >= 2) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [scholars, tradition, search]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg }}>
        <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, marginBottom: spacing.md }}>
          Scholars
        </Text>

        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Search scholars..."
          placeholderTextColor={base.textMuted}
          style={{
            backgroundColor: base.bgElevated, color: base.text,
            fontFamily: 'SourceSans3_400Regular', fontSize: 14,
            borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
            borderWidth: 1, borderColor: base.border, marginBottom: spacing.sm,
          }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs, marginBottom: spacing.md }}>
          {traditions.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTradition(t)}>
              <Text style={{
                color: tradition === t ? base.gold : base.textMuted,
                fontFamily: 'SourceSans3_500Medium', fontSize: 11,
                borderBottomWidth: tradition === t ? 2 : 0,
                borderBottomColor: base.gold, paddingBottom: 4, paddingHorizontal: 4,
              }}>
                {t === 'all' ? 'All' : t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}
        columnWrapperStyle={{ gap: spacing.sm }}
        renderItem={({ item: s }) => {
          const color = getScholarColor(s.id);
          let scope = 'All books';
          try {
            const parsed = JSON.parse(s.scope_json);
            if (Array.isArray(parsed)) scope = `${parsed.length} books`;
          } catch {}

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('ScholarBio', { scholarId: s.id })}
              style={{
                flex: 1, backgroundColor: color + '14', borderLeftWidth: 3,
                borderLeftColor: color, borderRadius: radii.md, padding: spacing.sm,
              }}
            >
              <Text style={{ color, fontFamily: 'Cinzel_500Medium', fontSize: 12 }}>
                {s.name}
              </Text>
              {s.tradition && (
                <Text style={{ color: base.textMuted, fontFamily: 'SourceSans3_400Regular', fontSize: 10, marginTop: 2 }}>
                  {s.tradition}
                </Text>
              )}
              <Text style={{ color: base.textDim, fontFamily: 'SourceSans3_400Regular', fontSize: 10, marginTop: 2 }}>
                {scope}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
