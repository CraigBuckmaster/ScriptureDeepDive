/**
 * Reference integrity tests — validates that IDs referenced in one JSON file
 * actually exist in the target JSON file.
 * Reads content JSON directly — no React components or mocks.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');
const META_DIR = path.join(CONTENT_DIR, 'meta');

function readJson<T = unknown>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, relativePath), 'utf-8'));
}

function getValidBookDirs(): Set<string> {
  const dirs = new Set<string>();
  for (const entry of fs.readdirSync(CONTENT_DIR)) {
    const full = path.join(CONTENT_DIR, entry);
    if (fs.statSync(full).isDirectory() && entry !== 'meta' && entry !== 'interlinear' && entry !== 'verses') {
      dirs.add(entry);
    }
  }
  return dirs;
}

function getAllChapterFiles(): string[] {
  const files: string[] = [];
  const validBooks = getValidBookDirs();
  for (const book of validBooks) {
    const bookDir = path.join(CONTENT_DIR, book);
    for (const file of fs.readdirSync(bookDir)) {
      if (/^\d+\.json$/.test(file)) {
        files.push(path.join(bookDir, file));
      }
    }
  }
  return files;
}

describe('reference integrity', () => {
  const validBookDirs = getValidBookDirs();

  // --- Prophecy chains: book_dir values ---
  it('all book_dir values in prophecy chain links reference valid book directories', () => {
    const chains = readJson<Array<{ id: string; links: Array<{ book_dir: string }> }>>('meta/prophecy-chains.json');
    const violations: string[] = [];
    for (const chain of chains) {
      for (const link of chain.links ?? []) {
        if (link.book_dir && !validBookDirs.has(link.book_dir)) {
          violations.push(`prophecy chain "${chain.id}": invalid book_dir "${link.book_dir}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // --- Difficult passages: related_chapters book_dir values ---
  it('all book_dir values in difficult passage related_chapters reference valid book directories', () => {
    const passages = readJson<Array<{ id: string; related_chapters?: Array<{ book_dir: string }> }>>('meta/difficult-passages.json');
    const violations: string[] = [];
    for (const passage of passages) {
      for (const rc of passage.related_chapters ?? []) {
        if (rc.book_dir && !validBookDirs.has(rc.book_dir)) {
          violations.push(`difficult passage "${passage.id}": invalid book_dir "${rc.book_dir}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // --- Scholar IDs in section panels ---
  it('all scholar IDs used as panel keys in section panels exist in scholars.json or scholar-data.json', () => {
    const scholars = readJson<Array<{ id: string; panel_key: string }>>('meta/scholars.json');
    const scholarData = readJson<Array<{ key: string }>>('meta/scholar-data.json');
    // Some chapter files use abbreviated panel keys (e.g. "cat" for "catena",
    // "mar" for "marcus", "net" for "netbible", "rho" for "rhoads").
    // We collect valid keys from both meta files and accept known abbreviations.
    const validPanelKeys = new Set([
      ...scholars.map((s) => s.panel_key),
      ...scholars.map((s) => s.id),
      ...scholarData.map((s) => s.key),
    ]);
    // Add known abbreviated panel keys used in chapter files
    // (cat→catena, mar→marcus, net→netbible, rho→rhoads)
    for (const entry of [...scholars, ...scholarData]) {
      const key = ('panel_key' in entry ? (entry as { panel_key: string }).panel_key : (entry as { key: string }).key);
      if (key.length >= 3) {
        validPanelKeys.add(key.substring(0, 3));
      }
    }

    const SYSTEM_PANEL_KEYS = new Set([
      'heb', 'cross', 'hist', 'poi', 'places', 'tl', 'lit', 'themes',
      'ppl', 'trans', 'src', 'rec', 'hebtext', 'thread', 'tx', 'debate',
      'discourse', 'echoes', 'chiasm',
    ]);

    const violations: string[] = [];
    const chapterFiles = getAllChapterFiles();

    for (const filePath of chapterFiles) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const section of data.sections ?? []) {
        for (const key of Object.keys(section.panels ?? {})) {
          if (SYSTEM_PANEL_KEYS.has(key)) continue;
          if (!validPanelKeys.has(key)) {
            violations.push(
              `${data.book_dir}/${data.chapter_num} s${section.section_num}: unknown panel key "${key}"`,
            );
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // --- Word study IDs in concepts ---
  it('word study IDs referenced in concepts exist in word-studies.json', () => {
    const concepts = readJson<Array<{ id: string; word_study_ids?: string[] }>>('meta/concepts.json');
    const wordStudies = readJson<Array<{ id: string }>>('meta/word-studies.json');
    const validIds = new Set(wordStudies.map((w) => w.id));

    const violations: string[] = [];
    for (const concept of concepts) {
      for (const wsId of concept.word_study_ids ?? []) {
        if (!validIds.has(wsId)) {
          violations.push(`concept "${concept.id}": word_study_id "${wsId}" not found in word-studies.json`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // --- Thread IDs in concepts ---
  it('thread IDs referenced in concepts exist in cross-refs.json threads', () => {
    const concepts = readJson<Array<{ id: string; thread_ids?: string[] }>>('meta/concepts.json');
    const crossRefs = readJson<{ threads: Array<{ id: string }> }>('meta/cross-refs.json');
    const validThreadIds = new Set(crossRefs.threads.map((t) => t.id));

    const violations: string[] = [];
    for (const concept of concepts) {
      for (const threadId of concept.thread_ids ?? []) {
        if (!validThreadIds.has(threadId)) {
          violations.push(`concept "${concept.id}": thread_id "${threadId}" not found in cross-refs.json`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // --- Prophecy chain IDs in concepts ---
  it('prophecy chain IDs referenced in concepts exist in prophecy-chains.json', () => {
    const concepts = readJson<Array<{ id: string; prophecy_chain_ids?: string[] }>>('meta/concepts.json');
    const chains = readJson<Array<{ id: string }>>('meta/prophecy-chains.json');
    const validChainIds = new Set(chains.map((c) => c.id));

    const violations: string[] = [];
    for (const concept of concepts) {
      for (const chainId of concept.prophecy_chain_ids ?? []) {
        if (!validChainIds.has(chainId)) {
          violations.push(`concept "${concept.id}": prophecy_chain_id "${chainId}" not found in prophecy-chains.json`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // --- Sanity checks ---
  it('scholars.json has entries', () => {
    const scholars = readJson<Array<{ id: string }>>('meta/scholars.json');
    expect(scholars.length).toBeGreaterThan(0);
  });

  it('prophecy-chains.json has entries', () => {
    const chains = readJson<Array<{ id: string }>>('meta/prophecy-chains.json');
    expect(chains.length).toBeGreaterThan(0);
  });

  it('concepts.json has entries', () => {
    const concepts = readJson<Array<{ id: string }>>('meta/concepts.json');
    expect(concepts.length).toBeGreaterThan(0);
  });

  it('word-studies.json has entries', () => {
    const wordStudies = readJson<Array<{ id: string }>>('meta/word-studies.json');
    expect(wordStudies.length).toBeGreaterThan(0);
  });
});
