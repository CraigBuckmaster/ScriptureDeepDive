/**
 * useHarmonyData — Load, group by period, filter, and search Gospel harmony entries.
 */

import { useState, useEffect, useMemo } from 'react';
import { getHarmonyEntries } from '../db/content';
import type { HarmonyEntry } from '../types';

const PERIOD_LABELS: Record<string, string> = {
  birth: 'Birth & Infancy',
  early_ministry: 'Early Ministry',
  galilean: 'Galilean Ministry',
  later_judean: 'Later Ministry',
  journey: 'Journey to Jerusalem',
  passion: 'Passion & Death',
  resurrection: 'Resurrection & Ascension',
};

const PERIOD_ORDER = [
  'birth', 'early_ministry', 'galilean', 'later_judean',
  'journey', 'passion', 'resurrection',
];

export interface HarmonySection {
  period: string;
  label: string;
  data: HarmonyEntry[];
}

export interface UseHarmonyDataResult {
  sections: HarmonySection[];
  periods: string[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  periodFilter: string;
  setPeriodFilter: (p: string) => void;
}

export function useHarmonyData(): UseHarmonyDataResult {
  const [entries, setEntries] = useState<HarmonyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    getHarmonyEntries().then((e) => {
      setEntries(e);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (periodFilter !== 'all') {
      list = list.filter((e) => e.period === periodFilter);
    }
    if (search.length >= 2) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    return list;
  }, [entries, periodFilter, search]);

  const sections = useMemo(() => {
    const groups = new Map<string, HarmonyEntry[]>();
    for (const entry of filtered) {
      const period = entry.period ?? 'galilean';
      if (!groups.has(period)) groups.set(period, []);
      groups.get(period)!.push(entry);
    }
    return PERIOD_ORDER
      .filter((p) => groups.has(p))
      .map((p) => ({
        period: p,
        label: PERIOD_LABELS[p] ?? p,
        data: groups.get(p)!,
      }));
  }, [filtered]);

  const periods = useMemo(() => {
    const uniquePeriods = new Set(entries.map((e) => e.period).filter(Boolean));
    return PERIOD_ORDER.filter((p) => uniquePeriods.has(p));
  }, [entries]);

  return { sections, periods, loading, search, setSearch, periodFilter, setPeriodFilter };
}

export { PERIOD_LABELS };
