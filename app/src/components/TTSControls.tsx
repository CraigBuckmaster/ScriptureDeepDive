/**
 * TTSControls — Play/pause, skip, speed control bar for TTS.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react-native';
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
      {/* Progress indicator */}
      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { backgroundColor: base.border }]}>
          <View style={[
            styles.progressFill,
            { backgroundColor: base.gold, width: `${((currentVerse + 1) / totalVerses) * 100}%` },
          ]} />
        </View>
        <Text style={[styles.counter, { color: base.textMuted }]}>
          {currentVerse + 1}/{totalVerses}
        </Text>
      </View>

      {/* Transport controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={onSkipPrev} style={styles.controlButton}>
          <SkipBack size={18} color={base.gold} fill={base.gold} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isPlaying ? onPause : onPlay}
          style={[styles.playButton, { backgroundColor: base.gold + '20', borderColor: base.gold + '40' }]}
        >
          {isPlaying
            ? <Pause size={20} color={base.gold} fill={base.gold} />
            : <Play size={20} color={base.gold} fill={base.gold} style={styles.playIcon} />
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkipNext} style={styles.controlButton}>
          <SkipForward size={18} color={base.gold} fill={base.gold} />
        </TouchableOpacity>
      </View>

      {/* Speed selector + close button */}
      <View style={styles.bottomRow}>
        <View style={styles.speedRow}>
          {SPEEDS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => onSetSpeed(s)}
              style={[
                styles.speedPill,
                { borderColor: base.border },
                speed === s && { backgroundColor: base.gold + '25', borderColor: base.gold + '50' },
              ]}
            >
              <Text style={[
                styles.speedLabel,
                { color: base.textMuted },
                speed === s && { color: base.gold },
              ]}>
                {s}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={onStop}
          style={[styles.closeButton, { borderColor: base.border }]}
          accessibilityLabel="Close TTS"
        >
          <X size={16} color={base.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  counter: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    minWidth: 32,
    textAlign: 'right',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },
  speedPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  speedLabel: {
    fontSize: 10,
    fontFamily: fontFamily.uiMedium,
  },
  controlButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    marginLeft: 2,
  },
});
