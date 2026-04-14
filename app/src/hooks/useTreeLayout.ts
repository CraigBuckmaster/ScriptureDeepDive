/**
 * hooks/useTreeLayout.ts — Memoized tree layout computation.
 *
 * Runs d3-hierarchy once when people data loads and never again. Era
 * filter changes, zoom changes, and pan gestures don't re-trigger the
 * layout — dimming is computed at render time and culling lives in
 * useVisibleNodes.
 */

import { useMemo } from 'react';
import { computeFullLayout, type TreeLayoutResult } from '../utils/treeBuilder';
import type { Person } from '../types';

export function useTreeLayout(people: Person[]): TreeLayoutResult {
  return useMemo(() => {
    if (!people.length) {
      return {
        nodes: [],
        links: [],
        marriageBars: [],
        spouseConnectors: [],
        associationLinks: [],
        associateBloomLabels: [],
        associateTrails: [],
        spineIds: new Set<string>(),
        bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 },
      };
    }
    return computeFullLayout(people);
  }, [people]);
}
