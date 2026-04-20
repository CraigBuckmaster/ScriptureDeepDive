/**
 * services/ContentUpdater.ts — OTA content database updater.
 *
 * Checks a remote manifest for newer DB versions, then applies
 * either a delta SQL patch or a full DB replacement. Part of
 * epic #758 (CloudFlare R2 Delta DB Delivery).
 *
 * Uses the SDK 54 `expo-file-system` File/Directory/Paths API. The
 * legacy (`expo-file-system/legacy`) shim is broken under the New
 * Architecture and causes an Obj-C rethrow from RCTTurboModule on
 * download completion — see the 1.0.5 TestFlight crash log.
 */

import { File, Directory, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { inflate } from 'pako';
import { logger } from '../utils/logger';
import { closeDatabaseConnection, getDbIfInitialized, reloadDatabase } from '../db/database';

// ── Constants ────────────────────────────────────────────────

const TAG = 'ContentUpdater';
const MANIFEST_URL = 'https://contentcompanionstudy.com/db/manifest.json';
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const SQLITE_SUBDIR = 'SQLite';
const DB_NAME = 'scripture.db';
const BACKUP_NAME = 'scripture_backup.db';
const DELTA_TEMP_NAME = 'delta_temp.sql.gz';
const DOWNLOAD_TEMP_NAME = 'scripture_download.db';
const LARGE_DB_NATIVE_DOWNLOAD_THRESHOLD_BYTES = 25 * 1024 * 1024;

function sqliteDir(): Directory {
  return new Directory(Paths.document, SQLITE_SUBDIR);
}

function sqliteFile(name: string): File {
  return new File(Paths.document, SQLITE_SUBDIR, name);
}

/** Silently delete a file that may or may not exist (idempotent). */
function safeDelete(file: File): void {
  if (!file.exists) return;
  try {
    file.delete();
  } catch (err) {
    logger.warn(TAG, `delete failed for ${file.uri}`, err);
  }
}

// ── Types ────────────────────────────────────────────────────

export interface ManifestDelta {
  from_version: string;
  to_version: string;
  url: string;
  sha256: string;
  size_bytes: number;
}

export interface Manifest {
  current_version: string;
  min_supported_version: string;
  full_db_url: string;
  full_db_sha256: string;
  full_db_size_bytes: number;
  deltas: ManifestDelta[];
  updated_at: string;
}

export interface UpdateResult {
  status: 'up_to_date' | 'updated' | 'failed';
  fromVersion?: string;
  toVersion?: string;
  updateType?: 'delta' | 'full';
  bytesDownloaded?: number;
  error?: string;
}

// ── Service ──────────────────────────────────────────────────
//
// TODO (future architecture): migrate OTA apply from close-and-reopen
// to defer-to-cold-start.
//
// Current approach: when an update is ready, we close the live DB
// handle, apply the swap on disk, then reopen. This works but is
// fragile — any code holding a `getDb()` reference across an `await`
// that spans an update will have a stale handle, and any in-flight
// query at close time surfaces as a cryptic SQLite error.
//
// The safer architecture is to never close a running DB for an update
// at all. Instead:
//   1. Download the new DB to a pending-update temp path.
//   2. Write a tiny marker file indicating an update is pending.
//   3. Do NOT swap during the running session.
//   4. On next app cold-start, BEFORE initDatabase() opens scripture.db,
//      check for the pending marker. If present, swap the files while
//      no SQLite connection exists, then delete the marker and proceed
//      with normal startup.
//
// This trades "users see updates within seconds" for "users see updates
// on next launch." For a Bible study app with scholarly content updates
// (rather than safety-critical data), that's an acceptable tradeoff and
// eliminates an entire class of concurrency bugs by design.
//
// The tri-commit close/reopen logic below is phase-1. Phase-2 replaces
// it with the cold-start-swap architecture. See PR #1532 / #1533
// discussion for context.
//
// In the interim, the `if (!closedCleanly) return up_to_date` safety
// valve below (ContentUpdaterService.applyDelta + downloadFullDb) ensures
// a failed close aborts the update rather than corrupting the DB file.

class ContentUpdaterService {
  private lastCheckTime = 0;

  /**
   * Main entry point. Checks remote manifest and applies updates
   * if a newer version is available.
   */
  async checkForUpdates(): Promise<UpdateResult> {
    try {
      const manifest = await this.fetchManifest();
      const installedVersion = await this.getInstalledVersion();

      if (installedVersion === manifest.current_version) {
        logger.info(TAG, `Already on latest version (${installedVersion})`);
        return { status: 'up_to_date' };
      }

      logger.info(
        TAG,
        `Update available: ${installedVersion ?? 'none'} → ${manifest.current_version}`,
      );

      // Try delta first if we have an installed version
      if (installedVersion) {
        const delta = this.findDelta(manifest, installedVersion);
        if (delta) {
          logger.info(TAG, `Applying delta ${delta.from_version} → ${delta.to_version}`);
          return await this.applyDelta(delta);
        }
      }

      // Fall back to full download
      logger.info(TAG, 'No applicable delta — downloading full DB');
      return await this.downloadFullDb(manifest);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(TAG, 'Update check failed', err);
      return { status: 'failed', error: message };
    } finally {
      this.lastCheckTime = Date.now();
    }
  }

  /**
   * Debounce: returns true if at least CHECK_INTERVAL_MS has elapsed
   * since the last check.
   */
  shouldCheckForUpdates(): boolean {
    return Date.now() - this.lastCheckTime >= CHECK_INTERVAL_MS;
  }

  /**
   * Fetch the remote manifest.json from R2.
   */
  async fetchManifest(): Promise<Manifest> {
    const response = await fetch(MANIFEST_URL, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      throw new Error(`Manifest fetch failed: ${response.status}`);
    }
    return (await response.json()) as Manifest;
  }

  /**
   * Read the installed DB content hash from the db_meta table.
   * Returns null if the table doesn't exist or the DB isn't present.
   */
  async getInstalledVersion(): Promise<string | null> {
    let tempDb: SQLite.SQLiteDatabase | null = null;
    try {
      // If the app already has scripture.db open, reuse that live handle.
      // Opening/closing another handle to the same file can close the active
      // connection on some SQLite wrappers, causing downstream query crashes.
      const liveDb = getDbIfInitialized();
      const queryDb = liveDb ?? await SQLite.openDatabaseAsync('scripture.db');
      if (!liveDb) tempDb = queryDb;

      const row = await queryDb.getFirstAsync<{ value: string }>(
        "SELECT value FROM db_meta WHERE key = 'content_hash'",
      );
      return row?.value ?? null;
    } catch {
      return null;
    } finally {
      if (tempDb) {
        await tempDb.closeAsync();
      }
    }
  }

  /**
   * Find a delta that upgrades from the installed version to the
   * manifest's current version.
   */
  findDelta(manifest: Manifest, installedVersion: string): ManifestDelta | null {
    return (
      manifest.deltas.find(
        (d) =>
          d.from_version === installedVersion &&
          d.to_version === manifest.current_version,
      ) ?? null
    );
  }

  /**
   * Apply a gzipped delta SQL patch.
   * Downloads the .sql.gz, verifies checksum, decompresses, executes
   * inside a transaction, and validates DB integrity afterward.
   */
  async applyDelta(delta: ManifestDelta): Promise<UpdateResult> {
    const tempFile = sqliteFile(DELTA_TEMP_NAME);
    let closedLiveDb = false;
    try {
      this.ensureSqliteDir();

      // Clear any stale temp file before downloading.
      safeDelete(tempFile);

      // Download gzipped delta. File.downloadFileAsync throws on non-2xx;
      // the legacy API returned a { status } object, so we preserve the
      // "HTTP N" error shape for parity with existing error surfaces.
      try {
        await File.downloadFileAsync(delta.url, tempFile);
      } catch (err) {
        const status = extractHttpStatus(err);
        throw new Error(
          status != null
            ? `Delta download failed: HTTP ${status}`
            : `Delta download failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Verify checksum of the compressed file
      await this.verifyChecksum(tempFile, delta.sha256);

      // Read and decompress
      const compressed = await tempFile.base64();
      const bytes = Uint8Array.from(atob(compressed), (c) => c.charCodeAt(0));
      const sql = new TextDecoder().decode(inflate(bytes));

      // Backup current DB before modifying
      closedLiveDb = getDbIfInitialized() != null;
      if (closedLiveDb) {
        const closedCleanly = await closeDatabaseConnection();
        if (!closedCleanly) {
          // Safety valve: close threw. Don't proceed with a file swap against
          // a DB that may still be open on the native side — on iOS 26 that
          // risks the FTS5 teardown crash and/or a locked-file error.
          // Skip this update and try again next launch. See PR #1534 for
          // the build 20 crash this valve protects against.
          logger.warn(TAG, 'Skipping delta apply: failed to close live DB handle');
          return { status: 'up_to_date' };
        }
      }
      await this.backupCurrentDb();

      // Apply the SQL in a transaction
      let updateDb: SQLite.SQLiteDatabase | null = null;
      try {
        updateDb = await SQLite.openDatabaseAsync('scripture.db');
        await updateDb.execAsync('BEGIN TRANSACTION');
        await updateDb.execAsync(sql);

        // Update content_hash in db_meta
        await updateDb.runAsync(
          "INSERT OR REPLACE INTO db_meta (key, value) VALUES ('content_hash', ?)",
          delta.to_version,
        );
        await updateDb.execAsync('COMMIT');

        // Verify integrity
        const check = await updateDb.getFirstAsync<{ integrity_check: string }>(
          'PRAGMA integrity_check',
        );
        if (check?.integrity_check !== 'ok') {
          throw new Error(`Integrity check failed: ${check?.integrity_check}`);
        }
      } catch (err) {
        // Rollback if still in transaction, then restore backup
        if (updateDb) {
          try {
            await updateDb.execAsync('ROLLBACK');
          } catch {
            // Transaction may already be rolled back
          }
          await updateDb.closeAsync();
          updateDb = null;
        }
        await this.restoreFromBackup();
        throw err;
      } finally {
        if (updateDb) {
          await updateDb.closeAsync();
        }
      }

      // Success — remove backup and temp file
      safeDelete(sqliteFile(BACKUP_NAME));
      safeDelete(tempFile);

      logger.info(TAG, `Delta applied: ${delta.from_version} → ${delta.to_version}`);
      if (closedLiveDb) {
        await reloadDatabase();
      }
      return {
        status: 'updated',
        fromVersion: delta.from_version,
        toVersion: delta.to_version,
        updateType: 'delta',
        bytesDownloaded: delta.size_bytes,
      };
    } catch (err) {
      safeDelete(tempFile);
      if (closedLiveDb) {
        try {
          await reloadDatabase();
        } catch (reopenErr) {
          logger.warn(TAG, 'Failed to reopen DB after delta failure', reopenErr);
        }
      }
      const message = err instanceof Error ? err.message : String(err);
      logger.error(TAG, 'Delta application failed', err);
      return { status: 'failed', error: message };
    }
  }

  /**
   * Download a complete replacement database from R2.
   * Downloads to a temp file, verifies checksum AND content hash
   * BEFORE touching the live database, then swaps in place.
   *
   * @param onProgress Optional callback receiving download percentage (0–100).
   */
  async downloadFullDb(
    manifest: Manifest,
    onProgress?: (pct: number) => void,
  ): Promise<UpdateResult> {
    const tempFile = sqliteFile(DOWNLOAD_TEMP_NAME);
    const tempDbName = DOWNLOAD_TEMP_NAME;
    let closedLiveDb = false;
    try {
      const fromVersion = await this.getInstalledVersion();

      // Ensure SQLite directory exists (first-launch fallback — scripture.db
      // may never have been opened yet, so the parent dir may not exist).
      this.ensureSqliteDir();

      // Remove any partial download from a previous failed attempt.
      safeDelete(tempFile);

      // For large payloads, prefer native File.downloadFileAsync to avoid
      // keeping the entire response body in JS memory (XHR arraybuffer can
      // spike memory on ~100 MB DBs and terminate the process on iOS).
      //
      // For smaller payloads we keep the XHR + chunked write path so the
      // first-launch screen can show exact progress.
      try {
        const shouldUseNativeDownload =
          manifest.full_db_size_bytes >= LARGE_DB_NATIVE_DOWNLOAD_THRESHOLD_BYTES;
        if (shouldUseNativeDownload) {
          onProgress?.(5);
          await File.downloadFileAsync(manifest.full_db_url, tempFile);
          onProgress?.(100);
        } else {
          await this.downloadWithProgress(manifest.full_db_url, tempFile, onProgress);
        }
      } catch (err) {
        const status = extractHttpStatus(err);
        throw new Error(
          status != null
            ? `Full DB download failed: HTTP ${status}`
            : `Full DB download failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // NOTE: Do NOT run verifyChecksum(tempFile, ...) on full DB payloads.
      // That helper reads the entire file into a base64 string and then into
      // a Uint8Array; with ~100 MB content DBs this can spike memory high
      // enough for iOS to terminate the process right after download.
      //
      // For full-db updates we validate by opening the downloaded DB and
      // checking both (1) expected content_hash in db_meta and
      // (2) PRAGMA integrity_check === 'ok' before swapping into place.
      // Delta payloads remain checksum-verified (they are much smaller).

      // Verify content hash in the downloaded DB BEFORE swapping.
      // Open by its temp filename so we never touch the live connection.
      let verifyDb: SQLite.SQLiteDatabase | null = null;
      try {
        verifyDb = await SQLite.openDatabaseAsync(tempDbName);
        const row = await verifyDb.getFirstAsync<{ value: string }>(
          "SELECT value FROM db_meta WHERE key = 'content_hash'",
        );
        if (row?.value !== manifest.current_version) {
          throw new Error(
            `Content hash mismatch after download: expected ${manifest.current_version}, got ${row?.value}`,
          );
        }
        const integrity = await verifyDb.getFirstAsync<{ integrity_check: string }>(
          'PRAGMA integrity_check',
        );
        if (integrity?.integrity_check !== 'ok') {
          throw new Error(`Integrity check failed after download: ${integrity?.integrity_check}`);
        }
      } finally {
        if (verifyDb) await verifyDb.closeAsync();
      }

      // Verification passed — now swap the live DB
      closedLiveDb = getDbIfInitialized() != null;
      if (closedLiveDb) {
        const closedCleanly = await closeDatabaseConnection();
        if (!closedCleanly) {
          // Safety valve: close threw. Same reasoning as applyDelta — on
          // iOS 26 a close failure means SQLite may still hold the file
          // open natively. Moving the temp file over it would produce
          // lock errors or trigger the FTS5 teardown crash. Abort and
          // retry next launch. See PR #1534.
          logger.warn(TAG, 'Skipping full DB swap: failed to close live DB handle');
          safeDelete(tempFile);
          return { status: 'up_to_date' };
        }
      }
      await this.backupCurrentDb();
      const dbFile = sqliteFile(DB_NAME);
      safeDelete(dbFile);
      // tempFile.move(dbFile) mutates tempFile.uri to point at dbFile; after
      // this call the downloaded bytes live at DB_NAME.
      tempFile.move(dbFile);

      // Success — remove backup
      safeDelete(sqliteFile(BACKUP_NAME));

      if (closedLiveDb) {
        await reloadDatabase();
      }

      logger.info(TAG, `Full DB downloaded: v${manifest.current_version}`);
      return {
        status: 'updated',
        fromVersion: fromVersion ?? undefined,
        toVersion: manifest.current_version,
        updateType: 'full',
        bytesDownloaded: manifest.full_db_size_bytes,
      };
    } catch (err) {
      safeDelete(tempFile);
      if (closedLiveDb) {
        try {
          await reloadDatabase();
        } catch (reopenErr) {
          logger.warn(TAG, 'Failed to reopen DB after full download failure', reopenErr);
        }
      }
      const message = err instanceof Error ? err.message : String(err);
      logger.error(TAG, 'Full DB download failed', err);
      return { status: 'failed', error: message };
    }
  }

  // ── Helpers ──────────────────────────────────────────────

  /**
   * Ensure the SQLite subdirectory exists. First-launch fallback — on a
   * fresh install scripture.db has never been opened so this dir may not
   * be on disk yet.
   */
  private ensureSqliteDir(): void {
    const dir = sqliteDir();
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }
  }

  /** Size of each chunk (in bytes) when streaming a downloaded payload to disk. */
  private static readonly WRITE_CHUNK_BYTES = 1 << 20; // 1 MiB

  /**
   * XHR-based download with progress reporting. Writes the full response
   * body to `destFile` via the new File API.
   *
   * The payload is written in {@link WRITE_CHUNK_BYTES}-sized chunks through a
   * {@link FileHandle} rather than via a single {@link File#write} call.
   * `File#write` is a synchronous Expo Modules `Function` — when invoked
   * with a large (~90 MB) `Uint8Array`, any native error thrown during the
   * write surfaces as an `NSException` from within
   * `ObjCTurboModule::performVoidMethodInvocation`. With the iOS 26 patch
   * from #1514 in place, that exception is re-thrown cleanly rather than
   * corrupting `jsi::Runtime`, but there is no `@catch` up the GCD queue
   * so the process aborts. See the 1.0.6(15)/1.0.6(16) TestFlight crash
   * logs for the terminating `RCTTurboModule.mm:446` frame.
   *
   * Chunked writes keep each individual TurboModule invocation in a size
   * range that file-system natives routinely handle without issue, and —
   * critically — wrap the write in a try/catch so any failure becomes a
   * promise rejection surfaced by {@link DbDownloadScreen} instead of a
   * process-terminating exception.
   */
  private async downloadWithProgress(
    url: string,
    destFile: File,
    onProgress?: (pct: number) => void,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable && event.total > 0 && onProgress) {
          onProgress((event.loaded / event.total) * 100);
        }
      };
      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          const httpErr = new Error(`HTTP ${xhr.status}`);
          (httpErr as Error & { httpStatus?: number }).httpStatus = xhr.status;
          reject(httpErr);
          return;
        }

        const buffer = xhr.response as ArrayBuffer | null;
        if (!buffer) {
          reject(new Error('Download returned empty body'));
          return;
        }

        const bytes = new Uint8Array(buffer);
        try {
          this.writeChunked(destFile, bytes);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          reject(new Error(
            `File write failed after ${bytes.length} bytes received: ${msg}`,
          ));
          return;
        }
        resolve();
      };
      xhr.onerror = () => reject(new Error('Download network error'));
      xhr.ontimeout = () => reject(new Error('Download timeout'));
      xhr.send();
    });
  }

  /**
   * Write `bytes` to `destFile` in {@link WRITE_CHUNK_BYTES} chunks via a
   * `FileHandle`. Any error thrown during create/open/write propagates; the
   * handle is closed via `finally` so a partial write cannot leak a handle.
   *
   * Factored out so the full write path is covered by the single try/catch
   * in {@link downloadWithProgress}.
   */
  private writeChunked(destFile: File, bytes: Uint8Array): void {
    destFile.create({ overwrite: true });
    const handle = destFile.open();
    try {
      const chunk = ContentUpdaterService.WRITE_CHUNK_BYTES;
      for (let offset = 0; offset < bytes.length; offset += chunk) {
        const end = Math.min(offset + chunk, bytes.length);
        handle.writeBytes(bytes.subarray(offset, end));
      }
    } finally {
      try {
        handle.close();
      } catch (closeErr) {
        // Closing a handle on an already-failed write shouldn't mask the
        // real error; log it and move on so the original exception surfaces.
        logger.warn(TAG, 'FileHandle close failed after chunked write', closeErr);
      }
    }
  }

  /**
   * Copy the current scripture.db to a backup location.
   */
  private async backupCurrentDb(): Promise<void> {
    const dbFile = sqliteFile(DB_NAME);
    if (!dbFile.exists) return;
    // The new File API throws if copy destination already exists — clear
    // any stale backup from an earlier aborted update first.
    const backupFile = sqliteFile(BACKUP_NAME);
    safeDelete(backupFile);
    dbFile.copy(backupFile);
    logger.info(TAG, 'Database backed up');
  }

  /**
   * Restore scripture.db from the backup copy after a failed update.
   */
  private async restoreFromBackup(): Promise<void> {
    const backupFile = sqliteFile(BACKUP_NAME);
    if (!backupFile.exists) return;
    const dbFile = sqliteFile(DB_NAME);
    safeDelete(dbFile);
    backupFile.move(dbFile);
    logger.warn(TAG, 'Database restored from backup');
  }

  /**
   * Validate that a downloaded file matches the expected SHA-256 hash.
   */
  private async verifyChecksum(file: File, expectedSha256: string): Promise<void> {
    const base64 = await file.base64();
    // Decode base64 to raw bytes, then SHA-256 the binary content
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const hashBuffer = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
    const hashHex = Array.from(new Uint8Array(hashBuffer), (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('');
    if (hashHex !== expectedSha256) {
      throw new Error(
        `Checksum mismatch: expected ${expectedSha256.slice(0, 16)}..., got ${hashHex.slice(0, 16)}...`,
      );
    }
  }
}

/**
 * Pull the HTTP status out of an error returned by File.downloadFileAsync
 * or our XHR helper. Best-effort — returns null when the error carries no
 * status hint.
 */
function extractHttpStatus(err: unknown): number | null {
  if (err && typeof err === 'object') {
    const maybe = err as { httpStatus?: unknown; status?: unknown; message?: unknown };
    if (typeof maybe.httpStatus === 'number') return maybe.httpStatus;
    if (typeof maybe.status === 'number') return maybe.status;
    if (typeof maybe.message === 'string') {
      const m = /HTTP\s+(\d{3})/i.exec(maybe.message);
      if (m) return Number(m[1]);
    }
  }
  return null;
}

export const ContentUpdater = new ContentUpdaterService();
