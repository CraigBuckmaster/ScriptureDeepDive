/**
 * useStudyDepth — Tracks which panels a user has opened per section.
 *
 * Returns a Map of sectionId → { explored, total } and a recordOpen()
 * function to log panel opens. Data persists in user.db study_depth table.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserDb } from '../db/userDatabase';
import { logger } from '../utils/logger';
import type { SectionPanel } from '../types';

/** Panel types tracked for depth (section-level content panels only) */
const TRACKED_TYPES = new Set(['heb', 'hist', 'cross']);

export interface DepthInfo {
  explored: number;
  total: number;
}

export function useStudyDepth(
  chapterId: string | undefined,
  sectionPanels: Map<string, SectionPanel[]>,
) {
  const [depthMap, setDepthMap] = useState<Map<string, DepthInfo>>(new Map());
  const openedRef = useRef<Set<string>>(new Set());
  const sectionPanelsRef = useRef(sectionPanels);
  sectionPanelsRef.current = sectionPanels;

  const buildMap = useCallback(
    (openedSet: Set<string>) => {
      const panels = sectionPanelsRef.current;
      const map = new Map<string, DepthInfo>();

      panels.forEach((panelList, sectionId) => {
        const tracked = panelList.filter((p) => TRACKED_TYPES.has(p.panel_type));
        const total = tracked.length;
        if (total === 0) return;

        const explored = tracked.filter(
          (p) => openedSet.has(`${sectionId}::${p.panel_type}`)
        ).length;

        map.set(sectionId, { explored, total });
      });

      setDepthMap(map);
    },
    []
  );

  // Load existing depth data when chapter changes
  useEffect(() => {
    if (!chapterId) return;
    let cancelled = false;
    openedRef.current = new Set();

    (async () => {
      try {
        const db = getUserDb();
        const rows = await db.getAllAsync<{ section_id: string; panel_type: string }>(
          'SELECT section_id, panel_type FROM study_depth WHERE chapter_id = ?',
          [chapterId]
        );
        if (cancelled) return;

        const openedSet = new Set(rows.map((r) => `${r.section_id}::${r.panel_type}`));
        openedRef.current = openedSet;

        buildMap(openedSet);
      } catch (err) {
        logger.error('useStudyDepth', 'Failed to load depth data', err);
      }
    })();
    return () => { cancelled = true; };
  }, [chapterId, buildMap]);

  // Rebuild map when sectionPanels changes (e.g. initial load)
  useEffect(() => {
    buildMap(openedRef.current);
  }, [sectionPanels, buildMap]);

  const recordOpen = useCallback(
    async (sectionId: string, panelType: string) => {
      if (!chapterId) return;
      if (!TRACKED_TYPES.has(panelType)) return;

      const key = `${sectionId}::${panelType}`;
      if (openedRef.current.has(key)) return;

      openedRef.current.add(key);
      buildMap(openedRef.current);

      try {
        const db = getUserDb();
        await db.runAsync(
          'INSERT OR IGNORE INTO study_depth (chapter_id, section_id, panel_type) VALUES (?, ?, ?)',
          [chapterId, sectionId, panelType]
        );
      } catch (err) {
        logger.error('useStudyDepth', 'Failed to record open', err);
      }
    },
    [chapterId, buildMap]
  );

  return { depthMap, recordOpen };
}
