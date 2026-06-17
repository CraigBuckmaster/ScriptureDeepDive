/**
 * lib/secureStorage.ts — SecureStore-backed key/value storage for the Supabase
 * auth session, replacing plaintext AsyncStorage.
 *
 * expo-secure-store persists values in the iOS Keychain / Android Keystore
 * (encrypted at rest). Individual SecureStore values are capped (~2KB), but
 * Supabase session tokens (access + refresh JWTs) can exceed that, so values
 * are transparently split into chunks: the chunk count is stored under the
 * base key and each chunk under "<key>.<n>".
 *
 * The native module is lazy-required to match lib/supabase.ts (native modules
 * are unavailable in Expo Go / before a dev build).
 */

import { logger } from '../utils/logger';

// Stay comfortably under SecureStore's ~2048-byte per-value limit. JWT tokens
// are ASCII (base64url), so character length ≈ byte length here.
const CHUNK_SIZE = 1800;

interface SecureStoreModule {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function getSecureStore(): SecureStoreModule | null {
  try {
    return require('expo-secure-store');
  } catch {
    return null;
  }
}

/**
 * Build a chunked SecureStore-backed storage adapter. Throws if
 * expo-secure-store is unavailable so the caller can decide on a fallback
 * rather than silently persisting session tokens insecurely.
 */
export function createSecureStorage(): KeyValueStore {
  const store = getSecureStore();
  if (!store) {
    throw new Error('expo-secure-store is not available');
  }

  async function removeItem(key: string): Promise<void> {
    const meta = await store!.getItemAsync(key);
    const count = meta ? parseInt(meta, 10) : 0;
    await store!.deleteItemAsync(key);
    for (let i = 0; i < count; i++) {
      await store!.deleteItemAsync(`${key}.${i}`);
    }
  }

  return {
    async getItem(key) {
      const meta = await store!.getItemAsync(key);
      if (meta == null) return null;
      const count = parseInt(meta, 10);
      if (!Number.isFinite(count) || count <= 0) return null;
      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        const part = await store!.getItemAsync(`${key}.${i}`);
        if (part == null) {
          // Corrupt/partial write — treat the whole value as missing.
          logger.warn('secureStorage', `Missing chunk ${i} for ${key}`);
          return null;
        }
        parts.push(part);
      }
      return parts.join('');
    },
    async setItem(key, value) {
      // Clear prior chunks first so a shorter value doesn't leave stale tails.
      await removeItem(key);
      const count = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
      for (let i = 0; i < count; i++) {
        await store!.setItemAsync(
          `${key}.${i}`,
          value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
        );
      }
      await store!.setItemAsync(key, String(count));
    },
    removeItem,
  };
}
