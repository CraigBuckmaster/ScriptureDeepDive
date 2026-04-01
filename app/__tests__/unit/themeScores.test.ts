/**
 * Tests for theme score data integrity in chapter JSON files.
 * Validates that chapter_panels.themes.scores entries have correct
 * structure, valid score ranges, and are non-empty when present.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');

interface ThemeScore {
  label?: string;
  name?: string;
  score?: number;
  value?: number;
}

interface ChapterData {
  book_dir: string;
  chapter_num: number;
  chapter_panels?: {
    themes?: {
      scores?: ThemeScore[];
    };
  };
}

function getAllChapterFiles(): { filePath: string; label: string }[] {
  const files: { filePath: string; label: string }[] = [];
  if (!fs.existsSync(CONTENT_DIR)) return files;
  for (const entry of fs.readdirSync(CONTENT_DIR)) {
    const entryPath = path.join(CONTENT_DIR, entry);
    if (!fs.statSync(entryPath).isDirectory()) continue;
    // Skip non-book directories
    if (['meta', 'verses', 'interlinear', 'esv', 'niv', 'kjv'].includes(entry)) continue;
    for (const file of fs.readdirSync(entryPath)) {
      if (/^\d+\.json$/.test(file)) {
        files.push({
          filePath: path.join(entryPath, file),
          label: `${entry}/${file}`,
        });
      }
    }
  }
  return files;
}

describe('theme score integrity', () => {
  const chapterFiles = getAllChapterFiles();

  it('theme scores (when present) have both label and score fields', () => {
    // Two schemas exist: { label, score } and { name, value }
    const errors: string[] = [];
    for (const { filePath, label } of chapterFiles) {
      const data: ChapterData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const scores = data.chapter_panels?.themes?.scores;
      if (!scores) continue;
      for (let i = 0; i < scores.length; i++) {
        const entry = scores[i];
        const hasLabel = (entry.label !== undefined && entry.label !== null) ||
                         (entry.name !== undefined && entry.name !== null);
        const hasScore = (entry.score !== undefined && entry.score !== null) ||
                         (entry.value !== undefined && entry.value !== null);
        const missing: string[] = [];
        if (!hasLabel) missing.push('label/name');
        if (!hasScore) missing.push('score/value');
        if (missing.length > 0) {
          errors.push(`${label} scores[${i}]: missing ${missing.join(', ')}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it('score values are numbers between 0 and 10', () => {
    const errors: string[] = [];
    for (const { filePath, label } of chapterFiles) {
      const data: ChapterData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const scores = data.chapter_panels?.themes?.scores;
      if (!scores) continue;
      for (let i = 0; i < scores.length; i++) {
        const entry = scores[i];
        // Support both { score } and { value } field names
        const scoreVal = entry.score !== undefined ? entry.score : entry.value;
        if (typeof scoreVal !== 'number' || scoreVal < 0 || scoreVal > 10) {
          errors.push(`${label} scores[${i}]: score=${scoreVal} is not a number between 0 and 10`);
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it('no chapter has an empty themes.scores array when themes note is populated', () => {
    const empty: string[] = [];
    for (const { filePath, label } of chapterFiles) {
      const data: ChapterData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const themes = data.chapter_panels?.themes as Record<string, unknown> | undefined;
      if (!themes) continue;
      // Only flag if themes has a non-empty note but scores is empty
      const hasContent = themes.note && typeof themes.note === 'string' && themes.note.trim() !== '';
      if (hasContent && Array.isArray(themes.scores) && (themes.scores as unknown[]).length === 0) {
        empty.push(label);
      }
    }
    expect(empty).toEqual([]);
  });
});
