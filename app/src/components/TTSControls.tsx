/**
 * TTSControls — Play/pause, skip, speed control bar for TTS.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { base, spacing, radii, MIN_TOUCH_TARGET } from '../theme';

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
  return (
    <View style={{
      backgroundColor: base.bgElevated, borderTopWidth: 1, borderTopColor: base.border,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    }}>
      {/* Verse counter */}
      <Text style={{ color: base.textMuted, fontFamily: 'SourceSans3_400Regular', fontSize: 10, textAlign: 'center', marginBottom: 4 }}>
        Verse {currentVerse + 1} of {totalVerses}
      </Text>

      {/* Controls row */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.md }}>
        <TouchableOpacity onPress={onSkipPrev} style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: base.gold, fontSize: 18 }}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isPlaying ? onPause : onPlay}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: base.gold + '30', justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: base.gold, fontSize: 20 }}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkipNext} style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: base.gold, fontSize: 18 }}>⏭</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onStop} style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: base.textMuted, fontSize: 16 }}>⏹</Text>
        </TouchableOpacity>
      </View>

      {/* Speed selector */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 }}>
        {SPEEDS.map((s) => (
          <TouchableOpacity
            key={s} onPress={() => onSetSpeed(s)}
            style={{
              paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill,
              backgroundColor: speed === s ? base.gold + '30' : 'transparent',
            }}
          >
            <Text style={{ color: speed === s ? base.gold : base.textMuted, fontSize: 10, fontFamily: 'SourceSans3_500Medium' }}>
              {s}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
