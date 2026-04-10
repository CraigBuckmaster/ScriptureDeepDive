import { useState, useEffect } from 'react';
import { getEras } from '../db/content';
import { safeParse } from '../utils/logger';
import type { EraRow } from '../db/content';

/** Parsed era with JSON fields already deserialized. */
export interface ParsedEra {
  id: string;
  name: string;
  pill: string | null;
  hex: string | null;
  range_start: number | null;
  range_end: number | null;
  summary: string | null;
  narrative: string | null;
  key_themes: string[];
  key_people: string[];
  books: string[];
  chapter_range: string | null;
  geographic_center: { region: string; place_ids: string[] } | null;
  redemptive_thread: string | null;
  transition_to_next: string | null;
}

function parseEra(row: EraRow): ParsedEra {
  return {
    ...row,
    key_themes: safeParse<string[]>(row.key_themes, [], 'useEras.key_themes'),
    key_people: safeParse<string[]>(row.key_people, [], 'useEras.key_people'),
    books: safeParse<string[]>(row.books, [], 'useEras.books'),
    geographic_center: safeParse<{ region: string; place_ids: string[] } | null>(row.geographic_center, null, 'useEras.geographic_center'),
  };
}

export function useEras() {
  const [eras, setEras] = useState<ParsedEra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getEras().then((rows) => {
      setEras(rows.map(parseEra));
      setIsLoading(false);
    });
  }, []);

  return { eras, isLoading };
}
