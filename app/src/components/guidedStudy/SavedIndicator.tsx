/**
 * components/guidedStudy/SavedIndicator.tsx — Quiet "Saved" affordance
 * (#1836). Appears only AFTER a persist actually succeeds (the parent
 * bumps `savedTick` in the save promise's resolution — never
 * optimistically), fades in/out, and renders statically under the OS
 * reduce-motion setting.
 */
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { fontFamily, spacing, useTheme } from '../../theme';

const HOLD_MS = 1400;

interface Props {
  /** Increment after each successful persist; 0 = nothing saved yet. */
  savedTick: number;
}

export function SavedIndicator({ savedTick }: Props) {
  const { base } = useTheme();
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(0));
  const [visible, setVisible] = useState(false);

  // Render-phase adjustment (React's derive-state-from-props pattern):
  // a new tick makes the indicator visible without an effect round-trip.
  const [seenTick, setSeenTick] = useState(savedTick);
  if (savedTick !== seenTick) {
    setSeenTick(savedTick);
    if (savedTick > 0) setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;

    if (reducedMotion) {
      // Static: show, hold, hide — no fade.
      opacity.setValue(1);
      const timer = setTimeout(() => setVisible(false), HOLD_MS);
      return () => clearTimeout(timer);
    }

    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(HOLD_MS),
      Animated.timing(opacity, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => {
      if (finished) setVisible(false);
    });
    return () => anim.stop();
  }, [visible, savedTick, reducedMotion, opacity]);

  if (!visible) return null;

  return (
    <Animated.Text
      accessibilityLiveRegion="polite"
      style={[styles.text, { color: base.textMuted, opacity: reducedMotion ? 1 : opacity }]}
    >
      Saved
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    letterSpacing: 0.4,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
