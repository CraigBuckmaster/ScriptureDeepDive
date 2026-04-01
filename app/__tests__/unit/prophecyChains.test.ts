/**
 * Tests for prophecy chain data integrity.
 * Validates chain structure, link fields, book directory existence,
 * and category values in prophecy-chains.json.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');

interface ProphecyLink {
  book_dir: string;
  chapter_num: number;
  verse_ref: string;
  note?: string;
}

interface ProphecyChain {
  id: string;
  title: string;
  category: string;
  links: ProphecyLink[];
}

function loadProphecyChains(): ProphecyChain[] {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'meta', 'prophecy-chains.json'), 'utf-8');
  return JSON.parse(raw);
}

describe('prophecy chain integrity', () => {
  const chains = loadProphecyChains();

  const VALID_CATEGORIES = new Set([
    'messianic',
    'covenant',
    'judgment',
    'restoration',
    'typological',
  ]);

  it('every prophecy chain has at least 1 link', () => {
    const empty: string[] = [];
    for (const chain of chains) {
      if (!Array.isArray(chain.links) || chain.links.length === 0) {
        empty.push(chain.id);
      }
    }
    expect(empty).toEqual([]);
  });

  it('all links in chains have valid book_dir that exists as a directory in content/', () => {
    const invalid: string[] = [];
    for (const chain of chains) {
      if (!Array.isArray(chain.links)) continue;
      for (const link of chain.links) {
        const dirPath = path.join(CONTENT_DIR, link.book_dir);
        if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
          invalid.push(`chain "${chain.id}" link book_dir "${link.book_dir}" — directory does not exist`);
        }
      }
    }
    expect(invalid).toEqual([]);
  });

  it('all links have chapter_num and verse_ref fields', () => {
    const errors: string[] = [];
    for (const chain of chains) {
      if (!Array.isArray(chain.links)) continue;
      for (let i = 0; i < chain.links.length; i++) {
        const link = chain.links[i];
        const missing: string[] = [];
        if (link.chapter_num === undefined || link.chapter_num === null) {
          missing.push('chapter_num');
        }
        if (!link.verse_ref) {
          missing.push('verse_ref');
        }
        if (missing.length > 0) {
          errors.push(`chain "${chain.id}" link[${i}]: missing ${missing.join(', ')}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it('category values are in valid set: messianic, covenant, judgment, restoration, typological', () => {
    const invalid: string[] = [];
    for (const chain of chains) {
      if (!VALID_CATEGORIES.has(chain.category)) {
        invalid.push(`chain "${chain.id}" has invalid category "${chain.category}"`);
      }
    }
    expect(invalid).toEqual([]);
  });
});
