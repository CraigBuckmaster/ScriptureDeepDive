/**
 * Tests for verse_end data integrity in content JSON files.
 *
 * Bug: 41 sections in Luke had verse_end == verse_start, causing
 * sections titled "Verses 1-19" to only display verse 1.
 * Fix: Corrected verse_end values from section headers.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');

function getAllContentFiles(): string[] {
  const files: string[] = [];
  if (!fs.existsSync(CONTENT_DIR)) return files;
  for (const book of fs.readdirSync(CONTENT_DIR)) {
    const bookDir = path.join(CONTENT_DIR, book);
    if (!fs.statSync(bookDir).isDirectory()) continue;
    for (const file of fs.readdirSync(bookDir)) {
      if (file.endsWith('.json') && /^\d+\.json$/.test(file)) {
        files.push(path.join(bookDir, file));
      }
    }
  }
  return files;
}

describe('verse_end data integrity', () => {
  const contentFiles = getAllContentFiles();

  it('finds content files to test', () => {
    expect(contentFiles.length).toBeGreaterThan(0);
  });

  it('no section has verse_end < verse_start', () => {
    const violations: string[] = [];
    for (const filePath of contentFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!data || !data.sections) continue;
      for (const sec of data.sections) {
        if (sec.verse_start != null && sec.verse_end != null) {
          if (sec.verse_end < sec.verse_start) {
            violations.push(
              `${filePath} sec#${sec.section_num}: verse_end (${sec.verse_end}) < verse_start (${sec.verse_start})`
            );
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('verse_end matches range in header when header specifies a range', () => {
    const mismatches: string[] = [];
    const rangeRegex = /Verses?\s+(\d+)\s*[\u2013\u2011\-]\s*(\d+)/;

    for (const filePath of contentFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!data || !data.sections) continue;
      for (const sec of data.sections) {
        const match = rangeRegex.exec(sec.header || '');
        if (match) {
          const headerStart = parseInt(match[1], 10);
          const headerEnd = parseInt(match[2], 10);
          if (sec.verse_start !== headerStart || sec.verse_end !== headerEnd) {
            mismatches.push(
              `${path.basename(path.dirname(filePath))}/${path.basename(filePath)} sec#${sec.section_num}: ` +
              `header says ${headerStart}-${headerEnd}, data says ${sec.verse_start}-${sec.verse_end}`
            );
          }
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('Luke sections do not have overlapping verse ranges', () => {
    const overlaps: string[] = [];
    const lukeFiles = contentFiles.filter((f) => f.includes('/luke/'));
    for (const filePath of lukeFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!data || !data.sections) continue;
      const sections = data.sections
        .filter((s: any) => s.verse_start != null && s.verse_end != null)
        .sort((a: any, b: any) => a.verse_start - b.verse_start);

      for (let i = 1; i < sections.length; i++) {
        if (sections[i].verse_start <= sections[i - 1].verse_end) {
          overlaps.push(
            `luke/${path.basename(filePath)}: ` +
            `sec#${sections[i - 1].section_num} ends at ${sections[i - 1].verse_end}, ` +
            `sec#${sections[i].section_num} starts at ${sections[i].verse_start}`
          );
        }
      }
    }
    expect(overlaps).toEqual([]);
  });
});
