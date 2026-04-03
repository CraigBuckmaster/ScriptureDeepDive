/**
 * DictionaryCrossLink — "Also in Companion Study" banner card.
 *
 * Shows when a dictionary entry has cross-links to richer CS features
 * (Person Bio, Map Place, Word Study, Concept). Gold-bordered card with
 * one row per active link.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  personId?: string | null;
  placeId?: string | null;
  wordStudyId?: string | null;
  conceptId?: string | null;
  onPersonPress?: (id: string) => void;
  onPlacePress?: (id: string) => void;
  onWordStudyPress?: (id: string) => void;
  onConceptPress?: (id: string) => void;
}

interface LinkRow {
  icon: string;
  label: string;
  onPress: () => void;
}

export function DictionaryCrossLink({
  personId,
  placeId,
  wordStudyId,
  conceptId,
  onPersonPress,
  onPlacePress,
  onWordStudyPress,
  onConceptPress,
}: Props) {
  const { base } = useTheme();

  const links: LinkRow[] = [];
  if (personId && onPersonPress) {
    links.push({ icon: '\u{1F464}', label: 'See Person Bio', onPress: () => onPersonPress(personId) });
  }
  if (placeId && onPlacePress) {
    links.push({ icon: '\u{1F4CD}', label: 'See on Map', onPress: () => onPlacePress(placeId) });
  }
  if (wordStudyId && onWordStudyPress) {
    links.push({ icon: '\u{1F4D6}', label: 'See Word Study', onPress: () => onWordStudyPress(wordStudyId) });
  }
  if (conceptId && onConceptPress) {
    links.push({ icon: '\u{1F4A1}', label: 'See Concept Journey', onPress: () => onConceptPress(conceptId) });
  }

  if (links.length === 0) return null;

  return (
    <View style={[styles.card, { borderColor: base.gold + '40', backgroundColor: base.gold + '08' }]}>
      <Text style={[styles.header, { color: base.textDim }]}>Also in Companion Study</Text>
      {links.map((link) => (
        <TouchableOpacity
          key={link.label}
          onPress={link.onPress}
          activeOpacity={0.6}
          style={styles.row}
        >
          <Text style={styles.icon}>{link.icon}</Text>
          <Text style={[styles.label, { color: base.gold }]}>{link.label}</Text>
          <Text style={[styles.chevron, { color: base.textMuted }]}>{'\u203A'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  icon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    flex: 1,
  },
  chevron: {
    fontSize: 18,
  },
});
