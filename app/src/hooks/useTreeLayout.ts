/**
 * hooks/useTreeLayout.ts — Memoized tree layout computation.
 *
 * Combines all treeBuilder functions into one hook.
 * Only recomputes when people or filterEra changes.
 */

import { useMemo } from 'react';
import { computeFullLayout, type TreeLayoutResult } from '../utils/treeBuilder';
import type { Person } from '../types';

export function useTreeLayout(
  people: Person[],
  filterEra: string | null = null
): TreeLayoutResult {
  return useMemo(() => {
    if (!people.length) {
      return {
        nodes: [],
        links: [],
        marriageBars: [],
        spouseConnectors: [],
        associationLinks: [],
        spineIds: new Set<string>(),
        bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 },
      };
    }
    return computeFullLayout(people, filterEra === 'all' ? null : filterEra);
  }, [people, filterEra]);
}
