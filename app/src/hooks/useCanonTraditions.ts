/**
 * useCanonTraditions — Loads all canon traditions and computes the
 * book-diff used by CanonComparisonScreen (HWGTB-P3-01 / #1550).
 *
 * A book is "common" when it appears in all four seeded traditions.
 * All other books are badged with the set of tradition-ids that
 * include them, so the UI can highlight where traditions diverge.
 */

import { useEffect, useMemo, useState } from 'react';
import { getAllCanonTraditions } from '../db/content';
import type { CanonTradition } from '../types';
import { logger } from '../utils/logger';

export interface UseCanonTraditionsResult {
  traditions: CanonTradition[];
  loading: boolean;
  /** Set of book-ids present in every tradition (commonality index). */
  commonBookIds: Set<string>;
  /** book-id → set of tradition-ids that include it. */
  bookMembership: Map<string, Set<string>>;
}

export function useCanonTraditions(): UseCanonTraditionsResult {
  const [traditions, setTraditions] = useState<CanonTradition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllCanonTraditions()
      .then((rows) => {
        if (!cancelled) {
          setTraditions(rows);
          setLoading(false);
        }
      })
      .catch((err) => {
        logger.error('useCanonTraditions', 'Failed to load', err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { commonBookIds, bookMembership } = useMemo(
    () => computeBookMembership(traditions),
    [traditions],
  );

  return { traditions, loading, commonBookIds, bookMembership };
}

/**
 * Build the cross-tradition book membership. A book appears as "common"
 * only if every tradition includes it — that's the small intersection at
 * the center of the Venn diagram. All other books carry a set of the
 * tradition-ids that contain them so columns can badge them.
 */
export function computeBookMembership(traditions: CanonTradition[]): {
  commonBookIds: Set<string>;
  bookMembership: Map<string, Set<string>>;
} {
  const bookMembership = new Map<string, Set<string>>();
  for (const tr of traditions) {
    for (const section of tr.canon_list) {
      for (const bookId of section.books) {
        const existing = bookMembership.get(bookId);
        if (existing) {
          existing.add(tr.id);
        } else {
          bookMembership.set(bookId, new Set<string>([tr.id]));
        }
      }
    }
  }

  const total = traditions.length;
  const commonBookIds = new Set<string>();
  if (total > 0) {
    for (const [bookId, trSet] of bookMembership.entries()) {
      if (trSet.size === total) commonBookIds.add(bookId);
    }
  }

  return { commonBookIds, bookMembership };
}
