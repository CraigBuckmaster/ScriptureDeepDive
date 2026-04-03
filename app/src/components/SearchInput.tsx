/**
 * SearchInput — Reusable search bar with clear (×) button.
 *
 * Shows a Lucide X icon when text is present. Tap clears the input.
 * Consistent styling across all search contexts.
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, type TextInputProps } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';

interface Props extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  /** Optional compact mode with smaller padding (e.g. inside overlays) */
  compact?: boolean;
}

export function SearchInput({ value, onChangeText, compact, ...rest }: Props) {
  const { base } = useTheme();
  return (
    <View style={[styles.wrapper, { backgroundColor: base.bgElevated, borderColor: base.border }, compact && styles.wrapperCompact]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={base.textMuted}
        style={[styles.input, { color: base.text }, compact && styles.inputCompact]}
        {...rest}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clearButton}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={16} color={base.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
  },
  wrapperCompact: {
    borderRadius: radii.sm,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputCompact: {
    fontSize: 13,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
