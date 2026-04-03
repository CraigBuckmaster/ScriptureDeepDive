/**
 * db/content/archaeology.ts — Archaeological Evidence query functions.
 *
 * Queries for archaeological discoveries with verse links and FTS search.
 */
import { getDb } from '../database';
import type { ArchaeologicalDiscovery, ArchaeologyVerseLink } from '../../types';

export async function getAllDiscoveries(): Promise<ArchaeologicalDiscovery[]> {
  return getDb().getAllAsync<ArchaeologicalDiscovery>(
    'SELECT * FROM archaeological_discoveries ORDER BY display_order'
  );
}

export async function getDiscovery(id: string): Promise<ArchaeologicalDiscovery | null> {
  return getDb().getFirstAsync<ArchaeologicalDiscovery>(
    'SELECT * FROM archaeological_discoveries WHERE id = ?',
    [id]
  );
}

export async function getDiscoveriesForChapter(
  bookId: string,
  chapterNum: number,
): Promise<ArchaeologicalDiscovery[]> {
  return getDb().getAllAsync<ArchaeologicalDiscovery>(
    `SELECT DISTINCT d.* FROM archaeological_discoveries d
     JOIN archaeology_verse_links v ON v.discovery_id = d.id
     WHERE v.verse_ref LIKE ? || ' ' || ? || ':%'
     ORDER BY d.display_order`,
    [bookId, chapterNum]
  );
}

export async function getDiscoveriesByCategory(
  category: string,
): Promise<ArchaeologicalDiscovery[]> {
  return getDb().getAllAsync<ArchaeologicalDiscovery>(
    'SELECT * FROM archaeological_discoveries WHERE category = ? ORDER BY display_order',
    [category]
  );
}

export async function searchDiscoveries(
  query: string,
): Promise<ArchaeologicalDiscovery[]> {
  return getDb().getAllAsync<ArchaeologicalDiscovery>(
    `SELECT d.* FROM archaeology_fts fts
     JOIN archaeological_discoveries d ON d.rowid = fts.rowid
     WHERE fts MATCH ?
     ORDER BY rank
     LIMIT 30`,
    [query]
  );
}

export async function getDiscoveryVerseLinks(
  discoveryId: string,
): Promise<ArchaeologyVerseLink[]> {
  return getDb().getAllAsync<ArchaeologyVerseLink>(
    'SELECT * FROM archaeology_verse_links WHERE discovery_id = ?',
    [discoveryId]
  );
}
