/**
 * __tests__/services/ContentUpdater.test.ts
 *
 * Tests for the OTA content database updater service:
 * manifest fetching, delta application, full DB download,
 * checksum verification, backup/restore, and debounce logic.
 *
 * Under SDK 54, ContentUpdater uses the new `expo-file-system`
 * File/Directory/Paths API plus an XHR fallback for small full-DB
 * downloads (progress callbacks). Large full-DB payloads use native
 * File.downloadFileAsync to avoid JS memory spikes. These tests mock
 * both surfaces.
 */

import type { Manifest, ManifestDelta } from '@/services/ContentUpdater';

// ── File / Directory mock ─────────────────────────────────────────
// Shared, mutable state lives at module scope so each test can poke
// file existence/size through `mockFileMap` and observe ops via `mockFileOps`.

interface FileRecord {
  exists: boolean;
  size: number;
}

const mockFileMap = new Map<string, FileRecord>();
const mockFileOps = {
  create: jest.fn(),
  write: jest.fn(),
  writeBytes: jest.fn(),
  handleOpen: jest.fn(),
  handleClose: jest.fn(),
  copy: jest.fn(),
  move: jest.fn(),
  delete: jest.fn(),
  downloadFileAsync: jest.fn(),
  base64: jest.fn(),
};
const mockDownloadState = { nextError: null as Error | null };
const mockBase64State = { value: '' };

function getOrCreateRecord(uri: string): FileRecord {
  let rec = mockFileMap.get(uri);
  if (!rec) {
    rec = { exists: false, size: 0 };
    mockFileMap.set(uri, rec);
  }
  return rec;
}

jest.mock('expo-file-system', () => {
  function getRec(uri: string): FileRecord {
    let rec = mockFileMap.get(uri);
    if (!rec) {
      rec = { exists: false, size: 0 };
      mockFileMap.set(uri, rec);
    }
    return rec;
  }
  function joinParts(parts: unknown[]): string {
    return parts
      .map((p) =>
        p && typeof p === 'object' && 'uri' in p
          ? String((p as { uri: string }).uri)
          : String(p),
      )
      .join('/')
      .replace(/\/+/g, '/');
  }

  class MockFile {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = joinParts(parts);
    }
    get exists(): boolean { return getRec(this.uri).exists; }
    get size(): number { return getRec(this.uri).size; }
    create(opts?: { overwrite?: boolean; intermediates?: boolean }): void {
      mockFileOps.create(this.uri, opts);
      const rec = getRec(this.uri);
      rec.exists = true;
      if (!rec.size) rec.size = 1;
    }
    write(bytes: Uint8Array | string): void {
      mockFileOps.write(this.uri, bytes);
      const rec = getRec(this.uri);
      rec.exists = true;
      rec.size = typeof bytes === 'string' ? bytes.length : bytes.byteLength;
    }
    open(): {
      writeBytes: (chunk: Uint8Array) => void;
      close: () => void;
    } {
      mockFileOps.handleOpen(this.uri);
      const uri = this.uri;
      return {
        writeBytes: (chunk: Uint8Array) => {
          mockFileOps.writeBytes(uri, chunk);
          const rec = getRec(uri);
          rec.exists = true;
          rec.size += chunk.byteLength;
        },
        close: () => {
          mockFileOps.handleClose(uri);
        },
      };
    }
    copy(dest: { uri: string }): void {
      mockFileOps.copy({ from: this.uri, to: dest.uri });
      const destRec = getRec(dest.uri);
      const srcRec = getRec(this.uri);
      destRec.exists = true;
      destRec.size = srcRec.size;
    }
    move(dest: { uri: string }): void {
      mockFileOps.move({ from: this.uri, to: dest.uri });
      const destRec = getRec(dest.uri);
      const srcRec = getRec(this.uri);
      destRec.exists = true;
      destRec.size = srcRec.size;
      srcRec.exists = false;
      srcRec.size = 0;
      this.uri = dest.uri;
    }
    delete(): void {
      mockFileOps.delete(this.uri);
      const rec = getRec(this.uri);
      rec.exists = false;
      rec.size = 0;
    }
    async base64(): Promise<string> {
      mockFileOps.base64(this.uri);
      return mockBase64State.value;
    }
    async text(): Promise<string> { return ''; }
    async bytes(): Promise<Uint8Array> { return new Uint8Array(); }
    static async downloadFileAsync(
      url: string,
      destination: { uri: string },
    ): Promise<MockFile> {
      mockFileOps.downloadFileAsync(url, destination.uri);
      if (mockDownloadState.nextError) {
        const err = mockDownloadState.nextError;
        mockDownloadState.nextError = null;
        throw err;
      }
      const destRec = getRec(destination.uri);
      destRec.exists = true;
      destRec.size = 1024;
      return new MockFile(destination.uri);
    }
  }

  class MockDirectory {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = joinParts(parts);
    }
    get exists(): boolean { return true; }
    create(): void { /* no-op */ }
    delete(): void { /* no-op */ }
  }

  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths: { document: '/fake/docs', cache: '/fake/cache' },
  };
});

// ── XMLHttpRequest mock ──────────────────────────────────────────
// Drives ContentUpdater.downloadWithProgress (full-DB path).

interface XhrControls {
  /** Emit these events before onload (set per-test). */
  progressEvents: Array<{ loaded: number; total: number; lengthComputable: boolean }>;
  /** Resolve onload with this status; if null, triggers onerror. */
  status: number | null;
  /** Optional ArrayBuffer returned in xhr.response. */
  response: ArrayBuffer;
}

const xhrControls: XhrControls = {
  progressEvents: [],
  status: 200,
  response: new ArrayBuffer(4),
};

class MockXHR {
  method = '';
  url = '';
  responseType = '';
  status = 0;
  response: ArrayBuffer | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onprogress: ((e: ProgressEvent) => void) | null = null;
  open(method: string, url: string, _async?: boolean): void {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(): void { /* no-op */ }
  send(): void {
    // Simulate async network — schedule a microtask to fire events.
    Promise.resolve().then(() => {
      for (const evt of xhrControls.progressEvents) {
        this.onprogress?.(evt as unknown as ProgressEvent);
      }
      if (xhrControls.status == null) {
        this.onerror?.();
        return;
      }
      this.status = xhrControls.status;
      this.response = xhrControls.response;
      this.onload?.();
    });
  }
}
(global as unknown as { XMLHttpRequest: typeof MockXHR }).XMLHttpRequest = MockXHR;

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

// ── Mock db/database live-handle helper ───────────────────────────
const mockGetDbIfInitialized = jest.fn().mockReturnValue(null);
jest.mock('@/db/database', () => ({
  getDbIfInitialized: () => mockGetDbIfInitialized(),
}));

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
  mockBase64State.value = Buffer.from('fake-content').toString('base64');
  const hashBytes = new Uint8Array(32);
  for (let i = 0; i < 32 && i * 2 < expectedHash.length; i++) {
    hashBytes[i] = parseInt(expectedHash.slice(i * 2, i * 2 + 2), 16);
  }
  mockDigest.mockResolvedValue(hashBytes.buffer);
}

function mockChecksumFail() {
  mockBase64State.value = Buffer.from('fake-content').toString('base64');
  const wrongBytes = new Uint8Array(32).fill(0xff);
  mockDigest.mockResolvedValue(wrongBytes.buffer);
}

function resetXhr(status: number | null = 200): void {
  xhrControls.progressEvents = [];
  xhrControls.status = status;
  xhrControls.response = new ArrayBuffer(4);
}

// ── Tests ─────────────────────────────────────────────────────────

describe('ContentUpdater service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ContentUpdater as any).lastCheckTime = 0;

    // Reset file-system virtual state
    mockFileMap.clear();
    mockDownloadState.nextError = null;
    mockBase64State.value = Buffer.from('fake-content').toString('base64');
    resetXhr();

    // Re-establish default mock return values after clearAllMocks
    mockOpenDatabaseAsync.mockResolvedValue(mockDbInstance);
    mockGetDbIfInitialized.mockReturnValue(null);
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

    it('reuses initialized live DB without opening/closing a temp handle', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'v_live' });
      mockGetDbIfInitialized.mockReturnValue(mockDbInstance);

      const version = await ContentUpdater.getInstalledVersion();

      expect(version).toBe('v_live');
      expect(mockOpenDatabaseAsync).not.toHaveBeenCalled();
      expect(mockCloseAsync).not.toHaveBeenCalled();
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
      resetXhr(200);
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
      resetXhr(200);
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
      const httpErr = new Error('HTTP 404') as Error & { httpStatus: number };
      httpErr.httpStatus = 404;
      mockDownloadState.nextError = httpErr;

      const result = await ContentUpdater.applyDelta(sampleDelta);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Delta download failed');
    });

    it('returns failed on checksum mismatch', async () => {
      mockChecksumFail();

      const result = await ContentUpdater.applyDelta(sampleDelta);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Checksum mismatch');
    });

    it('restores backup on integrity check failure', async () => {
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'corrupt' });
      // Simulate an existing live DB so backupCurrentDb actually copies.
      getOrCreateRecord('/fake/docs/SQLite/scripture.db').exists = true;
      getOrCreateRecord('/fake/docs/SQLite/scripture.db').size = 5_000_000;

      const result = await ContentUpdater.applyDelta(sampleDelta);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Integrity check failed');
      // Restore-from-backup moves scripture_backup.db → scripture.db
      expect(mockFileOps.move).toHaveBeenCalled();
    });

    it('cleans up temp files on success', async () => {
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'ok' });
      // Pre-seed backup + temp so safeDelete observes them.
      getOrCreateRecord('/fake/docs/SQLite/scripture_backup.db').exists = true;
      getOrCreateRecord('/fake/docs/SQLite/delta_temp.sql.gz').exists = true;

      await ContentUpdater.applyDelta(sampleDelta);

      const deletedUris = mockFileOps.delete.mock.calls.map((c) => c[0]);
      expect(deletedUris).toEqual(
        expect.arrayContaining([
          expect.stringContaining('scripture_backup.db'),
          expect.stringContaining('delta_temp.sql.gz'),
        ]),
      );
    });

    it('updates content_hash in db_meta after applying delta', async () => {
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'ok' });

      await ContentUpdater.applyDelta(sampleDelta);

      expect(mockRunAsync).toHaveBeenCalledWith(
        "INSERT OR REPLACE INTO db_meta (key, value) VALUES ('content_hash', ?)",
        'v2.0.0',
      );
    });

    it('backs up current DB before modifying', async () => {
      mockChecksumPass(sampleDelta.sha256);
      mockGetFirstAsync.mockResolvedValue({ integrity_check: 'ok' });
      // Live DB must exist for the backup copy to run.
      const rec = getOrCreateRecord('/fake/docs/SQLite/scripture.db');
      rec.exists = true;
      rec.size = 5_000_000;

      await ContentUpdater.applyDelta(sampleDelta);

      expect(mockFileOps.copy).toHaveBeenCalledWith({
        from: expect.stringContaining('scripture.db'),
        to: expect.stringContaining('scripture_backup.db'),
      });
    });
  });

  // ── downloadFullDb ────────────────────────────────────────────

  describe('downloadFullDb', () => {
    it('downloads full DB and verifies content hash', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      resetXhr(200);
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
      xhrControls.progressEvents = [
        { loaded: 50, total: 200, lengthComputable: true },
        { loaded: 200, total: 200, lengthComputable: true },
      ];
      xhrControls.status = 200;

      const progress: number[] = [];
      await ContentUpdater.downloadFullDb(sampleManifest, (pct) => progress.push(pct));

      expect(progress).toEqual([25, 100]);
    });

    it('uses native file download for large full DB payloads', async () => {
      const largeManifest: Manifest = {
        ...sampleManifest,
        full_db_size_bytes: 100 * 1024 * 1024,
      };
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' })
        .mockResolvedValueOnce({ integrity_check: 'ok' });
      resetXhr(200);

      const progress: number[] = [];
      const result = await ContentUpdater.downloadFullDb(largeManifest, (pct) => progress.push(pct));

      expect(result.status).toBe('updated');
      expect(mockFileOps.downloadFileAsync).toHaveBeenCalled();
      expect(mockFileOps.writeBytes).not.toHaveBeenCalled();
      expect(progress).toEqual([5, 100]);
    });

    it('returns failed on download HTTP error', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'v1.0.0' });
      resetXhr(500);

      const result = await ContentUpdater.downloadFullDb(sampleManifest);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Full DB download failed');
    });

    it('returns failed on content hash mismatch after download', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })   // getInstalledVersion
        .mockResolvedValueOnce({ value: 'wrong_hash' }); // verify after swap
      resetXhr(200);
      mockChecksumPass(sampleManifest.full_db_sha256);
      // Live DB must exist to exercise the path.
      getOrCreateRecord('/fake/docs/SQLite/scripture.db').exists = true;

      const result = await ContentUpdater.downloadFullDb(sampleManifest);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Content hash mismatch');
    });

    it('returns failed when integrity_check fails after download', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })   // getInstalledVersion
        .mockResolvedValueOnce({ value: 'v2.0.0' })   // content hash
        .mockResolvedValueOnce({ integrity_check: 'malformed' }); // integrity
      resetXhr(200);

      const result = await ContentUpdater.downloadFullDb(sampleManifest);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Integrity check failed after download');
    });

    it('swaps downloaded DB into place', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      resetXhr(200);
      mockChecksumPass(sampleManifest.full_db_sha256);

      await ContentUpdater.downloadFullDb(sampleManifest);

      expect(mockFileOps.move).toHaveBeenCalledWith({
        from: expect.stringContaining('scripture_download.db'),
        to: expect.stringContaining('scripture.db'),
      });
    });

    it('cleans up temp file on failure', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'v1.0.0' });
      resetXhr(500);
      // Temp must "exist" so the cleanup path actually calls delete.
      getOrCreateRecord('/fake/docs/SQLite/scripture_download.db').exists = true;

      await ContentUpdater.downloadFullDb(sampleManifest);

      expect(mockFileOps.delete).toHaveBeenCalledWith(
        expect.stringContaining('scripture_download.db'),
      );
    });

    it('removes backup after successful download', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      resetXhr(200);
      mockChecksumPass(sampleManifest.full_db_sha256);
      // Pre-seed an old backup so safeDelete observes the delete.
      getOrCreateRecord('/fake/docs/SQLite/scripture_backup.db').exists = true;

      await ContentUpdater.downloadFullDb(sampleManifest);

      expect(mockFileOps.delete).toHaveBeenCalledWith(
        expect.stringContaining('scripture_backup.db'),
      );
    });

    // ── chunked-write path (regression for 1.0.6(15)/1.0.6(16)) ─────
    // `File#write` is a synchronous Expo Modules Function; passing a ~90 MB
    // buffer through it in one shot caused a process-terminating NSException
    // on iOS 26. We now route through a FileHandle with 1 MiB chunks and
    // surface any error as a promise rejection. See PR #1514 + #1516 history.

    it('writes the downloaded payload via FileHandle, not File#write', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      resetXhr(200);
      mockChecksumPass(sampleManifest.full_db_sha256);

      await ContentUpdater.downloadFullDb(sampleManifest);

      expect(mockFileOps.handleOpen).toHaveBeenCalledWith(
        expect.stringContaining('scripture_download.db'),
      );
      expect(mockFileOps.writeBytes).toHaveBeenCalled();
      expect(mockFileOps.handleClose).toHaveBeenCalledWith(
        expect.stringContaining('scripture_download.db'),
      );
      // The legacy single-shot write path must be gone.
      expect(mockFileOps.write).not.toHaveBeenCalled();
    });

    it('splits a multi-MB payload into 1 MiB chunks', async () => {
      mockGetFirstAsync
        .mockResolvedValueOnce({ value: 'v1.0.0' })
        .mockResolvedValueOnce({ value: 'v2.0.0' });
      // 2.5 MiB payload → expect 3 chunks (1 MiB, 1 MiB, 0.5 MiB)
      const payloadBytes = Math.floor(2.5 * (1 << 20));
      xhrControls.response = new ArrayBuffer(payloadBytes);
      xhrControls.status = 200;
      xhrControls.progressEvents = [];
      mockChecksumPass(sampleManifest.full_db_sha256);

      await ContentUpdater.downloadFullDb(sampleManifest);

      expect(mockFileOps.writeBytes).toHaveBeenCalledTimes(3);
      const chunkSizes = mockFileOps.writeBytes.mock.calls.map(
        (call) => (call[1] as Uint8Array).byteLength,
      );
      expect(chunkSizes).toEqual([1 << 20, 1 << 20, payloadBytes - 2 * (1 << 20)]);
    });

    it('closes the file handle even when a chunk write throws', async () => {
      mockGetFirstAsync.mockResolvedValue({ value: 'v1.0.0' });
      resetXhr(200);
      mockFileOps.writeBytes.mockImplementationOnce(() => {
        throw new Error('simulated native write failure');
      });

      const result = await ContentUpdater.downloadFullDb(sampleManifest);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('File write failed');
      expect(result.error).toContain('simulated native write failure');
      // Handle must still have been closed despite the throw.
      expect(mockFileOps.handleClose).toHaveBeenCalled();
    });
  });
});
