/**
 * useChapterTTS — Encapsulates text-to-speech state and auto-scroll behavior.
 *
 * Extracted from ChapterScreen (#970). D3 (#1873): auto-follow goes
 * through useChapterScroll's scrollToVerse (scrollToIndex under the
 * hood) instead of onLayout y-maps — scrollToIndex estimates offsets
 * for unmounted blocks, so the old font-size position estimation is
 * gone with it.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTTS } from '../useTTS';
import { useSettingsStore } from '../../stores';
import type { Verse } from '../../types';

/** Anchored a little deeper than deep-link jumps so context stays visible. */
const TTS_TOP_OFFSET = 120;

interface UseChapterTTSOptions {
  verses: Verse[];
  /** Index-based verse anchor from useChapterScroll (#1873). */
  scrollToVerse: (verseNum: number, topOffset?: number, animated?: boolean) => void;
  bookId: string;
  chapterNum: number;
}

export function useChapterTTS({
  verses,
  scrollToVerse,
  bookId,
  chapterNum,
}: UseChapterTTSOptions) {
  const ttsVoice = useSettingsStore((s) => s.ttsVoice);
  const tts = useTTS(verses, ttsVoice || undefined);
  const [ttsActive, setTtsActive] = useState(false);

  // Auto-scroll to active verse during TTS playback
  useEffect(() => {
    if (!ttsActive || verses.length === 0) return;
    const verseNum = verses[tts.currentVerse]?.verse_num;
    if (verseNum == null) return;
    scrollToVerse(verseNum, TTS_TOP_OFFSET, true);
  }, [ttsActive, tts.currentVerse, verses, scrollToVerse]);

  // Stop TTS on chapter change
  useEffect(() => {
    tts.stop();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTtsActive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tts is intentionally omitted to run only on chapter change
  }, [bookId, chapterNum]);

  const toggleTTS = useCallback(() => {
    if (ttsActive) {
      tts.stop();
      setTtsActive(false);
    } else {
      setTtsActive(true);
      tts.play();
    }
  }, [ttsActive, tts]);

  const stopTTS = useCallback(() => {
    tts.stop();
    setTtsActive(false);
  }, [tts]);

  return {
    tts,
    ttsActive,
    toggleTTS,
    stopTTS,
    activeVerseNum: ttsActive ? verses[tts.currentVerse]?.verse_num : undefined,
  };
}
