/**
 * Tests for interlinear data integrity.
 * Validates strongs numbers, required fields, book references,
 * and gloss completeness in interlinear JSON files.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');
const INTERLINEAR_DIR = path.join(CONTENT_DIR, 'interlinear');

interface InterlinearEntry {
  ch: number;
  v: number;
  pos: number;
  original: string;
  transliteration: string;
  strongs?: string;
  morphology?: string;
  gloss?: string;
}

function getInterlinearFiles(): { bookId: string; filePath: string }[] {
  const files: { bookId: string; filePath: string }[] = [];
  if (!fs.existsSync(INTERLINEAR_DIR)) return files;
  for (const file of fs.readdirSync(INTERLINEAR_DIR)) {
    if (file.endsWith('.json')) {
      files.push({
        bookId: file.replace('.json', ''),
        filePath: path.join(INTERLINEAR_DIR, file),
      });
    }
  }
  return files;
}

function loadBookIds(): Set<string> {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'meta', 'books.json'), 'utf-8');
  const books = JSON.parse(raw);
  return new Set(books.map((b: { id: string }) => b.id));
}

describe('interlinear data integrity', () => {
  const interlinearFiles = getInterlinearFiles();

  it('all strongs values match H or G followed by digits', () => {
    const invalid: string[] = [];
    const strongsPattern = /^[HG]\d+$/;

    for (const { bookId, filePath } of interlinearFiles) {
      const entries: InterlinearEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const entry of entries) {
        if (entry.strongs !== undefined && entry.strongs !== null && entry.strongs !== '') {
          if (!strongsPattern.test(entry.strongs)) {
            invalid.push(`${bookId} ch${entry.ch}:v${entry.v} pos${entry.pos} — "${entry.strongs}"`);
          }
        }
      }
    }
    expect(invalid).toEqual([]);
  });

  it('all interlinear entries have required fields: ch, v, pos, original, transliteration', () => {
    const errors: string[] = [];
    const requiredFields = ['ch', 'v', 'pos', 'original', 'transliteration'];

    for (const { bookId, filePath } of interlinearFiles) {
      const entries: InterlinearEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const missing: string[] = [];
        for (const field of requiredFields) {
          if ((entry as unknown as Record<string, unknown>)[field] === undefined || (entry as unknown as Record<string, unknown>)[field] === null) {
            missing.push(field);
          }
        }
        if (missing.length > 0) {
          errors.push(`${bookId}[${i}]: missing ${missing.join(', ')}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it('no interlinear file references a book that does not exist in books.json', () => {
    const bookIds = loadBookIds();
    const unknownBooks: string[] = [];

    for (const { bookId } of interlinearFiles) {
      if (!bookIds.has(bookId)) {
        unknownBooks.push(bookId);
      }
    }
    expect(unknownBooks).toEqual([]);
  });

  it('gloss field is present on entries that have a strongs number', () => {
    const errors: string[] = [];

    for (const { bookId, filePath } of interlinearFiles) {
      const entries: InterlinearEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const entry of entries) {
        if (entry.strongs && entry.strongs.trim() !== '') {
          if (entry.gloss === undefined || entry.gloss === null) {
            errors.push(`${bookId} ch${entry.ch}:v${entry.v} pos${entry.pos} — has strongs "${entry.strongs}" but gloss field is missing`);
          }
        }
      }
    }
    expect(errors).toEqual([]);
  });
});
