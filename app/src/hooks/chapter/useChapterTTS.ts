/**
 * useChapterTTS — Encapsulates text-to-speech state and auto-scroll behavior.
 *
 * Extracted from ChapterScreen (#970).
 */

import { useState, useEffect, useCallback, type RefObject } from 'react';
import type { ScrollView } from 'react-native';
import { useTTS } from '../useTTS';
import { useSettingsStore } from '../../stores';
import type { Verse, Section } from '../../types';

interface UseChapterTTSOptions {
  verses: Verse[];
  sections: Section[];
  scrollRef: RefObject<ScrollView | null>;
  sectionYMap: RefObject<Record<string, number>>;
  verseYMap: RefObject<Record<number, number>>;
  bookId: string;
  chapterNum: number;
}

export function useChapterTTS({
  verses,
  sections,
  scrollRef,
  sectionYMap,
  verseYMap,
  bookId,
  chapterNum,
}: UseChapterTTSOptions) {
  const ttsVoice = useSettingsStore((s) => s.ttsVoice);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const tts = useTTS(verses, ttsVoice || undefined);
  const [ttsActive, setTtsActive] = useState(false);

  // Auto-scroll to active verse during TTS playback
  useEffect(() => {
    if (!ttsActive || verses.length === 0) return;
    const verseNum = verses[tts.currentVerse]?.verse_num;
    if (verseNum == null) return;

    const verseY = verseYMap.current[verseNum];
    if (verseY != null) {
      scrollRef.current?.scrollTo({
        y: Math.max(0, verseY - 120),
        animated: true,
      });
      return;
    }

    // Fallback: estimate position if layout hasn't fired yet
    const sec = sections.find(
      (s) => verseNum >= s.verse_start && verseNum <= s.verse_end,
    );
    if (!sec) return;
    const sectionY = sectionYMap.current[sec.id];
    if (sectionY == null) return;
    const verseIndex = verseNum - sec.verse_start;
    const estimatedVerseHeight = fontSize * 1.6 + 16;
    const verseOffsetY = 52 + verseIndex * estimatedVerseHeight;

    scrollRef.current?.scrollTo({
      y: Math.max(0, sectionY + verseOffsetY - 120),
      animated: true,
    });
  }, [ttsActive, tts.currentVerse, verses, sections, fontSize]);

  // Stop TTS on chapter change
  useEffect(() => {
    tts.stop();
    setTtsActive(false);
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
