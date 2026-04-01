/**
 * Data integrity tests for places panels in chapter JSON files.
 * Reads content JSON directly — no React components or mocks.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');

function getAllChapterFiles(): string[] {
  const files: string[] = [];
  if (!fs.existsSync(CONTENT_DIR)) return files;
  for (const book of fs.readdirSync(CONTENT_DIR)) {
    const bookDir = path.join(CONTENT_DIR, book);
    if (!fs.statSync(bookDir).isDirectory() || book === 'meta' || book === 'interlinear' || book === 'verses') continue;
    for (const file of fs.readdirSync(bookDir)) {
      if (/^\d+\.json$/.test(file)) {
        files.push(path.join(bookDir, file));
      }
    }
  }
  return files;
}

interface PlacesEntry {
  name?: string;
  coords?: string;
  text?: string;
  _raw_html?: string;
  [key: string]: unknown;
}

describe('places panel data integrity', () => {
  const chapterFiles = getAllChapterFiles();

  it('finds chapter files to test', () => {
    expect(chapterFiles.length).toBeGreaterThan(0);
  });

  it('no places panels have raw HTML (_raw_html key)', () => {
    const violations: string[] = [];
    for (const filePath of chapterFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const section of data.sections ?? []) {
        const places = section.panels?.places;
        if (!places) continue;
        const entries: PlacesEntry[] = Array.isArray(places) ? places : [places];
        for (const entry of entries) {
          if (entry._raw_html !== undefined) {
            violations.push(
              `${path.basename(path.dirname(filePath))}/${path.basename(filePath)} section ${section.section_num}: places entry has _raw_html`,
            );
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('all places panel entries have required fields: name, coords, text', () => {
    const violations: string[] = [];
    for (const filePath of chapterFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const section of data.sections ?? []) {
        const places = section.panels?.places;
        if (!places || !Array.isArray(places)) continue;
        for (const entry of places) {
          const missing: string[] = [];
          if (!entry.name) missing.push('name');
          if (!entry.coords) missing.push('coords');
          if (!entry.text) missing.push('text');
          if (missing.length > 0) {
            violations.push(
              `${path.basename(path.dirname(filePath))}/${path.basename(filePath)} section ${section.section_num}: places entry missing ${missing.join(', ')}`,
            );
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('places panels are arrays not dicts', () => {
    const violations: string[] = [];
    for (const filePath of chapterFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const section of data.sections ?? []) {
        const places = section.panels?.places;
        if (places === undefined || places === null) continue;
        if (!Array.isArray(places)) {
          violations.push(
            `${path.basename(path.dirname(filePath))}/${path.basename(filePath)} section ${section.section_num}: places is ${typeof places}, not array`,
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
