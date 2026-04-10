/**
 * services/ContentUpdater.ts — OTA content database updater.
 *
 * Checks a remote manifest for newer DB versions, then applies
 * either a delta SQL patch or a full DB replacement. Part of
 * epic #758 (CloudFlare R2 Delta DB Delivery).
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { inflate } from 'pako';
import { logger } from '../utils/logger';

// ── Constants ────────────────────────────────────────────────

const TAG = 'ContentUpdater';
const MANIFEST_URL = 'https://contentcompanionstudy.com/db/manifest.json';
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const SQLITE_DIR = `${FileSystem.documentDirectory}SQLite/`;
const DB_PATH = `${SQLITE_DIR}scripture.db`;
const BACKUP_PATH = `${SQLITE_DIR}scripture_backup.db`;

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
      tempDb = await SQLite.openDatabaseAsync('scripture.db');
      const row = await tempDb.getFirstAsync<{ value: string }>(
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
    const tempPath = `${SQLITE_DIR}delta_temp.sql.gz`;
    try {
      // Download gzipped delta
      const download = await FileSystem.downloadAsync(delta.url, tempPath);
      if (download.status !== 200) {
        throw new Error(`Delta download failed: HTTP ${download.status}`);
      }

      // Verify checksum of the compressed file
      await this.verifyChecksum(tempPath, delta.sha256);

      // Read and decompress
      const compressed = await FileSystem.readAsStringAsync(tempPath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = Uint8Array.from(atob(compressed), (c) => c.charCodeAt(0));
      const sql = new TextDecoder().decode(inflate(bytes));

      // Backup current DB before modifying
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
        }
        await this.restoreFromBackup();
        throw err;
      } finally {
        if (updateDb) {
          await updateDb.closeAsync();
        }
      }

      // Success — remove backup and temp file
      await FileSystem.deleteAsync(BACKUP_PATH, { idempotent: true });
      await FileSystem.deleteAsync(tempPath, { idempotent: true });

      logger.info(TAG, `Delta applied: ${delta.from_version} → ${delta.to_version}`);
      return {
        status: 'updated',
        fromVersion: delta.from_version,
        toVersion: delta.to_version,
        updateType: 'delta',
        bytesDownloaded: delta.size_bytes,
      };
    } catch (err) {
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
      const message = err instanceof Error ? err.message : String(err);
      logger.error(TAG, 'Delta application failed', err);
      return { status: 'failed', error: message };
    }
  }

  /**
   * Download a complete replacement database from R2.
   * Downloads to a temp file, verifies checksum, then swaps in place.
   */
  async downloadFullDb(manifest: Manifest): Promise<UpdateResult> {
    const tempPath = `${SQLITE_DIR}scripture_download.db`;
    try {
      const fromVersion = await this.getInstalledVersion();

      // Download the full DB
      const download = await FileSystem.downloadAsync(manifest.full_db_url, tempPath);
      if (download.status !== 200) {
        throw new Error(`Full DB download failed: HTTP ${download.status}`);
      }

      // Verify checksum
      await this.verifyChecksum(tempPath, manifest.full_db_sha256);

      // Backup current DB, then swap
      await this.backupCurrentDb();

      await FileSystem.deleteAsync(DB_PATH, { idempotent: true });
      await FileSystem.moveAsync({ from: tempPath, to: DB_PATH });

      // Verify the new DB can be opened and has the expected content_hash
      let verifyDb: SQLite.SQLiteDatabase | null = null;
      try {
        verifyDb = await SQLite.openDatabaseAsync('scripture.db');
        const row = await verifyDb.getFirstAsync<{ value: string }>(
          "SELECT value FROM db_meta WHERE key = 'content_hash'",
        );
        if (row?.value !== manifest.current_version) {
          throw new Error(
            `Content hash mismatch after download: expected ${manifest.current_version}, got ${row?.value}`,
          );
        }
      } catch (err) {
        if (verifyDb) await verifyDb.closeAsync();
        await this.restoreFromBackup();
        throw err;
      } finally {
        if (verifyDb) await verifyDb.closeAsync();
      }

      // Success — remove backup
      await FileSystem.deleteAsync(BACKUP_PATH, { idempotent: true });

      logger.info(TAG, `Full DB downloaded: v${manifest.current_version}`);
      return {
        status: 'updated',
        fromVersion: fromVersion ?? undefined,
        toVersion: manifest.current_version,
        updateType: 'full',
        bytesDownloaded: manifest.full_db_size_bytes,
      };
    } catch (err) {
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
      const message = err instanceof Error ? err.message : String(err);
      logger.error(TAG, 'Full DB download failed', err);
      return { status: 'failed', error: message };
    }
  }

  // ── Helpers ──────────────────────────────────────────────

  /**
   * Copy the current scripture.db to a backup location.
   */
  private async backupCurrentDb(): Promise<void> {
    const info = await FileSystem.getInfoAsync(DB_PATH);
    if (info.exists) {
      await FileSystem.copyAsync({ from: DB_PATH, to: BACKUP_PATH });
      logger.info(TAG, 'Database backed up');
    }
  }

  /**
   * Restore scripture.db from the backup copy after a failed update.
   */
  private async restoreFromBackup(): Promise<void> {
    const info = await FileSystem.getInfoAsync(BACKUP_PATH);
    if (info.exists) {
      await FileSystem.deleteAsync(DB_PATH, { idempotent: true });
      await FileSystem.moveAsync({ from: BACKUP_PATH, to: DB_PATH });
      logger.warn(TAG, 'Database restored from backup');
    }
  }

  /**
   * Validate that a downloaded file matches the expected SHA-256 hash.
   */
  private async verifyChecksum(filePath: string, expectedSha256: string): Promise<void> {
    const content = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      content,
      { encoding: Crypto.CryptoEncoding.BASE64 },
    );
    // Convert base64 hash to hex for comparison with manifest
    const hashHex = Array.from(atob(hash), (c) =>
      c.charCodeAt(0).toString(16).padStart(2, '0'),
    ).join('');
    if (hashHex !== expectedSha256) {
      throw new Error(
        `Checksum mismatch: expected ${expectedSha256.slice(0, 16)}..., got ${hashHex.slice(0, 16)}...`,
      );
    }
  }
}

export const ContentUpdater = new ContentUpdaterService();
