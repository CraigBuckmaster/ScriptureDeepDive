/**
 * hooks/useArchaeology.ts — Data hooks for Archaeological Evidence feature.
 *
 * Provides browse (all discoveries with category filter + search)
 * and detail view (full discovery + verse links).
 */

import { useState, useEffect, useRef } from 'react';
import { useAsyncData } from './useAsyncData';
import {
  getAllDiscoveries,
  getDiscovery,
  getDiscoveriesByCategory,
  searchDiscoveries,
  getDiscoveryVerseLinks,
  getDiscoveryImages,
} from '../db/content/archaeology';
import type { ArchaeologicalDiscovery, ArchaeologyVerseLink, ArchaeologyImage } from '../types';

export function useArchaeologyBrowse(category?: string) {
  return useAsyncData<ArchaeologicalDiscovery[]>(
    () => category ? getDiscoveriesByCategory(category) : getAllDiscoveries(),
    [category],
    [],
  );
}

export function useArchaeologySearch() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ArchaeologicalDiscovery[]>([]);
  const [searching, setSearching] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      searchDiscoveries(search)
        .then((r) => {
          if (mountedRef.current) {
            setResults(r);
            setSearching(false);
          }
        })
        .catch(() => {
          if (mountedRef.current) setSearching(false);
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  return { search, setSearch, results, searching };
}

export interface ArchaeologyDetailData {
  discovery: ArchaeologicalDiscovery | null;
  verseLinks: ArchaeologyVerseLink[];
  images: ArchaeologyImage[];
  loading: boolean;
}

/** Parse images_json from the discovery row, falling back to empty array. */
function parseInlineImages(discovery: ArchaeologicalDiscovery | null): ArchaeologyImage[] {
  if (!discovery?.images_json) return [];
  try {
    const parsed = JSON.parse(discovery.images_json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((img: Record<string, unknown>, idx: number) => ({
      id: idx,
      discovery_id: discovery.id,
      url: String(img.url ?? ''),
      caption: img.caption ? String(img.caption) : undefined,
      credit: img.credit ? String(img.credit) : undefined,
      display_order: idx,
    }));
  } catch {
    return [];
  }
}

export function useArchaeologyDetail(discoveryId: string): ArchaeologyDetailData {
  const [discovery, setDiscovery] = useState<ArchaeologicalDiscovery | null>(null);
  const [verseLinks, setVerseLinks] = useState<ArchaeologyVerseLink[]>([]);
  const [images, setImages] = useState<ArchaeologyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDiscovery(discoveryId),
      getDiscoveryVerseLinks(discoveryId).catch(() => [] as ArchaeologyVerseLink[]),
      getDiscoveryImages(discoveryId).catch(() => [] as ArchaeologyImage[]),
    ])
      .then(([d, vl, imgs]) => {
        if (mountedRef.current) {
          setDiscovery(d);
          setVerseLinks(vl);
          // Prefer images from the separate table; fall back to inline JSON
          setImages(imgs.length > 0 ? imgs : parseInlineImages(d));
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [discoveryId]);

  return { discovery, verseLinks, images, loading };
}
