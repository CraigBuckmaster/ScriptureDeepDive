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
      getDiscoveryVerseLinks(discoveryId),
      getDiscoveryImages(discoveryId),
    ])
      .then(([d, vl, imgs]) => {
        if (mountedRef.current) {
          setDiscovery(d);
          setVerseLinks(vl);
          setImages(imgs);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [discoveryId]);

  return { discovery, verseLinks, images, loading };
}
