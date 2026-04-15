import { useState, useEffect } from 'react';
import { getRedemptiveActs, getRedemptiveAct } from '../db/content';
import { safeParse } from '../utils/logger';
import type { RedemptiveAct } from '../types';

/** Parsed act with JSON fields deserialized. */
export interface ParsedRedemptiveAct {
  id: string;
  act_order: number;
  name: string;
  tagline: string | null;
  summary: string | null;
  key_verse: { ref: string; text: string } | null;
  era_ids: string[];
  book_range: string | null;
  threads: string[];
  prophecy_chains: string[];
}

function parseAct(row: RedemptiveAct): ParsedRedemptiveAct {
  return {
    ...row,
    key_verse: safeParse<{ ref: string; text: string } | null>(row.key_verse, null, 'useRedemptiveArc.key_verse'),
    era_ids: safeParse<string[]>(row.era_ids, [], 'useRedemptiveArc.era_ids'),
    threads: safeParse<string[]>(row.threads, [], 'useRedemptiveArc.threads'),
    prophecy_chains: safeParse<string[]>(row.prophecy_chains, [], 'useRedemptiveArc.chains'),
  };
}

export function useRedemptiveArc() {
  const [acts, setActs] = useState<ParsedRedemptiveAct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRedemptiveActs().then((rows) => {
      setActs(rows.map(parseAct));
      setIsLoading(false);
    });
  }, []);

  return { acts, isLoading };
}

/** Get a single act by ID (for bottom sheet). */
export function useRedemptiveActDetail(actId: string | null) {
  const [act, setAct] = useState<ParsedRedemptiveAct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!actId) { setIsLoading(false); return; }
    getRedemptiveAct(actId).then((row) => {
      setAct(row ? parseAct(row) : null);
      setIsLoading(false);
    });
  }, [actId]);

  return { act, isLoading };
}
