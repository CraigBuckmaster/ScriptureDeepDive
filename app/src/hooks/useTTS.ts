/**
 * useTTS — Text-to-speech hook wrapping expo-speech.
 * Auto-advances through verses, supports speed control.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';
import type { Verse } from '../types';

export function useTTS(verses: Verse[]) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const versesRef = useRef(verses);

  useEffect(() => { versesRef.current = verses; }, [verses]);

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
    Speech.speak(text, {
      language: 'en-US',
      rate: speed,
      onDone: () => speakVerse(index + 1),
      onError: () => { setIsPlaying(false); },
    });
  }, [speed]);

  const play = useCallback(() => { setIsPlaying(true); speakVerse(currentVerse); }, [currentVerse, speakVerse]);
  const pause = useCallback(() => { Speech.stop(); setIsPlaying(false); }, []);
  const stop = useCallback(() => { Speech.stop(); setIsPlaying(false); setCurrentVerse(0); }, []);
  const skipNext = useCallback(() => { Speech.stop(); speakVerse(Math.min(currentVerse + 1, verses.length - 1)); }, [currentVerse, speakVerse, verses.length]);
  const skipPrev = useCallback(() => { Speech.stop(); speakVerse(Math.max(0, currentVerse - 1)); }, [currentVerse, speakVerse]);

  return { isPlaying, currentVerse, speed, play, pause, stop, skipNext, skipPrev, setSpeed };
}
