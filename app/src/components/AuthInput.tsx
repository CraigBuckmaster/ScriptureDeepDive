/**
 * AuthInput — Styled TextInput used by Login / SignUp / ForgotPassword.
 *
 * Card #1364 (UI polish phase 7): consolidates the auth-input styling
 * (44px height, radii.md, bgElevated background) and adds a gold focus
 * border so the active field is clearly highlighted.
 *
 * Inline border color transitions:
 *   - Default:  base.gold + '30'  (25% gold — softer than the generic border)
 *   - Focused:  base.gold          (full gold accent)
 */

import React, { useCallback, useState } from 'react';
import { TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

type Props = Omit<TextInputProps, 'style'>;

type FocusHandler = NonNullable<TextInputProps['onFocus']>;
type BlurHandler = NonNullable<TextInputProps['onBlur']>;

export function AuthInput({ onFocus, onBlur, ...rest }: Props) {
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
    <TextInput
      {...rest}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholderTextColor={rest.placeholderTextColor ?? base.textMuted}
      style={[
        styles.input,
        {
          backgroundColor: base.bgElevated,
          borderColor: focused ? base.gold : base.gold + '30',
          color: base.text,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.ui,
    fontSize: 15,
  },
});
