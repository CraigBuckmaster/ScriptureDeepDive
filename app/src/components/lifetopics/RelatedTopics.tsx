/**
 * RelatedTopics — Horizontal scrollable chips for related life topics.
 */

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { BadgeChip } from '../BadgeChip';
import { spacing } from '../../theme';
import type { LifeTopic } from '../../types';

interface Props {
  topics: LifeTopic[];
  onPress: (topicId: string) => void;
}

function RelatedTopics({ topics, onPress }: Props) {
  if (topics.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {topics.map((t) => (
        <BadgeChip key={t.id} label={t.title} onPress={() => onPress(t.id)} />
      ))}
    </ScrollView>
  );
}

export default React.memo(RelatedTopics);

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
});
