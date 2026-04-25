/**
 * hooks/useAmicusChipContext.ts — resolve the current Amicus chip
 * context from React Navigation state.
 *
 * Defense in depth against "Couldn't get the navigation state. Is your
 * component inside a navigator?":
 *
 *   1. The selector passed to `useNavigationState` is itself wrapped in
 *      try/catch. The selector runs on every nav state change, including
 *      transient inconsistent states during Fabric layout commits. If
 *      the selector throws, the throw escapes into the layout-effect
 *      phase and ErrorBoundary catches it (which silently kills the
 *      FAB until app relaunch — see the Sentry trace for release
 *      1.0.7+1).
 *
 *   2. The outer try/catch around the hook call protects the *initial*
 *      synchronous call when no NavigationContainer ancestor exists
 *      yet (during pre-mount).
 *
 *   3. The eslint-disable for rules-of-hooks remains intentional — the
 *      hook order is stable because `useNavigationState`'s `useContext`
 *      runs before any throw.
 *
 * Pure-logic half lives in `utils/routeContext.ts` and is unit testable
 * without a NavigationContainer.
 */

import { useMemo } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { findDeepestRoute, routeToChipContext } from '../utils/routeContext';
import { logger } from '../utils/logger';
import type { ChipContext } from './useAmicusChips';

function isNavigationStateUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /Couldn't get the navigation state/i.test(error.message);
}

/**
 * Selector wrapper. `useNavigationState` calls this on every nav state
 * change, including during layout-commit transients. If we return the
 * raw state from a partially-mounted container, downstream consumers
 * may also throw. So we defensively return `null` if anything is off.
 *
 * Returning `null` is treated equivalently to "no nav state yet" by
 * `findDeepestRoute`/`routeToChipContext`.
 */
function safeSelector(state: unknown): unknown | null {
  try {
    return state ?? null;
  } catch {
    return null;
  }
}

export function useAmicusChipContext(): ChipContext {
  let state: unknown = undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    state = useNavigationState(safeSelector);
  } catch (e) {
    // Pre-mount or outside NavigationContainer. Degrade to {kind: 'none'}
    // rather than crash; Amicus simply won't have route-scoped chips
    // until the next render once nav state is populated.
    if (!isNavigationStateUnavailable(e)) {
      logger.warn('AmicusChipContext', 'navigation state resolution failed', e);
    }
  }
  return useMemo(() => routeToChipContext(findDeepestRoute(state)), [state]);
}
