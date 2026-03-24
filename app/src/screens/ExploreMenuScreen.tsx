/**
 * ExploreMenuScreen — Grid of 6 feature cards.
 */

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { base, spacing, radii } from '../theme';

const FEATURES = [
  { title: 'People', subtitle: 'Genealogy tree of 211 biblical figures', screen: 'GenealogyTree', icon: '👥' },
  { title: 'Map', subtitle: '71 places across 28 narrative journeys', screen: 'Map', icon: '🗺️' },
  { title: 'Timeline', subtitle: '216 events from Creation to Revelation', screen: 'Timeline', icon: '📅' },
  { title: 'Parallel Passages', subtitle: '45 synoptic comparisons', screen: 'ParallelPassage', icon: '📊' },
  { title: 'Word Studies', subtitle: 'Hebrew & Greek lexicon entries', screen: 'WordStudyBrowse', icon: '📖' },
  { title: 'Scholars', subtitle: '43 commentators across traditions', screen: 'ScholarBrowse', icon: '🎓' },
];

export default function ExploreMenuScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, marginBottom: spacing.lg }}>
          Explore
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {FEATURES.map((f) => (
            <TouchableOpacity
              key={f.screen}
              onPress={() => navigation.navigate(f.screen)}
              activeOpacity={0.7}
              style={{
                width: '48%', backgroundColor: base.bgElevated,
                borderWidth: 1, borderColor: base.border, borderRadius: radii.md,
                padding: spacing.md, minHeight: 100, justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: spacing.xs }}>{f.icon}</Text>
              <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 13 }}>
                {f.title}
              </Text>
              <Text style={{ color: base.textMuted, fontFamily: 'SourceSans3_400Regular', fontSize: 11, marginTop: 2 }}>
                {f.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
