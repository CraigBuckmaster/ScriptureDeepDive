/**
 * PersonSearchBar — Search input for finding people in the tree.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchInput } from '../SearchInput';
import { useTheme, spacing, radii, eras, MIN_TOUCH_TARGET, fontFamily } from '../../theme';
import type { Person } from '../../types';

interface Props {
  people: Person[];
  onSelect: (personId: string) => void;
}

export function PersonSearchBar({ people, onSelect }: Props) {
  const { base } = useTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return people.filter((p) => p.name.toLowerCase().startsWith(q)).slice(0, 8);
  }, [query, people]);

  const handleSelect = (personId: string) => {
    setQuery('');
    onSelect(personId);
  };

  return (
    <View style={styles.wrapper}>
      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search people..."
        compact
      />
      {results.length > 0 && (
        <View style={[styles.dropdown, {
          backgroundColor: base.bgElevated, borderColor: base.border,
        }]}>
          {results.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => handleSelect(p.id)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${p.name}`}
              style={[styles.resultRow, { borderBottomColor: base.border + '40' }]}
            >
              <View style={[styles.eraDot, {
                backgroundColor: p.era ? (eras[p.era] ?? base.textMuted) : base.textMuted,
              }]} />
              <View style={styles.resultInfo}>
                <Text style={[styles.resultName, { color: base.text }]}>
                  {p.name}
                </Text>
                <Text style={[styles.resultRole, { color: base.textMuted }]} numberOfLines={1}>
                  {p.role}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  dropdown: {
    position: 'absolute',
    top: 36,
    left: spacing.md,
    right: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    maxHeight: 300,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    borderBottomWidth: 1,
  },
  eraDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  resultRole: {
    fontSize: 10,
  },
});
