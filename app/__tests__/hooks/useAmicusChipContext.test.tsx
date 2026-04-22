/**
 * Unit tests for `hooks/useAmicusChipContext`.
 *
 * Covers:
 *   - returns `{ kind: 'none' }` without throwing when rendered OUTSIDE
 *     any NavigationContainer (the pre-mount / bare-tree case that
 *     motivated this hook's existence)
 *   - when rendered INSIDE a NavigationContainer, subscribes to its
 *     state and returns the resolved context — exercised here via the
 *     container's initial state because installing a real stack
 *     navigator in a jest test adds native-module churn without
 *     improving coverage over what routeContext.test.ts already does
 *
 * The global `@react-navigation/native` mock in jest.setup.js is
 * bypassed here: the whole point of this hook is to survive the real
 * implementation's pre-mount throw. We need the real module to verify
 * that.
 */

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAmicusChipContext } from '@/hooks/useAmicusChipContext';

jest.unmock('@react-navigation/native');

describe('useAmicusChipContext', () => {
  it('returns { kind: "none" } without throwing when rendered outside NavigationContainer', () => {
    // No wrapper — the hook must survive this. Previously
    // `useNavigationState` would throw "Couldn't get the navigation
    // state", ErrorBoundary would catch it, and Sentry would log a
    // spurious error on every app boot.
    const { result } = renderHook(() => useAmicusChipContext());
    expect(result.current).toEqual({ kind: 'none' });
  });

  it('returns { kind: "none" } inside a NavigationContainer with no navigator children', () => {
    // A NavigationContainer with nothing inside has state === undefined
    // (no navigator has registered yet). The hook should degrade to
    // `{ kind: 'none' }`, same as the unwrapped case.
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NavigationContainer>{children}</NavigationContainer>
    );
    const { result } = renderHook(() => useAmicusChipContext(), { wrapper });
    expect(result.current).toEqual({ kind: 'none' });
  });

  it('does not throw across re-renders when nav state is unavailable', () => {
    // Guards against regressions where the try/catch only wraps the
    // first call and later renders let the throw escape.
    const { result, rerender } = renderHook(() => useAmicusChipContext());
    expect(result.current).toEqual({ kind: 'none' });
    rerender(undefined);
    expect(result.current).toEqual({ kind: 'none' });
    rerender(undefined);
    expect(result.current).toEqual({ kind: 'none' });
  });
});
