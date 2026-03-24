/**
 * ScholarBioScreen — Full scholar bio with sections, scope, other scholars grid.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getScholar, getAllScholars } from '../db/content';
import { getScholarColor, base, spacing, radii } from '../theme';
import type { Scholar } from '../types';

export default function ScholarBioScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { scholarId } = route.params ?? {};
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [bio, setBio] = useState<any>(null);
  const [allScholars, setAllScholars] = useState<Scholar[]>([]);

  useEffect(() => {
    if (scholarId) {
      getScholar(scholarId).then((s) => {
        setScholar(s);
        if (s?.bio_json) try { setBio(JSON.parse(s.bio_json)); } catch {}
      });
    }
    getAllScholars().then(setAllScholars);
  }, [scholarId]);

  const otherScholars = useMemo(
    () => allScholars.filter((s) => s.id !== scholarId).slice(0, 12),
    [allScholars, scholarId]
  );

  if (!scholar) return <View style={{ flex: 1, backgroundColor: base.bg }} />;

  const color = getScholarColor(scholar.id);
  let scope: string[] | string = 'All books';
  try {
    const parsed = JSON.parse(scholar.scope_json);
    if (Array.isArray(parsed)) scope = parsed;
  } catch {}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {/* Header */}
        <Text style={{ color, fontFamily: 'Cinzel_600SemiBold', fontSize: 24 }}>
          {scholar.name}
        </Text>
        {scholar.tradition && (
          <Text style={{ color: base.textDim, fontFamily: 'SourceSans3_400Regular', fontSize: 14, marginTop: 4 }}>
            {scholar.tradition}
          </Text>
        )}
        {bio?.eyebrow && (
          <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 13, marginTop: 4 }}>
            {bio.eyebrow}
          </Text>
        )}

        <View style={{ height: 1, backgroundColor: base.border, marginVertical: spacing.md }} />

        {/* Bio sections */}
        {bio?.sections?.map((section: any, i: number) => (
          <View key={i} style={{ marginBottom: spacing.lg }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 13, marginBottom: spacing.sm }}>
              {section.title}
            </Text>
            <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 15, lineHeight: 24 }}>
              {section.body}
            </Text>
          </View>
        ))}

        {/* Appears In */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{ color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 13, marginBottom: spacing.sm }}>
            Appears In
          </Text>
          {typeof scope === 'string' ? (
            <Text style={{ color: base.textDim, fontFamily: 'SourceSans3_400Regular', fontSize: 14 }}>{scope}</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {(scope as string[]).map((bookId) => (
                <TouchableOpacity
                  key={bookId}
                  onPress={() => navigation.navigate('ReadTab', { screen: 'ChapterList', params: { bookId } })}
                  style={{
                    backgroundColor: color + '1A', borderWidth: 1, borderColor: color + '40',
                    borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3,
                  }}
                >
                  <Text style={{ color, fontFamily: 'SourceSans3_500Medium', fontSize: 11 }}>
                    {bookId}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Other Scholars */}
        <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 10, letterSpacing: 0.5, marginBottom: spacing.sm }}>
          OTHER SCHOLARS
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {otherScholars.map((s) => {
            const sColor = getScholarColor(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => navigation.setParams({ scholarId: s.id })}
                style={{
                  width: '48%', backgroundColor: sColor + '14',
                  borderLeftWidth: 3, borderLeftColor: sColor,
                  borderRadius: radii.md, padding: spacing.sm,
                }}
              >
                <Text style={{ color: sColor, fontFamily: 'Cinzel_400Regular', fontSize: 11 }}>
                  {s.name}
                </Text>
                {s.tradition && (
                  <Text style={{ color: base.textMuted, fontSize: 9 }}>{s.tradition}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
