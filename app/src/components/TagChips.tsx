/**
 * TagChips — Reusable tag chip row with add/remove functionality.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { base, spacing, radii, fontFamily } from '../theme';

interface Props {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  editable?: boolean;
}

export function TagChips({ tags, onTagsChange, editable = true }: Props) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmed = inputValue.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <View key={tag} style={styles.chip}>
          <Text style={styles.chipText}>#{tag}</Text>
          {editable && (
            <TouchableOpacity
              onPress={() => handleRemoveTag(tag)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={12} color={base.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {editable && !showInput && (
        <TouchableOpacity style={styles.addButton} onPress={() => setShowInput(true)}>
          <Plus size={12} color={base.gold} />
          <Text style={styles.addText}>tag</Text>
        </TouchableOpacity>
      )}

      {showInput && (
        <View style={styles.inputWrap}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleAddTag}
            onBlur={() => { if (!inputValue.trim()) setShowInput(false); }}
            placeholder="tag name"
            placeholderTextColor={base.textMuted}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            autoCapitalize="none"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: base.bgElevated,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: base.border,
  },
  chipText: {
    color: base.goldDim,
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  addText: {
    color: base.gold,
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  inputWrap: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: base.gold,
    paddingHorizontal: 6,
  },
  input: {
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    minWidth: 60,
    height: 24,
    padding: 0,
  },
});
