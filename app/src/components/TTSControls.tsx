/**
 * TTSControls — Play/pause, skip, speed control bar for TTS.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../theme';

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5];

interface Props {
  isPlaying: boolean;
  currentVerse: number;
  totalVerses: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  onSetSpeed: (s: number) => void;
}

export function TTSControls({
  isPlaying, currentVerse, totalVerses, speed,
  onPlay, onPause, onStop, onSkipNext, onSkipPrev, onSetSpeed,
}: Props) {
  const { base } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: base.bgElevated, borderTopColor: base.border }]}>
      {/* Verse counter */}
      <Text style={[styles.counter, { color: base.textMuted }]}>
        Verse {currentVerse + 1} of {totalVerses}
      </Text>

      {/* Controls row */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={onSkipPrev} style={styles.skipButton}>
          <Text style={[styles.skipIcon, { color: base.gold }]}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isPlaying ? onPause : onPlay}
          style={[styles.playButton, { backgroundColor: base.gold + '30' }]}
        >
          <Text style={[styles.playIcon, { color: base.gold }]}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkipNext} style={styles.skipButton}>
          <Text style={[styles.skipIcon, { color: base.gold }]}>⏭</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onStop} style={styles.skipButton}>
          <Text style={[styles.stopIcon, { color: base.textMuted }]}>⏹</Text>
        </TouchableOpacity>
      </View>

      {/* Speed selector */}
      <View style={styles.speedRow}>
        {SPEEDS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => onSetSpeed(s)}
            style={[styles.speedPill, speed === s && { backgroundColor: base.gold + '30' }]}
          >
            <Text style={[styles.speedLabel, { color: base.textMuted }, speed === s && { color: base.gold }]}>
              {s}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  counter: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  skipButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipIcon: {
    fontSize: 18,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
  },
  stopIcon: {
    fontSize: 16,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  speedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  speedLabel: {
    fontSize: 10,
    fontFamily: fontFamily.uiMedium,
  },
});
