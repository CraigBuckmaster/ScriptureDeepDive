import type { ChapterPanel, SectionPanel, Verse } from '../../types';
import type { StudyDepthEstimate } from './types';

const WORDS_PER_MINUTE = 200;
const PANEL_WORDS_PER_MINUTE = 180;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function stripJsonNoise(value: string): string {
  return value
    .replace(/[{}[\]",:]/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function minutesForWords(words: number, wpm: number): number {
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Reading-minutes estimate for a single panel's content_json, using
 * the same heuristics as the depth estimate above (#1842). Minimum 1.
 */
export function estimatePanelMinutes(contentJson: string): number {
  return minutesForWords(countWords(stripJsonNoise(contentJson)), PANEL_WORDS_PER_MINUTE);
}

export function getStudyDepthEstimate(
  verses: Verse[],
  sectionPanels: SectionPanel[],
  chapterPanels: ChapterPanel[],
): StudyDepthEstimate {
  const verseWords = verses.reduce((sum, verse) => sum + countWords(verse.text), 0);
  const panelWords = [...sectionPanels, ...chapterPanels].reduce(
    (sum, panel) => sum + countWords(stripJsonNoise(panel.content_json)),
    0,
  );

  const readMin = minutesForWords(verseWords, WORDS_PER_MINUTE);
  const panelMin = minutesForWords(panelWords, PANEL_WORDS_PER_MINUTE);

  return {
    readMin,
    guidedMin: Math.max(readMin + 4, Math.ceil(readMin + panelMin * 0.2)),
    deepMin: Math.max(readMin + 12, Math.ceil(readMin + panelMin * 0.55)),
  };
}
