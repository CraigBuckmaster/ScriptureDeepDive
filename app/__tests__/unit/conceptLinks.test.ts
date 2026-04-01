/**
 * Tests for concept link integrity.
 * Validates that all IDs referenced in concepts.json actually exist
 * in the corresponding word-studies, cross-refs, and prophecy-chains files.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');
const META_DIR = path.join(CONTENT_DIR, 'meta');

interface Concept {
  id: string;
  word_study_ids?: string[];
  thread_ids?: string[];
  prophecy_chain_ids?: string[];
}

interface WordStudy {
  id: string;
}

interface CrossRefThread {
  id: string;
}

interface CrossRefs {
  threads: CrossRefThread[];
}

interface ProphecyChain {
  id: string;
}

function loadJson<T>(filename: string): T {
  const raw = fs.readFileSync(path.join(META_DIR, filename), 'utf-8');
  return JSON.parse(raw);
}

describe('concept link integrity', () => {
  const concepts = loadJson<Concept[]>('concepts.json');
  const wordStudies = loadJson<WordStudy[]>('word-studies.json');
  const crossRefs = loadJson<CrossRefs>('cross-refs.json');
  const prophecyChains = loadJson<ProphecyChain[]>('prophecy-chains.json');

  it('all word_study_ids in concepts reference IDs that exist in word-studies.json', () => {
    const wordStudyIds = new Set(wordStudies.map((ws) => ws.id));
    const broken: string[] = [];

    for (const concept of concepts) {
      if (!concept.word_study_ids) continue;
      for (const wsId of concept.word_study_ids) {
        if (!wordStudyIds.has(wsId)) {
          broken.push(`concept "${concept.id}" references word_study_id "${wsId}" which does not exist`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('all thread_ids in concepts reference IDs that exist in cross-refs.json threads', () => {
    const threadIds = new Set(crossRefs.threads.map((t) => t.id));
    const broken: string[] = [];

    for (const concept of concepts) {
      if (!concept.thread_ids) continue;
      for (const tid of concept.thread_ids) {
        if (!threadIds.has(tid)) {
          broken.push(`concept "${concept.id}" references thread_id "${tid}" which does not exist`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('all prophecy_chain_ids in concepts reference IDs that exist in prophecy-chains.json', () => {
    const chainIds = new Set(prophecyChains.map((pc) => pc.id));
    const broken: string[] = [];

    for (const concept of concepts) {
      if (!concept.prophecy_chain_ids) continue;
      for (const pcId of concept.prophecy_chain_ids) {
        if (!chainIds.has(pcId)) {
          broken.push(`concept "${concept.id}" references prophecy_chain_id "${pcId}" which does not exist`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('all concept IDs are unique (no duplicates)', () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const concept of concepts) {
      if (seen.has(concept.id)) {
        duplicates.push(concept.id);
      }
      seen.add(concept.id);
    }
    expect(duplicates).toEqual([]);
  });
});
