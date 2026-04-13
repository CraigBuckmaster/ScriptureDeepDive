/**
 * GlossySectionWrapper — Specular highlight treatment for sections.
 *
 * Adds a center-bright gold line at the top with subtle underglow,
 * simulating light hitting the edge of a shelf or panel.
 *
 * Approximated with layered Views (no expo-linear-gradient dependency).
 * Intensity decreases with sectionIndex to create depth as user scrolls.
 *
 * Part of Glorify polish (#1280 follow-up).
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

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
  // Clamp index and get intensity multiplier
  const idx = Math.min(sectionIndex, INTENSITY_BY_INDEX.length - 1);
  const intensity = INTENSITY_BY_INDEX[idx];
  
  // Center-bright specular: edges fade → mid brighter → center brightest
  const specularEdge = `rgba(255, 235, 180, ${(0.1 * intensity).toFixed(2)})`;
  const specularMid = `rgba(255, 235, 180, ${(0.3 * intensity).toFixed(2)})`;
  const specularCenter = `rgba(255, 235, 180, ${(0.65 * intensity).toFixed(2)})`;
  const haloColor = `rgba(255, 235, 180, ${(0.04 * intensity).toFixed(2)})`;

  return (
    <View style={[styles.container, style]}>
      {/* ── Subtle underglow halo ─── */}
      <View style={[styles.halo, { backgroundColor: haloColor }]} pointerEvents="none" />
      
      {/* ── Specular highlight line (center-bright) ─── */}
      <View style={styles.specularContainer} pointerEvents="none">
        <View style={[styles.segment, styles.segmentEdge, { backgroundColor: specularEdge }]} />
        <View style={[styles.segment, styles.segmentMid, { backgroundColor: specularMid }]} />
        <View style={[styles.segment, styles.segmentCenter, { backgroundColor: specularCenter }]} />
        <View style={[styles.segment, styles.segmentMid, { backgroundColor: specularMid }]} />
        <View style={[styles.segment, styles.segmentEdge, { backgroundColor: specularEdge }]} />
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
  
  // ── Underglow halo ───
  halo: {
    position: 'absolute',
    top: 2,
    left: '15%',
    right: '15%',
    height: 6,
    borderRadius: 3,
  },
  
  // ── Specular highlight (center-bright) ───
  specularContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
  },
  segment: {
    height: 2,
  },
  segmentEdge: {
    flex: 1,
  },
  segmentMid: {
    flex: 1.5,
  },
  segmentCenter: {
    flex: 2,
  },
  
  // ── Content ───
  content: {
    paddingTop: 4,
  },
});
