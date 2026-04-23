/**
 * hooks/useAmicusChipContext.ts — resolve the current Amicus chip
 * context from React Navigation state.
 *
 * Uses `useNavigationState` internally, but wraps it in try/catch so
 * components can call this hook from anywhere in the tree — including
 * during the render pass before NavigationContainer has populated its
 * initial state. Without that guard, `useNavigationState` throws
 * "Couldn't get the navigation state. Is your component inside a
 * navigator?" on first mount, which ErrorBoundary catches and logs as
 * a spurious error. See:
 *   - AmicusFab.tsx (same guard pattern around `useNavigation()`)
 *   - the ErrorBoundary trace that motivated this hook
 *
 * The try/catch technically violates the Rules of Hooks (a hook call
 * under a conditional-catch branch). In practice React runs the hook
 * body every render because the internal `useContext` call at the top
 * of `useNavigationState` runs before the throw, so hook order is
 * stable. The rule exists to prevent a subtler class of bug than this
 * one; the eslint-disable is intentional and documented.
 *
 * Pure-logic half of the resolution lives in `utils/routeContext.ts`
 * (`findDeepestRoute` + `routeToChipContext`) so it can be unit tested
 * without a navigation container.
 */

import { useMemo } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { findDeepestRoute, routeToChipContext } from '../utils/routeContext';
import { logger } from '../utils/logger';
import type { ChipContext } from './useAmicusChips';

export function useAmicusChipContext(): ChipContext {
  let state: unknown = undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    state = useNavigationState((s) => s);
  } catch (e) {
    // Pre-mount or outside NavigationContainer. Degrade to {kind: 'none'}
    // rather than crash; Amicus simply won't have route-scoped chips
    // until the next render once nav state is populated.
    logger.warn('AmicusChipContext', 'navigation state not yet available', e);
  }
  return useMemo(() => routeToChipContext(findDeepestRoute(state)), [state]);
}
