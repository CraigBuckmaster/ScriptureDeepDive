/**
 * services/ContentUpdater.ts — OTA content database updater.
 *
 * Checks a remote manifest for newer DB versions, then applies
 * either a delta SQL patch or a full DB replacement. Part of
 * epic #758 (CloudFlare R2 Delta DB Delivery).
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { logger } from '../utils/logger';

// ── Constants ────────────────────────────────────────────────

const TAG = 'ContentUpdater';
const MANIFEST_URL = 'https://contentcompanionstudy.com/db/manifest.json';
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

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
   * Read the installed DB version from the db_meta table.
   * Returns null if the table doesn't exist or the DB isn't present.
   */
  async getInstalledVersion(): Promise<string | null> {
    let tempDb: SQLite.SQLiteDatabase | null = null;
    try {
      tempDb = await SQLite.openDatabaseAsync('scripture.db');
      const row = await tempDb.getFirstAsync<{ value: string }>(
        "SELECT value FROM db_meta WHERE key = 'version'",
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
   * Apply a delta SQL patch. Stub — implemented in card #1182.
   */
  async applyDelta(_delta: ManifestDelta): Promise<UpdateResult> {
    // TODO: implement in card #1182
    logger.warn(TAG, 'applyDelta is a stub — falling back to full download');
    return { status: 'failed', error: 'Delta application not yet implemented' };
  }

  /**
   * Download and replace the full database. Stub — implemented in card #1182.
   */
  async downloadFullDb(_manifest: Manifest): Promise<UpdateResult> {
    // TODO: implement in card #1182
    logger.warn(TAG, 'downloadFullDb is a stub — not yet implemented');
    return { status: 'failed', error: 'Full DB download not yet implemented' };
  }
}

export const ContentUpdater = new ContentUpdaterService();
