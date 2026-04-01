/**
 * Tests for context panel data cleanliness.
 *
 * Bug: 92 context fields contained Python tuple string literals like
 * [('Title', 'Content')] that rendered as raw code to users.
 * Fix: Converted to clean "Title\nContent" text format.
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

describe('context panel data cleanliness', () => {
  const contentFiles = getAllContentFiles();

  it('no hist.context field contains Python tuple formatting', () => {
    const violations: string[] = [];
    for (const filePath of contentFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!data || !data.sections) continue;
      for (const sec of data.sections) {
        const panels = sec.panels;
        if (!panels || typeof panels !== 'object') continue;
        const hist = panels.hist;
        if (!hist || typeof hist !== 'object') continue;
        const ctx = hist.context;
        if (typeof ctx === 'string' && ctx.startsWith("[(")) {
          violations.push(
            `${path.basename(path.dirname(filePath))}/${path.basename(filePath)} sec#${sec.section_num}`
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('no hist.historical field contains Python tuple formatting', () => {
    const violations: string[] = [];
    for (const filePath of contentFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!data || !data.sections) continue;
      for (const sec of data.sections) {
        const hist = sec.panels?.hist;
        if (typeof hist?.historical === 'string' && hist.historical.startsWith("[(")) {
          violations.push(
            `${path.basename(path.dirname(filePath))}/${path.basename(filePath)} sec#${sec.section_num}`
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('no hist.audience field contains Python tuple formatting', () => {
    const violations: string[] = [];
    for (const filePath of contentFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!data || !data.sections) continue;
      for (const sec of data.sections) {
        const hist = sec.panels?.hist;
        if (typeof hist?.audience === 'string' && hist.audience.startsWith("[(")) {
          violations.push(
            `${path.basename(path.dirname(filePath))}/${path.basename(filePath)} sec#${sec.section_num}`
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
