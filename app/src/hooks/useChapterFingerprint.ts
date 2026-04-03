/**
 * hooks/useChapterFingerprint.ts — Compute 6 study-depth dimensions for a chapter.
 *
 * Returns normalized 0-1 scores for: Scholars, Context, Language,
 * Connections, Structure, Links. Computed from already-loaded section
 * panels and chapter panels — no extra DB queries.
 */

import { useMemo } from 'react';
import type { SectionPanel, ChapterPanel } from '../types';

/** Known scholar panel types (commentary panels attributed to scholars). */
const SCHOLAR_TYPES = new Set([
  'mac', 'calvin', 'sarna', 'alter', 'net', 'oswalt', 'childs',
  'collins', 'longman', 'goldingay', 'moo', 'fee', 'bruce', 'wright',
  'keener', 'beale', 'wenham', 'waltke', 'hamilton', 'sailhamer',
  'kidner', 'craigie', 'dearman', 'stuart', 'hubbard', 'block',
  'duguid', 'motyer', 'bock', 'marshall', 'thielman', 'schreiner',
  'garland', 'blomberg', 'carson', 'france', 'hagner', 'nolland',
  'green', 'fitzmyer', 'morris', 'ridderbos', 'bauckham', 'davids',
  'jobes', 'michaels', 'ellingworth', 'lane', 'koester', 'osborne',
  'aune', 'thomas', 'smalley',
]);

export interface FingerprintScores {
  scholars: number;    // Scholar panel coverage across sections
  context: number;     // Historical context / background panels
  language: number;    // Hebrew/Greek analysis panels
  connections: number; // Cross-refs, threads, echoes
  structure: number;   // Literary structure, chiasm, discourse
  links: number;       // Timeline, map, people deep-links
}

export const FINGERPRINT_LABELS: { key: keyof FingerprintScores; label: string }[] = [
  { key: 'scholars', label: 'Scholars' },
  { key: 'context', label: 'Context' },
  { key: 'language', label: 'Language' },
  { key: 'connections', label: 'Connections' },
  { key: 'structure', label: 'Structure' },
  { key: 'links', label: 'Links' },
];

/**
 * Compute fingerprint from section panels and chapter panels.
 * All inputs are already loaded by useChapterData — zero DB calls.
 */
export function useChapterFingerprint(
  sectionPanels: SectionPanel[][],
  chapterPanels: ChapterPanel[],
  hasTimeline: boolean,
  hasMap: boolean,
): FingerprintScores | null {
  return useMemo(() => {
    if (sectionPanels.length === 0) return null;

    const secCount = sectionPanels.length;
    const allPanels = sectionPanels.flat();
    const panelTypes = new Set(allPanels.map(p => p.panel_type));
    const cpTypes = new Set(chapterPanels.map(p => p.panel_type));

    // 1. Scholars: ratio of sections that have at least one scholar panel
    let secsWithScholar = 0;
    let uniqueScholars = new Set<string>();
    for (const panels of sectionPanels) {
      const scholarPanels = panels.filter(p => SCHOLAR_TYPES.has(p.panel_type));
      if (scholarPanels.length > 0) secsWithScholar++;
      scholarPanels.forEach(p => uniqueScholars.add(p.panel_type));
    }
    const scholars = Math.min(1, (secsWithScholar / secCount) * 0.5 + (uniqueScholars.size / 8) * 0.5);

    // 2. Context: historical/background panels (hist, ctx)
    const contextTypes = ['hist', 'ctx'];
    let secsWithContext = 0;
    for (const panels of sectionPanels) {
      if (panels.some(p => contextTypes.includes(p.panel_type))) secsWithContext++;
    }
    const context = secsWithContext / secCount;

    // 3. Language: Hebrew/Greek panels (heb, hebtext)
    const langTypes = ['heb', 'hebtext'];
    let secsWithLang = 0;
    for (const panels of sectionPanels) {
      if (panels.some(p => langTypes.includes(p.panel_type))) secsWithLang++;
    }
    const hasChapterHebtext = cpTypes.has('hebtext');
    const language = Math.min(1, (secsWithLang / secCount) * 0.8 + (hasChapterHebtext ? 0.2 : 0));

    // 4. Connections: cross-refs, threads, echoes
    const connTypes = ['cross', 'thread', 'echo'];
    let secsWithConn = 0;
    for (const panels of sectionPanels) {
      if (panels.some(p => connTypes.includes(p.panel_type))) secsWithConn++;
    }
    const hasChapterThreads = cpTypes.has('thread');
    const connections = Math.min(1, (secsWithConn / secCount) * 0.7 + (hasChapterThreads ? 0.3 : 0));

    // 5. Structure: literary structure, chiasm, discourse at chapter level
    const hasLit = cpTypes.has('lit');
    const hasDiscourse = cpTypes.has('discourse');
    const hasDebate = cpTypes.has('debate');
    const structure = Math.min(1,
      (hasLit ? 0.4 : 0) + (hasDiscourse ? 0.3 : 0) + (hasDebate ? 0.3 : 0));

    // 6. Links: timeline, map, people at chapter level
    const hasPeople = cpTypes.has('ppl');
    const links = Math.min(1,
      (hasTimeline ? 0.35 : 0) + (hasMap ? 0.35 : 0) + (hasPeople ? 0.3 : 0));

    return { scholars, context, language, connections, structure, links };
  }, [sectionPanels, chapterPanels, hasTimeline, hasMap]);
}
