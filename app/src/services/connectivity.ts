/**
 * services/connectivity.ts — Network connectivity monitor.
 *
 * Provides a reactive isConnected state and triggers sync queue
 * flush when connectivity is restored. Uses expo-network when
 * available, with a polling fallback.
 *
 * Addresses #971 (offline connectivity indicator).
 */

import { logger } from '../utils/logger';
import { flushQueue } from './syncQueue';

type Listener = (connected: boolean) => void;

let _connected = true;
const _listeners = new Set<Listener>();
let _polling = false;
let _pollTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Whether the app currently has network connectivity.
 */
export function isConnected(): boolean {
  return _connected;
}

/**
 * Subscribe to connectivity changes. Returns an unsubscribe function.
 */
export function onConnectivityChange(listener: Listener): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function setConnected(value: boolean) {
  if (value === _connected) return;
  const wasOffline = !_connected;
  _connected = value;
  logger.info('Connectivity', value ? 'Online' : 'Offline');
  _listeners.forEach((fn) => fn(value));

  // When coming back online, flush the sync queue
  if (value && wasOffline) {
    flushQueue().catch((err) =>
      logger.warn('Connectivity', 'Queue flush failed on reconnect', err),
    );
  }
}

/**
 * Start monitoring connectivity. Call once at app startup.
 *
 * Tries to use @react-native-community/netinfo if available,
 * otherwise falls back to periodic fetch-based checks.
 */
export function startMonitoring(): void {
  if (_polling) return;

  try {
    // Try NetInfo (available in dev builds, not Expo Go)
    const NetInfo = require('@react-native-community/netinfo');
    NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
      setConnected(state.isConnected !== false);
    });
    logger.info('Connectivity', 'Using NetInfo');
    return;
  } catch {
    // NetInfo not available — use polling fallback
  }

  // Polling fallback: check reachability every 15 seconds.
  // Require two consecutive failures before marking offline so a single
  // slow/blocked fetch on startup doesn't flash the banner incorrectly.
  _polling = true;
  let _consecutiveFails = 0;
  const check = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      _consecutiveFails = 0;
      setConnected(true);
    } catch {
      _consecutiveFails++;
      if (_consecutiveFails >= 2) {
        setConnected(false);
      }
    }
  };

  check();
  _pollTimer = setInterval(check, 15_000);
}

/**
 * Stop monitoring (for cleanup in tests or when app suspends).
 */
export function stopMonitoring(): void {
  if (_pollTimer) {
    clearInterval(_pollTimer);
    _pollTimer = null;
  }
  _polling = false;
  _listeners.clear();
}
