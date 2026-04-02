/**
 * hooks/useLexicon.ts — Load a lexicon entry and its related words.
 */

import { useState, useEffect } from 'react';
import { getLexiconEntry, getLexiconEntries } from '../db/content';
import type { LexiconEntry } from '../types/lexicon';

export function useLexicon(strongs: string | null) {
  const [entry, setEntry] = useState<LexiconEntry | null>(null);
  const [related, setRelated] = useState<LexiconEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!strongs) {
      setEntry(null);
      setRelated([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getLexiconEntry(strongs).then(async (e) => {
      if (cancelled) return;
      setEntry(e);
      if (e?.related_strongs_json) {
        try {
          const relIds: string[] = JSON.parse(e.related_strongs_json);
          if (relIds.length > 0) {
            const relEntries = await getLexiconEntries(relIds);
            if (!cancelled) setRelated(relEntries);
          }
        } catch { /* */ }
      } else {
        setRelated([]);
      }
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [strongs]);

  return { entry, related, loading };
}
