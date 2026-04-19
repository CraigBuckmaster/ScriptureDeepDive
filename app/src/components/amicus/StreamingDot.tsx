/**
 * components/amicus/StreamingDot.tsx — pulsing dot shown while a stream is
 * still emitting tokens.
 */
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export default function StreamingDot(): React.ReactElement {
  const { base } = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityLabel="Amicus is responding"
      style={[styles.dot, { backgroundColor: base.gold, opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
});
