/**
 * hooks/useChapterData.ts — Load ALL data for a chapter in one call.
 *
 * When comparisonTranslation is set, also loads comparison verses
 * for parallel translation view.
 */

import { useState, useEffect, useMemo } from 'react';
import { useSettingsStore } from '../stores';
import {
  getChapter, getSections, getSectionPanels,
  getChapterPanels, getVerses, getVHLGroups,
} from '../db/content';
import { getNoteCount } from '../db/user';
import type { Chapter, Section, SectionPanel, ChapterPanel, Verse, VHLGroup } from '../types';

interface SectionData extends Section {
  panels: SectionPanel[];
}

interface ChapterData {
  chapter: Chapter | null;
  sections: SectionData[];
  verses: Verse[];
  comparisonVerses: Verse[];
  vhlGroups: VHLGroup[];
  chapterPanels: ChapterPanel[];
  noteCount: number;
  isLoading: boolean;
}

export function useChapterData(bookId: string | null, chapterNum: number): ChapterData {
  const translation = useSettingsStore((s) => s.translation);
  const comparisonTranslation = useSettingsStore((s) => s.comparisonTranslation);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [comparisonVerses, setComparisonVerses] = useState<Verse[]>([]);
  const [vhlGroups, setVhlGroups] = useState<VHLGroup[]>([]);
  const [chapterPanels, setChapterPanels] = useState<ChapterPanel[]>([]);
  const [noteCount, setNoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const ch = await getChapter(bookId!, chapterNum);
      if (cancelled) return;
      setChapter(ch);

      if (!ch) {
        setIsLoading(false);
        return;
      }

      const [secs, vv, compVv, vhl, cp, nc] = await Promise.all([
        getSections(ch.id),
        getVerses(bookId!, chapterNum, translation),
        comparisonTranslation
          ? getVerses(bookId!, chapterNum, comparisonTranslation)
          : Promise.resolve([]),
        getVHLGroups(ch.id),
        getChapterPanels(ch.id),
        getNoteCount(bookId!, chapterNum),
      ]);

      if (cancelled) return;

      // Load panels for each section
      const secsWithPanels = await Promise.all(
        secs.map(async (sec) => ({
          ...sec,
          panels: await getSectionPanels(sec.id),
        }))
      );

      if (cancelled) return;

      setSections(secsWithPanels);
      setVerses(vv);
      setComparisonVerses(compVv);
      setVhlGroups(vhl);
      setChapterPanels(cp);
      setNoteCount(nc);
      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [bookId, chapterNum, translation, comparisonTranslation]);

  return { chapter, sections, verses, comparisonVerses, vhlGroups, chapterPanels, noteCount, isLoading };
}
