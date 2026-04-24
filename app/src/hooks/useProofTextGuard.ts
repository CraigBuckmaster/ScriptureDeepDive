import { useEffect, useState } from 'react';
import { getProofTextGuard } from '../db/content';
import type { ProofTextGuard } from '../types';
import { logger } from '../utils/logger';

export function useProofTextGuard(bookId: string, chapterNum: number, verseNum?: number | null) {
  const [guard, setGuard] = useState<ProofTextGuard | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!verseNum) {
      return;
    }

    getProofTextGuard(bookId, chapterNum, verseNum)
      .then((row) => {
        if (!cancelled) setGuard(row);
      })
      .catch((err) => {
        logger.warn('useProofTextGuard', 'Failed to load proof-text guard', err);
        if (!cancelled) setGuard(null);
      });

    return () => {
      cancelled = true;
    };
  }, [bookId, chapterNum, verseNum]);

  return verseNum ? guard : null;
}
