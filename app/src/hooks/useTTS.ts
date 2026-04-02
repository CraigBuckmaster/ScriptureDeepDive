/**
 * useTTS — Text-to-speech hook wrapping expo-speech.
 * Auto-advances through verses, supports speed control and voice selection.
 *
 * Note: On iOS, AVSpeechSynthesizer always respects the hardware mute
 * switch. This is an Apple platform limitation. The hook shows a one-time
 * tip on first play reminding users to unmute if they can't hear audio.
 *
 * Note: expo-speech has no native pause/resume. "Pause" stops the current
 * utterance and remembers the verse index. "Play" restarts from that verse.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { logger } from '../utils/logger';
import type { Verse } from '../types';

/** Track whether we've shown the silent mode warning this session. */
let silentModeWarningShown = false;

export function useTTS(verses: Verse[], voiceId?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const versesRef = useRef(verses);
  const voiceRef = useRef(voiceId);
  // Guard: when we call Speech.stop(), onDone fires — this flag prevents auto-advance
  const stoppedManually = useRef(false);
  /** Index where the current audio session started (play/resume). */
  const sessionStartIndex = useRef(0);

  useEffect(() => { versesRef.current = verses; }, [verses]);
  useEffect(() => { voiceRef.current = voiceId; }, [voiceId]);

  // Stop on unmount
  useEffect(() => () => {
    stoppedManually.current = true;
    Speech.stop();
  }, []);

  const speakVerse = useCallback((index: number) => {
    const vv = versesRef.current;
    if (index >= vv.length) {
      setIsPlaying(false);
      setCurrentVerse(0);
      return;
    }
    stoppedManually.current = false;
    setCurrentVerse(index);
    // Only announce the verse number at the start of an audio session
    const text = index === sessionStartIndex.current
      ? `Verse ${vv[index].verse_num}. ${vv[index].text}`
      : vv[index].text;
    logger.info('TTS', `Speaking verse ${index + 1}/${vv.length}`);
    Speech.speak(text, {
      language: 'en-US',
      voice: voiceRef.current || undefined,
      pitch: 1.0,
      rate: speed,
      onDone: () => {
        // Only auto-advance if we didn't manually stop
        if (!stoppedManually.current) {
          speakVerse(index + 1);
        }
      },
      onError: (err) => {
        logger.error('TTS', 'Speech error', err);
        setIsPlaying(false);
      },
    });
  }, [speed]);

  const play = useCallback(async () => {
    if (versesRef.current.length === 0) {
      logger.warn('TTS', 'No verses to speak');
      return;
    }
    // Warn about silent mode on iOS (AVSpeechSynthesizer always respects the mute switch)
    if (Platform.OS === 'ios' && !silentModeWarningShown) {
      silentModeWarningShown = true;
      try {
        Alert.alert(
          'Audio Tip',
          'If you can\'t hear the reading, make sure your iPhone\'s mute switch (on the side) is turned off. Text-to-speech uses the phone\'s speaker channel.',
        );
      } catch {
        // Alert may not be available in test environments
      }
    }
    sessionStartIndex.current = currentVerse;
    setIsPlaying(true);
    speakVerse(currentVerse);
  }, [currentVerse, speakVerse]);

  const pause = useCallback(() => {
    stoppedManually.current = true;
    Speech.stop();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    stoppedManually.current = true;
    Speech.stop();
    setIsPlaying(false);
    setCurrentVerse(0);
  }, []);

  const skipNext = useCallback(() => {
    stoppedManually.current = true;
    Speech.stop();
    const next = Math.min(currentVerse + 1, versesRef.current.length - 1);
    sessionStartIndex.current = next;
    speakVerse(next);
  }, [currentVerse, speakVerse]);

  const skipPrev = useCallback(() => {
    stoppedManually.current = true;
    Speech.stop();
    const prev = Math.max(0, currentVerse - 1);
    sessionStartIndex.current = prev;
    speakVerse(prev);
  }, [currentVerse, speakVerse]);

  return { isPlaying, currentVerse, speed, play, pause, stop, skipNext, skipPrev, setSpeed };
}
