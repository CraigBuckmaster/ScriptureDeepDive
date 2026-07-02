/**
 * components/study/ChapterTrail.tsx — Chapter trail ticks for study
 * plans (#1832/#1833): done = filled gold, current = hollow with a
 * soft glow (static under OS reduce-motion), upcoming = hollow dim.
 * Decorative — hidden from screen readers by the consumers.
 */
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTheme } from '../../theme';
import type { StudyPlanItem } from '../../types';

function TrailTick({ state, glow }: { state: 'done' | 'current' | 'upcoming'; glow: boolean }) {
  const { base } = useTheme();
  const [pulse] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    if (state !== 'current' || !glow) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, glow, pulse]);

  if (state === 'done') {
    return <View style={[styles.tick, { backgroundColor: base.gold }]} />;
  }
  if (state === 'current') {
    return (
      <View style={styles.currentWrap}>
        <Animated.View
          style={[styles.halo, { borderColor: base.gold, opacity: glow ? pulse : 0.55 }]}
        />
        <View style={[styles.tick, styles.hollow, { borderColor: base.gold }]} />
      </View>
    );
  }
  return <View style={[styles.tick, styles.hollow, { borderColor: base.border }]} />;
}

export function ChapterTrail({ items }: { items: StudyPlanItem[] }) {
  const reducedMotion = useReducedMotion();
  const currentItemNum = items.find((i) => i.completed_at == null)?.item_num ?? null;

  return (
    <View
      style={styles.trail}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {items.map((item) => (
        <TrailTick
          key={item.item_num}
          state={
            item.completed_at != null
              ? 'done'
              : item.item_num === currentItemNum
                ? 'current'
                : 'upcoming'
          }
          glow={!reducedMotion}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  trail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tick: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  hollow: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  currentWrap: {
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
});
