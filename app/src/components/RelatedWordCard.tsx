/**
 * RelatedWordCard — Compact tappable card for related lexicon entries.
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  lemma: string;
  transliteration: string;
  gloss: string;
  onPress: () => void;
}

function RelatedWordCard({ lemma, transliteration, gloss, onPress }: Props) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: base.bg, borderColor: base.border }]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Related word: ${transliteration}, ${gloss}`}
    >
      <Text style={[styles.lemma, { color: base.text }]} numberOfLines={1}>{lemma}</Text>
      <Text style={[styles.translit, { color: base.textDim }]} numberOfLines={1}>{transliteration}</Text>
      <Text style={[styles.gloss, { color: base.textMuted }]} numberOfLines={1}>{gloss}</Text>
    </TouchableOpacity>
  );
}

const MemoizedRelatedWordCard = React.memo(RelatedWordCard);
export { MemoizedRelatedWordCard as RelatedWordCard };
export default MemoizedRelatedWordCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.xs,
    width: 80,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lemma: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    textAlign: 'center',
  },
  translit: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },
  gloss: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },
});
