/**
 * components/study/ContinueHero.tsx — The Study hub's "Continue" hero
 * (#1832): active plan title in Cinzel, chapter trail ticks (done =
 * filled gold, current = hollow with a soft glow, upcoming = hollow
 * dim), paused step + minutes, and a Resume action.
 *
 * The current-tick glow is decorative; it renders statically when the
 * OS reduce-motion setting is on.
 */
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Play } from 'lucide-react-native';
import { formatChapterRef, getGuidedStudyStepLabel } from '../../services/guidedStudy';
import type { ResumeTarget } from '../../services/study';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { StudyPlan, StudyPlanItem } from '../../types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Props {
  plan: StudyPlan;
  items: StudyPlanItem[];
  target: ResumeTarget;
  estimateMin: number | null;
  onResume: () => void;
}

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
          style={[
            styles.halo,
            { borderColor: base.gold, opacity: glow ? pulse : 0.55 },
          ]}
        />
        <View style={[styles.tick, styles.hollow, { borderColor: base.gold }]} />
      </View>
    );
  }
  return <View style={[styles.tick, styles.hollow, { borderColor: base.border }]} />;
}

export function ContinueHero({ plan, items, target, estimateMin, onResume }: Props) {
  const { base } = useTheme();
  const reducedMotion = useReducedMotion();

  const currentItemNum = items.find((i) => i.completed_at == null)?.item_num ?? null;
  const chapterRef = formatChapterRef(`${target.bookId}_${target.chapterNum}`);

  const metaParts: string[] = [chapterRef];
  if (target.step) metaParts.push(`Paused at ${getGuidedStudyStepLabel(target.step)}`);
  if (estimateMin != null) metaParts.push(`~${estimateMin} min`);

  return (
    <View
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}
    >
      <Text style={[styles.kicker, { color: base.textMuted }]}>CONTINUE</Text>
      <Text style={[styles.title, { color: base.text }]} accessibilityRole="header">
        {plan.title}
      </Text>

      <View style={styles.trail} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
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

      <Text style={[styles.meta, { color: base.textMuted }]}>{metaParts.join(' · ')}</Text>

      <TouchableOpacity
        onPress={onResume}
        activeOpacity={0.72}
        style={[styles.resumeButton, { backgroundColor: base.gold }]}
        accessibilityRole="button"
        accessibilityLabel={`Resume ${plan.title} at ${chapterRef}`}
      >
        <Play size={16} color={base.bg} />
        <Text style={[styles.resumeLabel, { color: base.bg }]}>Resume</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  kicker: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 20,
    // No numberOfLines on purpose — Dynamic Type must never truncate
    // the hero title (a11y acceptance criterion, #1832).
  },
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
  meta: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },
  resumeLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
});
