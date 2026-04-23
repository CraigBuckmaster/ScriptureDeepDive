/**
 * useExtraBiblicalEntry — loads one parsed ExtrabiblicalEntry by id.
 * Used by ExtraBiblicalDetailScreen (HWGTB-P2-03 / #1548).
 */

import { useEffect, useState } from 'react';
import { getExtraBiblicalEntry } from '../db/content';
import type { ExtrabiblicalEntry } from '../types';
import { logger } from '../utils/logger';

export interface UseExtraBiblicalEntryResult {
  entry: ExtrabiblicalEntry | null;
  loading: boolean;
}

export function useExtraBiblicalEntry(id: string | undefined): UseExtraBiblicalEntryResult {
  const [entry, setEntry] = useState<ExtrabiblicalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntry(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getExtraBiblicalEntry(id)
      .then((e) => {
        if (!cancelled) {
          setEntry(e);
          setLoading(false);
        }
      })
      .catch((err) => {
        logger.error('useExtraBiblicalEntry', 'load failed', err);
        if (!cancelled) {
          setEntry(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { entry, loading };
}
