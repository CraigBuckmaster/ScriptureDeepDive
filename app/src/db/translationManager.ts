/**
 * db/translationManager.ts — Download, install, and open on-demand translations.
 *
 * Bundled translations (NIV, KJV) live in scripture.db and need no management.
 * Downloadable translations (ESV, ASV, future) are separate .db files that the
 * user installs on demand. Each is a small SQLite database (~4-5 MB) containing
 * the verses table + FTS index for that translation.
 *
 * Lifecycle:
 *   1. User taps a non-bundled translation in the picker
 *   2. If not installed → download .db from bundled assets (or network in future)
 *   3. Copy to SQLite directory, open a DB connection, cache it
 *   4. Verse queries route to the supplemental DB for that translation
 *   5. User can delete installed translations from Settings to reclaim space
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { TRANSLATION_MAP, type TranslationInfo } from './translationRegistry';
import { logger } from '../utils/logger';

/** Cache of open DB connections for supplemental translations. */
const openDbs = new Map<string, SQLite.SQLiteDatabase>();

/** In-flight download promises to avoid duplicate downloads. */
const pendingDownloads = new Map<string, Promise<void>>();

/** Directory where supplemental translation DBs are stored on device. */
function getSqliteDir(): string {
  return `${FileSystem.documentDirectory}SQLite/`;
}

/** On-device path for a translation's DB file. */
function getTranslationDbPath(translationId: string): string {
  return `${getSqliteDir()}translation_${translationId}.db`;
}

/**
 * Check if a downloadable translation is installed on device.
 */
export async function isTranslationInstalled(translationId: string): Promise<boolean> {
  const info = TRANSLATION_MAP.get(translationId);
  if (!info || info.bundled) return true; // bundled = always available
  const fileInfo = await FileSystem.getInfoAsync(getTranslationDbPath(translationId));
  return fileInfo.exists && (fileInfo.size ?? 0) > 1000;
}

/**
 * Get installed size in bytes (0 if not installed).
 */
export async function getInstalledSize(translationId: string): Promise<number> {
  const fileInfo = await FileSystem.getInfoAsync(getTranslationDbPath(translationId));
  return fileInfo.exists ? (fileInfo.size ?? 0) : 0;
}

// Asset map for downloadable translation DB files.
// require() calls must be static for Metro bundler, so we enumerate them here.
// Add entries here when new licensed translations are ready.
const TRANSLATION_ASSETS: Record<string, number> = {
  // Future: esv: require('../../assets/translations/esv.db'),
  // Future: niv: require('../../assets/translations/niv.db'),
};

/**
 * Download and install a supplemental translation.
 * Currently copies from bundled app assets. In the future this could
 * fetch from a CDN for translations not shipped with the binary.
 *
 * @param onProgress Optional callback with progress 0-1
 */
export async function downloadTranslation(
  translationId: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  // Deduplicate concurrent downloads
  const existing = pendingDownloads.get(translationId);
  if (existing) return existing;

  const promise = _doDownload(translationId, onProgress).finally(() => {
    pendingDownloads.delete(translationId);
  });
  pendingDownloads.set(translationId, promise);
  return promise;
}

async function _doDownload(
  translationId: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  const info = TRANSLATION_MAP.get(translationId);
  if (!info || info.bundled) return;

  if (Platform.OS === 'web') {
    logger.warn('TranslationManager', 'Downloads not supported on web');
    return;
  }

  logger.info('TranslationManager', `Installing translation: ${translationId}`);
  onProgress?.(0.1);

  const dbPath = getTranslationDbPath(translationId);
  const sqliteDir = getSqliteDir();
  await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });

  // Delete existing if present (re-download)
  await FileSystem.deleteAsync(dbPath, { idempotent: true });

  // Resolve the bundled asset
  const assetModule = TRANSLATION_ASSETS[translationId];
  if (!assetModule) {
    throw new Error(`No asset found for translation: ${translationId}`);
  }

  onProgress?.(0.3);
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error(`Failed to resolve asset for translation: ${translationId}`);
  }

  onProgress?.(0.7);
  await FileSystem.copyAsync({ from: asset.localUri, to: dbPath });

  const copied = await FileSystem.getInfoAsync(dbPath);
  logger.info('TranslationManager',
    `Installed ${translationId}.db (${((copied.size || 0) / 1024 / 1024).toFixed(1)} MB)`
  );
  onProgress?.(1.0);
}

/**
 * Open (or return cached) DB connection for a supplemental translation.
 * Throws if the translation is not installed.
 */
export async function openTranslationDb(translationId: string): Promise<SQLite.SQLiteDatabase> {
  const cached = openDbs.get(translationId);
  if (cached) return cached;

  const installed = await isTranslationInstalled(translationId);
  if (!installed) {
    throw new Error(`Translation not installed: ${translationId}. Call downloadTranslation() first.`);
  }

  const dbName = `translation_${translationId}.db`;
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.execAsync('PRAGMA journal_mode=WAL');
  openDbs.set(translationId, db);
  return db;
}

/**
 * Delete an installed supplemental translation to free space.
 */
export async function deleteTranslation(translationId: string): Promise<void> {
  // Close DB if open
  const db = openDbs.get(translationId);
  if (db) {
    await db.closeAsync();
    openDbs.delete(translationId);
  }

  const dbPath = getTranslationDbPath(translationId);
  await FileSystem.deleteAsync(dbPath, { idempotent: true });
  logger.info('TranslationManager', `Deleted translation: ${translationId}`);
}

/**
 * Close all open supplemental translation DBs. Call on app shutdown if needed.
 */
export async function closeAllTranslationDbs(): Promise<void> {
  for (const [id, db] of openDbs) {
    await db.closeAsync();
    logger.info('TranslationManager', `Closed translation DB: ${id}`);
  }
  openDbs.clear();
}
