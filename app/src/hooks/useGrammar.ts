/**
 * hooks/useGrammar.ts — Load grammar articles and decode morphology codes.
 */

import { useState, useEffect, useMemo } from 'react';
import { getGrammarArticle } from '../db/content/grammar';
import { decodeMorphology } from '../utils/morphologyDecoder';
import type { GrammarArticle } from '../types';
import type { DecodedMorphology } from '../utils/morphologyDecoder';

export function useGrammarArticle(articleId: string | null) {
  const [article, setArticle] = useState<GrammarArticle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!articleId) {
      setArticle(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getGrammarArticle(articleId).then((a) => {
      if (cancelled) return;
      setArticle(a);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [articleId]);

  return { article, loading };
}

export function useMorphologyDecode(code: string | null): DecodedMorphology | null {
  return useMemo(() => {
    if (!code) return null;
    return decodeMorphology(code);
  }, [code]);
}
