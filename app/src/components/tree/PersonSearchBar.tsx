/**
 * PersonSearchBar — Search input for finding people in the tree.
 */

import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, TouchableOpacity, FlatList } from 'react-native';
import { base, spacing, radii, eras, MIN_TOUCH_TARGET, fontFamily } from '../../theme';
import type { Person } from '../../types';

interface Props {
  people: Person[];
  onSelect: (personId: string) => void;
}

export function PersonSearchBar({ people, onSelect }: Props) {
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
    <View style={{ paddingHorizontal: spacing.md, zIndex: 10 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search people..."
          accessibilityLabel="Search people"
        placeholderTextColor={base.textMuted}
        style={{
          backgroundColor: base.bgElevated, color: base.text,
          fontFamily: fontFamily.ui, fontSize: 13,
          borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
          borderWidth: 1, borderColor: base.border,
        }}
      />
      {results.length > 0 && (
        <View style={{
          position: 'absolute', top: 36, left: spacing.md, right: spacing.md,
          backgroundColor: base.bgElevated, borderWidth: 1, borderColor: base.border,
          borderRadius: radii.md, maxHeight: 300,
        }}>
          {results.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => handleSelect(p.id)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
                paddingHorizontal: spacing.md, minHeight: MIN_TOUCH_TARGET,
                borderBottomWidth: 1, borderBottomColor: base.border + '40',
              }}
            >
              <View style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: p.era ? (eras[p.era] ?? base.textMuted) : base.textMuted,
              }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: base.text, fontFamily: fontFamily.uiMedium, fontSize: 13 }}>
                  {p.name}
                </Text>
                <Text style={{ color: base.textMuted, fontSize: 10 }} numberOfLines={1}>
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
