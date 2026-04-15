/**
 * RelatedLifeTopics — Horizontal row of tappable BadgeChip components
 * linking from a chapter view to related life topic detail screens.
 *
 * Parses the `related_life_topics_json` field from the Chapter entity
 * and renders each topic as a navigable chip.
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, fontFamily } from '../theme';
import type { ScreenNavProp } from '../navigation/types';
import { BadgeChip } from './BadgeChip';

interface RelatedLifeTopic {
  topic_id: string;
  title: string;
}

interface Props {
  relatedLifeTopicsJson?: string | null;
}

function RelatedLifeTopics({ relatedLifeTopicsJson }: Props) {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'LifeTopicDetail'>>();

  const topics = useMemo<RelatedLifeTopic[]>(() => {
    if (!relatedLifeTopicsJson) return [];
    try {
      const parsed = JSON.parse(relatedLifeTopicsJson);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item: unknown): item is RelatedLifeTopic =>
          !!item && typeof item === 'object'
          && typeof (item as RelatedLifeTopic).topic_id === 'string'
          && typeof (item as RelatedLifeTopic).title === 'string',
      );
    } catch {
      return [];
    }
  }, [relatedLifeTopicsJson]);

  if (topics.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.heading, { color: base.textDim }]}>Related Topics</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {topics.map((t) => (
          <BadgeChip
            key={t.topic_id}
            label={t.title}
            onPress={() => navigation.navigate('LifeTopicDetail', { topicId: t.topic_id })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  heading: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  chipRow: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
});

export default React.memo(RelatedLifeTopics);
