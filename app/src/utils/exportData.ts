/**
 * utils/exportData.ts — Export user study data (notes, bookmarks, highlights).
 *
 * Queries user.db, writes a JSON file to cache, and opens the native share sheet.
 * All dependencies (expo-file-system, expo-sharing) are OTA-safe.
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getUserDb } from '../db/userDatabase';
import { logger } from './logger';

interface ExportedNote {
  id: number;
  verse_ref: string;
  note_text: string;
  tags_json: string | null;
  collection_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ExportedBookmark {
  id: number;
  verse_ref: string;
  label: string | null;
  created_at: string | null;
}

interface ExportedHighlight {
  id: number;
  verse_ref: string;
  color: string;
  created_at: string | null;
}

interface ExportedCollection {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string | null;
  updated_at: string | null;
}

interface ExportPayload {
  exported_at: string;
  app_version: string;
  notes: ExportedNote[];
  bookmarks: ExportedBookmark[];
  highlights: ExportedHighlight[];
  collections: ExportedCollection[];
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const APP_VERSION: string = (require('../../app.json') as any).expo.version ?? '1.0.0';

/**
 * Export all user study data to a JSON file and open the system share sheet.
 * Returns true on success, throws on failure.
 */
export async function exportStudyData(): Promise<boolean> {
  const db = getUserDb();

  const [notes, bookmarks, highlights, collections] = await Promise.all([
    db.getAllAsync<ExportedNote>(
      'SELECT id, verse_ref, note_text, tags_json, collection_id, created_at, updated_at FROM user_notes ORDER BY created_at DESC'
    ),
    db.getAllAsync<ExportedBookmark>(
      'SELECT id, verse_ref, label, created_at FROM bookmarks ORDER BY created_at DESC'
    ),
    db.getAllAsync<ExportedHighlight>(
      'SELECT id, verse_ref, color, created_at FROM verse_highlights ORDER BY created_at DESC'
    ),
    db.getAllAsync<ExportedCollection>(
      'SELECT id, name, description, color, created_at, updated_at FROM study_collections ORDER BY created_at DESC'
    ),
  ]);

  const payload: ExportPayload = {
    exported_at: new Date().toISOString(),
    app_version: APP_VERSION,
    notes,
    bookmarks,
    highlights,
    collections,
  };

  const totalItems = notes.length + bookmarks.length + highlights.length;
  if (totalItems === 0) {
    throw new ExportError('Nothing to export — no notes, bookmarks, or highlights found.');
  }

  const dateStamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const fileName = `companion-study-export-${dateStamp}.json`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(payload, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new ExportError('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(filePath, {
    mimeType: 'application/json',
    dialogTitle: 'Export Study Data',
    UTI: 'public.json',
  });

  logger.info('exportData', `Exported ${notes.length} notes, ${bookmarks.length} bookmarks, ${highlights.length} highlights`);
  return true;
}

/** Custom error class so callers can distinguish "no data" from real failures. */
export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportError';
  }
}
