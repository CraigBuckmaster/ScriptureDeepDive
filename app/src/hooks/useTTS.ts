/**
 * useTTS — Text-to-speech hook wrapping expo-speech.
 * Auto-advances through verses, supports speed control.
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

  useEffect(() => { versesRef.current = verses; }, [verses]);
  useEffect(() => { voiceRef.current = voiceId; }, [voiceId]);

  // Stop on unmount
  useEffect(() => () => { Speech.stop(); }, []);

  const speakVerse = useCallback((index: number) => {
    const vv = versesRef.current;
    if (index >= vv.length) {
      Speech.stop();
      setIsPlaying(false);
      setCurrentVerse(0);
      return;
    }
    setCurrentVerse(index);
    const text = `Verse ${vv[index].verse_num}. ${vv[index].text}`;
    logger.info('TTS', `Speaking verse ${index + 1}/${vv.length}, voice=${voiceRef.current || 'system default'}, rate=${speed}`);
    Speech.speak(text, {
      language: 'en-US',
      voice: voiceRef.current || undefined,
      pitch: 1.0,
      rate: speed,
      onDone: () => speakVerse(index + 1),
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
    logger.info('TTS', `Playing from verse ${currentVerse}, ${versesRef.current.length} verses available`);
    setIsPlaying(true);
    speakVerse(currentVerse);
  }, [currentVerse, speakVerse]);
  const pause = useCallback(() => { Speech.stop(); setIsPlaying(false); }, []);
  const stop = useCallback(() => { Speech.stop(); setIsPlaying(false); setCurrentVerse(0); }, []);
  const skipNext = useCallback(() => { Speech.stop(); speakVerse(Math.min(currentVerse + 1, verses.length - 1)); }, [currentVerse, speakVerse, verses.length]);
  const skipPrev = useCallback(() => { Speech.stop(); speakVerse(Math.max(0, currentVerse - 1)); }, [currentVerse, speakVerse]);

  return { isPlaying, currentVerse, speed, play, pause, stop, skipNext, skipPrev, setSpeed };
}
