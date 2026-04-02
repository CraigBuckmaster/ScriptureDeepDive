/**
 * useTTS — Text-to-speech hook wrapping expo-speech.
 * Auto-advances through verses, supports speed control and voice selection.
 *
 * Note: expo-speech has no native pause/resume. "Pause" stops the current
 * utterance and remembers the verse index. "Play" restarts from that verse.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { logger } from '../utils/logger';
import type { Verse } from '../types';

export function useTTS(verses: Verse[], voiceId?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const versesRef = useRef(verses);
  const voiceRef = useRef(voiceId);
  // Guard: when we call Speech.stop(), onDone fires — this flag prevents auto-advance
  const stoppedManually = useRef(false);

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
    const text = `Verse ${vv[index].verse_num}. ${vv[index].text}`;
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

  const play = useCallback(() => {
    if (versesRef.current.length === 0) {
      logger.warn('TTS', 'No verses to speak');
      return;
    }
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
    speakVerse(next);
  }, [currentVerse, speakVerse]);

  const skipPrev = useCallback(() => {
    stoppedManually.current = true;
    Speech.stop();
    const prev = Math.max(0, currentVerse - 1);
    speakVerse(prev);
  }, [currentVerse, speakVerse]);

  return { isPlaying, currentVerse, speed, play, pause, stop, skipNext, skipPrev, setSpeed };
}
