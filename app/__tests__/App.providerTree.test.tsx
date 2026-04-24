/**
 * Smoke test: the full <App /> provider tree must mount without throwing.
 *
 * This test would have caught PR #1557's root cause (AmicusFab calling
 * useNavigation outside NavigationContainer) before any TestFlight build.
 * Lightweight — does not exercise navigation, hydration, or DB code paths;
 * it only verifies the component tree composes without an unhandled throw.
 *
 * The jest.setup.js file already mocks most native modules (expo-font,
 * expo-splash-screen, expo-screen-orientation, @react-navigation/native,
 * etc.), so this file only needs to add App-specific init-path mocks.
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Use the real @react-navigation/native so the smoke test actually exercises
// the NavigationContainer + useNavigation contract. The global mock in
// jest.setup.js replaces useNavigation with a non-throwing stub, which would
// hide the exact bug this test is designed to catch (hook called outside its
// provider).
jest.unmock('@react-navigation/native');

// App's top-level init() calls these — make each resolve instantly.
jest.mock('@/db/database', () => ({
  initDatabase: jest.fn().mockResolvedValue('ready'),
  getDb: jest.fn(),
  getDbIfInitialized: jest.fn(() => null),
  closeDatabaseConnection: jest.fn().mockResolvedValue(true),
  reloadDatabase: jest.fn(),
}));

jest.mock('@/db/userDatabase', () => ({
  initUserDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/translationManager', () => ({
  closeAllTranslationDbs: jest.fn(),
}));

jest.mock('@/utils/anonymousId', () => ({
  getAnonymousId: jest.fn().mockResolvedValue('anon-test'),
}));

jest.mock('@/lib/sentry', () => ({
  Sentry: null,
  DSN: null,
  setSentryUser: jest.fn(),
}));

jest.mock('@/services/notifications', () => ({
  rescheduleIfStale: jest.fn(),
}));

jest.mock('@/services/purchases', () => ({
  initializePurchases: jest.fn().mockResolvedValue(undefined),
  syncPremiumStatus: jest.fn(),
}));

jest.mock('@/services/syncQueue', () => ({
  flushQueue: jest.fn(),
}));

jest.mock('@/utils/crashHandler', () => ({
  displayLastCrashIfAny: jest.fn(),
}));

// Stubs the navigator tree so we don't drag in every screen's dependencies.
// The bug this test guards against is a hook called outside its provider —
// that only depends on the provider composition in App.tsx, not on any
// screen's internals. A testID anchor lets us confirm the full tree
// actually mounted past the splash.
jest.mock('@/navigation', () => {
  const ReactLib = require('react');
  const { View: RNView } = require('react-native');
  return {
    RootNavigator: () =>
      ReactLib.createElement(RNView, { testID: 'root-navigator-stub' }),
  };
});

// Stores are zustand hooks — usable both as a function selector
// (useSettingsStore(s => s.theme)) and via .getState() in non-component
// code (useSettingsStore.getState().hydrate()).
jest.mock('@/stores', () => {
  const settingsState = { theme: 'dark', hydrate: jest.fn().mockResolvedValue(undefined) };
  const authState = { hydrate: jest.fn().mockResolvedValue(undefined) };
  const premiumState = { hydrate: jest.fn().mockResolvedValue(undefined) };
  const makeHook = (state: Record<string, unknown>) => {
    const hook: ((selector?: (s: typeof state) => unknown) => unknown) & { getState?: () => typeof state } =
      (selector) => (selector ? selector(state) : state);
    hook.getState = () => state;
    return hook;
  };
  return {
    useSettingsStore: makeHook(settingsState),
    useAuthStore: makeHook(authState),
    usePremiumStore: makeHook(premiumState),
  };
});

// useNotificationRouter is called in AppShell; keep it a no-op here.
jest.mock('@/hooks/useNotificationRouter', () => ({
  useNotificationRouter: jest.fn(),
}));

import App from '../App';

describe('App provider tree', () => {
  it('mounts the full tree past the splash without throwing', async () => {
    // Synchronous render must not throw (splash screen phase).
    const utils = render(<App />);

    // Wait for dbStatus -> 'ready', which mounts the full provider
    // tree including <NavigationContainer> + <AmicusFab />. If any
    // hook is called outside its provider (the bug class that caused
    // the first-launch crash on TestFlight builds 18 and 21), the
    // underlying error surfaces during this mount.
    await waitFor(
      () => {
        expect(utils.queryByTestId('root-navigator-stub')).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });
});
