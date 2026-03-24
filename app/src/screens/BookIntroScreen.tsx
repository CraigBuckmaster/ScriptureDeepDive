/**
 * BookIntroScreen — Full book introduction page.
 */

import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBookIntro } from '../hooks/useBookIntro';
import { base, spacing } from '../theme';

export default function BookIntroScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookId } = route.params ?? {};
  const { intro, isLoading } = useBookIntro(bookId);

  if (isLoading || !intro) {
    return <View style={{ flex: 1, backgroundColor: base.bg }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: base.gold, fontSize: 14, marginBottom: spacing.md }}>← Back</Text>
        </TouchableOpacity>

        {intro.title && (
          <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, marginBottom: spacing.md }}>
            {intro.title}
          </Text>
        )}

        {intro.sections?.map((section: any, i: number) => (
          <View key={i} style={{ marginBottom: spacing.lg }}>
            {section.heading && (
              <Text style={{ color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 14, marginBottom: spacing.sm }}>
                {section.heading}
              </Text>
            )}
            {section.body && (
              <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 15, lineHeight: 24 }}>
                {typeof section.body === 'string' ? section.body : JSON.stringify(section.body)}
              </Text>
            )}
          </View>
        ))}

        {!intro.sections && intro.text && (
          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 15, lineHeight: 24 }}>
            {intro.text}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
