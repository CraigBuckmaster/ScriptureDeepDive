/**
 * contexts/AmicusFabContext.tsx — controls whether the Amicus FAB renders.
 *
 * Screens that want to suppress the FAB (modals, auth, onboarding, the
 * Amicus tab itself) call `hide()` on mount and `show()` on unmount via
 * the `useSuppressAmicusFab` convenience hook.
 *
 * Uses a ref-count so two simultaneous suppressors don't clobber each
 * other on unmount.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface AmicusFabContextValue {
  isVisible: boolean;
  hide: () => void;
  show: () => void;
}

const AmicusFabContext = createContext<AmicusFabContextValue | null>(null);

export function AmicusFabProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const suppressorsRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  const recompute = useCallback(() => {
    setIsVisible(suppressorsRef.current === 0);
  }, []);

  const hide = useCallback(() => {
    suppressorsRef.current += 1;
    recompute();
  }, [recompute]);

  const show = useCallback(() => {
    suppressorsRef.current = Math.max(0, suppressorsRef.current - 1);
    recompute();
  }, [recompute]);

  const value = useMemo<AmicusFabContextValue>(
    () => ({ isVisible, hide, show }),
    [isVisible, hide, show],
  );

  return (
    <AmicusFabContext.Provider value={value}>
      {children}
    </AmicusFabContext.Provider>
  );
}

export function useAmicusFab(): AmicusFabContextValue {
  const ctx = useContext(AmicusFabContext);
  if (!ctx) {
    // Safe fallback for tests / unmounted callers — no-op suppression.
    return {
      isVisible: true,
      hide: () => undefined,
      show: () => undefined,
    };
  }
  return ctx;
}

/** Convenience hook — call in any screen that should suppress the FAB. */
export function useSuppressAmicusFab(suppress = true): void {
  const { hide, show } = useAmicusFab();
  useEffect(() => {
    if (!suppress) return undefined;
    hide();
    return show;
  }, [hide, show, suppress]);
}
