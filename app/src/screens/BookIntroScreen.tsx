/**
 * BookIntroScreen — Full book introduction page.
 */

import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBookIntro } from '../hooks/useBookIntro';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { base, spacing, fontFamily } from '../theme';

export default function BookIntroScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookId } = route.params ?? {};
  const { intro, isLoading } = useBookIntro(bookId);

  if (isLoading || !intro) {
    return (
      <View style={styles.loading}>
        <LoadingSkeleton lines={6} height={16} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={intro.title ?? 'About This Book'}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {intro.sections?.map((section: any, i: number) => (
          <View key={i} style={styles.section}>
            {section.heading && (
              <Text style={styles.sectionHeading}>{section.heading}</Text>
            )}
            {section.body && (
              <Text style={styles.bodyText}>
                {typeof section.body === 'string' ? section.body : JSON.stringify(section.body)}
              </Text>
            )}
          </View>
        ))}

        {!intro.sections && intro.text && (
          <Text style={styles.bodyText}>{intro.text}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: base.bg,
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
  },
});
