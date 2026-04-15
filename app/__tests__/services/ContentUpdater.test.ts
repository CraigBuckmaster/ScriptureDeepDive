/**
 * __tests__/services/ContentUpdater.test.ts
 *
 * Tests for the OTA content database updater service:
 * manifest fetching, delta application, full DB download,
 * checksum verification, backup/restore, and debounce logic.
 */

import type { Manifest, ManifestDelta } from '@/services/ContentUpdater';

// ── Override expo-file-system mock with full API ──────────────────
// Using wrapper functions so jest.clearAllMocks() does not break them.
const mockDownloadAsync = jest.fn();
const mockReadAsStringAsync = jest.fn();
const mockMoveAsync = jest.fn();
const mockGetInfoAsync = jest.fn();
const mockCopyAsync = jest.fn();
const mockDeleteAsync = jest.fn();
const mockResumableDownloadAsync = jest.fn();
const mockCreateDownloadResumable = jest.fn(() => ({
  downloadAsync: (...args: any[]) => mockResumableDownloadAsync(...args),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/fake/docs/',
  getInfoAsync: (...args: any[]) => mockGetInfoAsync(...args),
  makeDirectoryAsync: jest.fn(),
  copyAsync: (...args: any[]) => mockCopyAsync(...args),
  deleteAsync: (...args: any[]) => mockDeleteAsync(...args),
  downloadAsync: (...args: any[]) => mockDownloadAsync(...args),
  createDownloadResumable: (...args: any[]) => mockCreateDownloadResumable(...args),
  readAsStringAsync: (...args: any[]) => mockReadAsStringAsync(...args),
  moveAsync: (...args: any[]) => mockMoveAsync(...args),
  EncodingType: { Base64: 'base64' },
}));

// ── Mock expo-crypto ──────────────────────────────────────────────
const mockDigest = jest.fn();
jest.mock('expo-crypto', () => ({
  digest: (...args: any[]) => mockDigest(...args),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));

// ── Mock pako ─────────────────────────────────────────────────────
jest.mock('pako', () => ({
  inflate: jest.fn().mockReturnValue(
    new Uint8Array([83, 69, 76, 69, 67, 84, 32, 49]), // "SELECT 1"
  ),
}));

// ── Mock expo-sqlite ──────────────────────────────────────────────
const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
const mockGetFirstAsync = jest.fn();
const mockCloseAsync = jest.fn().mockResolvedValue(undefined);
const mockDbInstance = {
  execAsync: mockExecAsync,
  runAsync: mockRunAsync,
  getFirstAsync: mockGetFirstAsync,
  closeAsync: mockCloseAsync,
};

const mockOpenDatabaseAsync = jest.fn().mockResolvedValue(mockDbInstance);
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: (...args: any[]) => mockOpenDatabaseAsync(...args),
}));

// ── Mock global fetch ─────────────────────────────────────────────
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// ── Mock atob (not available in Node test env) ────────────────────
(global as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

import { ContentUpdater } from '@/services/ContentUpdater';

// ── Test data ─────────────────────────────────────────────────────

const FULL_DB_SHA256 = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
const DELTA_SHA256 = 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321';

const sampleManifest: Manifest = {
  current_version: 'v2.0.0',
  min_supported_version: 'v1.0.0',
  full_db_url: 'https://cdn.example.com/db/scripture_v2.db',
  full_db_sha256: FULL_DB_SHA256,
  full_db_size_bytes: 5_000_000,
  deltas: [
    {
      from_version: 'v1.0.0',
      to_version: 'v2.0.0',
      url: 'https://cdn.example.com/db/delta_v1_v2.sql.gz',
      sha256: DELTA_SHA256,
      size_bytes: 50_000,
    },
  ],
  updated_at: '2026-01-01T00:00:00Z',
};

const sampleDelta: ManifestDelta = sampleManifest.deltas[0];

// ── Helpers ───────────────────────────────────────────────────────

function mockFetchManifest(manifest = sampleManifest) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(manifest),
  });
}

function mockChecksumPass(expectedHash: string) {
  mockReadAsStringAsync.mockResolvedValue(
    Buffer.from('fake-content').toString('base64'),
  );
  const hashBytes = new Uint8Array(32);
  for (let i = 0; i < 32 && i * 2 < expectedHash.length; i++) {
    hashBytes[i] = parseInt(expectedHash.slice(i * 2, i * 2 + 2), 16);
  }
  mockDigest.mockResolvedValue(hashBytes.buffer);
}

function mockChecksumFail() {
  mockReadAsStringAsync.mockResolvedValue(
    Buffer.from('fake-content').toString('base64'),
  );
  const wrongBytes = new Uint8Array(32).fill(0xff);
  mockDigest.mockResolvedValue(wrongBytes.buffer);
}

// ── Tests ─────────────────────────────────────────────────────────

describe('ContentUpdater service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ContentUpdater as any).lastCheckTime = 0;

    // Re-establish default mock return values after clearAllMocks
    mockOpenDatabaseAsync.mockResolvedValue(mockDbInstance);
    mockGetInfoAsync.mockResolvedValue({ exists: false });
    mockDeleteAsync.mockResolvedValue(undefined);
    mockCopyAsync.mockResolvedValue(undefined);
    mockMoveAsync.mockResolvedValue(undefined);
    mockDownloadAsync.mockResolvedValue({ status: 200 });
    mockResumableDownloadAsync.mockResolvedValue({ status: 200 });
    mockCreateDownloadResumable.mockImplementation(() => ({
      downloadAsync: (...args: any[]) => mockResumableDownloadAsync(...args),
    }));
    mockReadAsStringAsync.mockResolvedValue(
      Buffer.from('fake-content').toString('base64'),
    );
  });

  // ── shouldCheckForUpdates ─────────────────────────────────────

  describe('shouldCheckForUpdates', () => {
    it('returns true when no check has been performed', () => {
      (ContentUpdater as any).lastCheckTime = 0;
      expect(ContentUpdater.shouldCheckForUpdates()).toBe(true);
    });

    it('returns false when checked recently', () => {
      (ContentUpdater as any).lastCheckTime = Date.now();
      expect(ContentUpdater.shouldCheckForUpdates()).toBe(false);
    });

    it('returns true after interval has elapsed', () => {
      (ContentUpdater as any).lastCheckTime = Date.now() - 61 * 60 * 1000;
      expect(ContentUpdater.shouldCheckForUpdates()).toBe(true);
    });
  });

  // ── fetchManifest ─────────────────────────────────────────────

  describe('fetchManifest', () => {
    it('fetches and returns the manifest JSON', async () => {
      mockFetchManifest();

      const manifest = await ContentUpdater.fetchManifest();

      expect(manifest.current_version).toBe('v2.0.0');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('manifest.json'),
        expect.objectContaining({
          headers: { 'Cache-Control': 'no-cache' },
        }),
      );
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(ContentUpdater.fetchManifest()).rejects.toThrow(
        'Manifest fetch failed: 500',
      );
    });
  });

  // ── getInstalledVersion ───────────────────────────────────────

  describe('getInstalledVersion', () => {
    it('returns content_hash from db_meta', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'v1.0.0' });

      const version = await ContentUpdater.getInstalledVersion();

      expect(version).toBe('v1.0.0');
      expect(mockCloseAsync).toHaveBeenCalled();
    });

    it('returns null when db_meta does not exist', async () => {
      mockOpenDatabaseAsync.mockRejectedValue(new Error('no such table'));

      const version = await ContentUpdater.getInstalledVersion();

      expect(version).toBeNull();
    });

    it('returns null when no row found', async () => {
      mockGetFirstAsync.mockResolvedValue(null);

      const version = await ContentUpdater.getInstalledVersion();

      expect(version).toBeNull();
    });
  });

  // ── findDelta ─────────────────────────────────────────────────

  describe('findDelta', () => {
    it('finds a matching delta for installed version', () => {
      const delta = ContentUpdater.findDelta(sampleManifest, 'v1.0.0');

      expect(delta).not.toBeNull();
      expect(delta!.from_version).toBe('v1.0.0');
      expect(delta!.to_version).toBe('v2.0.0');
    });

    it('returns null when no delta matches', () => {
      const delta = ContentUpdater.findDelta(sampleManifest, 'v0.5.0');

      expect(delta).toBeNull();
    });

    it('returns null when deltas array is empty', () => {
      const manifest = { ...sampleManifest, deltas: [] };
      const delta = ContentUpdater.findDelta(manifest, 'v1.0.0');

      expect(delta).toBeNull();
    });
  });

  // ── checkForUpdates ───────────────────────────────────────────

  describe('checkForUpdates', () => {
    it('returns up_to_date when already on latest version', async () => {
      mockFetchManifest();
      mockGetFirstAsync.mockResolvedValue({ value: 'v2.0.0' });

      const result = await ContentUpdater.checkForUpdates();

      expect(result.status).toBe('up_to_date');
    });

    it('updates lastCheckTime after check', async () => {
      const before = Date.now();
      mockFetchManifest();
      mockGetFirstAsync.mockResolvedValue({ value: 'v2.0.0' });

      await ContentUpdater.checkForUpdates();

      expect((ContentUpdater as any).lastCheckTime).toBeGreaterThanOrEqual(before);
    });

    it('returns failed on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));

      const result = await ContentUpdater.checkForUpdates();

      expect(result.status).toBe('failed');
      expect(result.error).toBe('network error');
    });

    it('attempts delta update when installed version has matching delta', async () => {
      mockFetchManifest();
      mockGetFirstAsync.mockResolvedValueOnce({ value: 'v1.0.0' });
      mockDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValueOnce({ integrity_check: 'ok' });

      const result = await ContentUpdater.checkForUpdates();

      expect(result.status).toBe('updated');
      expect(result.updateType).toBe('delta');
      expect(result.fromVersion).toBe('v1.0.0');
      expect(result.toVersion).toBe('v2.0.0');
    });

    it('falls back to full download when no delta matches', async () => {
      mockFetchManifest();
      mockGetFirstAsync.mockResolvedValueOnce({ value: 'v0.5.0' });
      mockGetFirstAsync.mockResolvedValueOnce({ value: 'v0.5.0' });
      mockResumableDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleManifest.full_db_sha256);
      mockGetFirstAsync.mockResolvedValueOnce({ value: 'v2.0.0' });

      const result = await ContentUpdater.checkForUpdates();

      expect(result.status).toBe('updated');
      expect(result.updateType).toBe('full');
    });

    it('falls back to full download when no installed version', async () => {
      mockFetchManifest();
      mockGetFirstAsync.mockResolvedValueOnce(null);
      mockGetFirstAsync.mockResolvedValueOnce(null);
      mockResumableDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleManifest.full_db_sha256);
      mockGetFirstAsync.mockResolvedValueOnce({ value: 'v2.0.0' });

      const result = await ContentUpdater.checkForUpdates();

      expect(result.status).toBe('updated');
      expect(result.updateType).toBe('full');
    });
  });

  // ── applyDelta ────────────────────────────────────────────────

  describe('applyDelta', () => {
    it('downloads, decompresses, and applies delta SQL', async () => {
      mockDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'ok' });

      const result = await ContentUpdater.applyDelta(sampleDelta);

      expect(result.status).toBe('updated');
      expect(result.updateType).toBe('delta');
      expect(result.bytesDownloaded).toBe(sampleDelta.size_bytes);
      expect(mockExecAsync).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(mockExecAsync).toHaveBeenCalledWith('COMMIT');
    });

    it('returns failed on download HTTP error', async () => {
      mockDownloadAsync.mockResolvedValue({ status: 404 });

      const result = await ContentUpdater.applyDelta(sampleDelta);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Delta download failed');
    });

    it('returns failed on checksum mismatch', async () => {
      mockDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumFail();

      const result = await ContentUpdater.applyDelta(sampleDelta);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Checksum mismatch');
    });

    it('restores backup on integrity check failure', async () => {
      mockDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'corrupt' });
      mockGetInfoAsync.mockResolvedValue({ exists: true });

      const result = await ContentUpdater.applyDelta(sampleDelta);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Integrity check failed');
      expect(mockMoveAsync).toHaveBeenCalled();
    });

    it('cleans up temp files on success', async () => {
      mockDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'ok' });

      await ContentUpdater.applyDelta(sampleDelta);

      expect(mockDeleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('scripture_backup.db'),
        { idempotent: true },
      );
      expect(mockDeleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('delta_temp.sql.gz'),
        { idempotent: true },
      );
    });

    it('updates content_hash in db_meta after applying delta', async () => {
      mockDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'ok' });

      await ContentUpdater.applyDelta(sampleDelta);

      expect(mockRunAsync).toHaveBeenCalledWith(
        "INSERT OR REPLACE INTO db_meta (key, value) VALUES ('content_hash', ?)",
        'v2.0.0',
      );
    });

    it('backs up current DB before modifying', async () => {
      mockDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'ok' });
      mockGetInfoAsync.mockResolvedValue({ exists: true });

      await ContentUpdater.applyDelta(sampleDelta);

      expect(mockCopyAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('scripture.db'),
          to: expect.stringContaining('scripture_backup.db'),
        }),
      );
    });
  });

  // ── downloadFullDb ────────────────────────────────────────────

  describe('downloadFullDb', () => {
    it('downloads full DB and verifies content hash', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      mockResumableDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleManifest.full_db_sha256);

      const result = await ContentUpdater.downloadFullDb(sampleManifest);

      expect(result.status).toBe('updated');
      expect(result.updateType).toBe('full');
      expect(result.fromVersion).toBe('v1.0.0');
      expect(result.toVersion).toBe('v2.0.0');
      expect(result.bytesDownloaded).toBe(sampleManifest.full_db_size_bytes);
    });

    it('forwards download progress to the onProgress callback', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      mockChecksumPass(sampleManifest.full_db_sha256);

      let capturedCallback: ((p: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => void) | undefined;
      mockCreateDownloadResumable.mockImplementation((_url: string, _path: string, _opts: any, cb: any) => {
        capturedCallback = cb;
        return { downloadAsync: (...args: any[]) => mockResumableDownloadAsync(...args) };
      });
      mockResumableDownloadAsync.mockImplementation(async () => {
        capturedCallback?.({ totalBytesWritten: 50, totalBytesExpectedToWrite: 200 });
        capturedCallback?.({ totalBytesWritten: 200, totalBytesExpectedToWrite: 200 });
        return { status: 200 };
      });

      const progress: number[] = [];
      await ContentUpdater.downloadFullDb(sampleManifest, (pct) => progress.push(pct));

      expect(progress).toEqual([25, 100]);
    });

    it('returns failed on download HTTP error', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'v1.0.0' });
      mockResumableDownloadAsync.mockResolvedValue({ status: 500 });

      const result = await ContentUpdater.downloadFullDb(sampleManifest);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Full DB download failed');
    });

    it('returns failed on checksum mismatch', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'v1.0.0' });
      mockResumableDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumFail();

      const result = await ContentUpdater.downloadFullDb(sampleManifest);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Checksum mismatch');
    });

    it('returns failed on content hash mismatch after download', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })   // getInstalledVersion
        .mockResolvedValueOnce({ value: 'wrong_hash' }); // verify after swap
      mockResumableDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleManifest.full_db_sha256);
      mockGetInfoAsync.mockResolvedValue({ exists: true });

      const result = await ContentUpdater.downloadFullDb(sampleManifest);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Content hash mismatch');
    });

    it('swaps downloaded DB into place', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      mockResumableDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleManifest.full_db_sha256);

      await ContentUpdater.downloadFullDb(sampleManifest);

      expect(mockMoveAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('scripture_download.db'),
          to: expect.stringContaining('scripture.db'),
        }),
      );
    });

    it('cleans up temp file on failure', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'v1.0.0' });
      mockResumableDownloadAsync.mockResolvedValue({ status: 500 });

      await ContentUpdater.downloadFullDb(sampleManifest);

      expect(mockDeleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('scripture_download.db'),
        { idempotent: true },
      );
    });

    it('removes backup after successful download', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      mockResumableDownloadAsync.mockResolvedValue({ status: 200 });
      mockChecksumPass(sampleManifest.full_db_sha256);

      await ContentUpdater.downloadFullDb(sampleManifest);

      expect(mockDeleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('scripture_backup.db'),
        { idempotent: true },
      );
    });
  });
});
