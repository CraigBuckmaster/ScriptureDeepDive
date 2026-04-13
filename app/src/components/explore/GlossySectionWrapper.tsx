/**
 * GlossySectionWrapper — Specular highlight + ambient glow treatment for sections.
 *
 * Combines two effects for a premium "glossy" feel:
 *   1. Specular highlight: bright gold line at top that fades left-to-right
 *   2. Ambient glow: soft radial-ish glow from the header area
 *
 * Both effects are approximated with layered Views (no expo-linear-gradient dependency).
 * Intensity decreases with sectionIndex to create depth as user scrolls.
 *
 * Part of Glorify polish (#1280 follow-up).
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface Props {
  children: React.ReactNode;
  /** Section index (0-based) — used to decrease intensity as you scroll down */
  sectionIndex?: number;
  /** Override container style */
  style?: ViewStyle;
}

/** Intensity multipliers by section index (fades as you scroll) */
const INTENSITY_BY_INDEX = [1.0, 0.85, 0.7, 0.55, 0.45, 0.35, 0.3];

export function GlossySectionWrapper({ children, sectionIndex = 0, style }: Props) {
  const { base } = useTheme();
  
  // Clamp index and get intensity multiplier
  const idx = Math.min(sectionIndex, INTENSITY_BY_INDEX.length - 1);
  const intensity = INTENSITY_BY_INDEX[idx];
  
  // Color values for specular highlight (bright warm gold)
  const specularBright = `rgba(255, 235, 180, ${(0.4 * intensity).toFixed(2)})`;
  const specularMid = `rgba(255, 235, 180, ${(0.2 * intensity).toFixed(2)})`;
  const specularFade = 'rgba(255, 235, 180, 0)';
  
  // Color values for ambient glow (softer gold)
  const glowStrong = `rgba(255, 235, 180, ${(0.12 * intensity).toFixed(2)})`;
  const glowMid = `rgba(255, 235, 180, ${(0.06 * intensity).toFixed(2)})`;
  const glowFade = 'rgba(191, 160, 80, 0)';

  return (
    <View style={[styles.container, style]}>
      {/* ── Ambient glow layers (behind content) ─── */}
      <View style={styles.glowContainer} pointerEvents="none">
        {/* Outer glow - largest, faintest */}
        <View style={[styles.glowLayer, styles.glowOuter, { backgroundColor: glowFade }]}>
          <View style={[styles.glowInner, { backgroundColor: glowMid }]} />
        </View>
        {/* Inner glow - smaller, brighter */}
        <View style={[styles.glowLayer, styles.glowInner2, { backgroundColor: glowStrong }]} />
      </View>
      
      {/* ── Specular highlight line at top ─── */}
      <View style={styles.specularContainer} pointerEvents="none">
        <View style={[styles.specularSegment, styles.specularLeft, { backgroundColor: specularBright }]} />
        <View style={[styles.specularSegment, styles.specularMid, { backgroundColor: specularMid }]} />
        <View style={[styles.specularSegment, styles.specularRight, { backgroundColor: specularFade }]} />
      </View>
      
      {/* ── Actual content ─── */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  
  // ── Ambient glow ───
  glowContainer: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    height: 60,
    overflow: 'hidden',
  },
  glowLayer: {
    position: 'absolute',
    borderRadius: 100,
  },
  glowOuter: {
    top: 0,
    left: 10,
    width: 140,
    height: 50,
  },
  glowInner: {
    width: '70%',
    height: '70%',
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 8,
  },
  glowInner2: {
    top: 5,
    left: 20,
    width: 100,
    height: 35,
  },
  
  // ── Specular highlight ───
  specularContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    flexDirection: 'row',
    borderRadius: 1,
  },
  specularSegment: {
    height: 1.5,
  },
  specularLeft: {
    flex: 2,
  },
  specularMid: {
    flex: 3,
  },
  specularRight: {
    flex: 5,
  },
  
  // ── Content ───
  content: {
    paddingTop: 4,
  },
});
