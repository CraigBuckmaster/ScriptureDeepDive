/**
 * SearchInput — Reusable search bar with clear (×) button.
 *
 * Shows a Lucide X icon when text is present. Tap clears the input.
 * Consistent styling across all search contexts.
 *
 * Card #1358 (UI polish phase 1):
 *   - Gold focus state (50% gold border + subtle 3% gold background tint)
 *   - Slightly larger vertical padding (10 instead of spacing.sm/8)
 */

import React, { useCallback, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, type TextInputProps } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';

interface Props extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  /** Optional compact mode with smaller padding (e.g. inside overlays) */
  compact?: boolean;
}

/** Gold at 50% opacity for the focus ring. */
const GOLD_FOCUS_BORDER = 'rgba(191, 160, 80, 0.5)';
/** Very subtle gold wash layered on top of bgElevated on focus. */
const GOLD_FOCUS_TINT = 'rgba(191, 160, 80, 0.03)';

type FocusHandler = NonNullable<TextInputProps['onFocus']>;
type BlurHandler = NonNullable<TextInputProps['onBlur']>;

export function SearchInput({ value, onChangeText, compact, onFocus, onBlur, ...rest }: Props) {
  const { base } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback<FocusHandler>((e) => {
    setFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback<BlurHandler>((e) => {
    setFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: base.bgElevated,
          borderColor: focused ? GOLD_FOCUS_BORDER : base.border,
        },
        compact && styles.wrapperCompact,
      ]}
    >
      {/* Subtle gold tint overlay when focused. Kept as a separate layer so
          the theme's bgElevated color underneath stays intact. */}
      {focused && <View pointerEvents="none" style={[styles.focusTint, { backgroundColor: GOLD_FOCUS_TINT }]} />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
    overflow: 'hidden',
  },
  wrapperCompact: {
    borderRadius: radii.sm,
  },
  focusTint: {
    ...StyleSheet.absoluteFillObject,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
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
