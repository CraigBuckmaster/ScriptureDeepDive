/**
 * components/amicus/AmicusFabErrorFallback.tsx
 *
 * Silent-but-self-healing fallback used by the ErrorBoundary that wraps
 * <AmicusFab />. If the FAB throws during render or layout commit
 * (the most common cause is a transient navigation-state inconsistency
 * during Fabric mount), we render NOTHING rather than the default
 * full-screen "Something went wrong" UI — the FAB is non-essential and
 * its failure should never displace primary content.
 *
 * Self-healing: a single auto-retry fires 2 seconds after the throw.
 * Most navigation-state transients resolve within milliseconds, so by
 * the time we retry, the FAB will mount cleanly. Capped at ONE retry
 * per error to avoid mount loops if the underlying issue is persistent
 * (e.g., a real bug we haven't fixed yet). Persistent failures stay
 * silent for the rest of the session — Sentry still captured them via
 * the ErrorBoundary's componentDidCatch.
 */
import React, { useEffect, useRef } from 'react';

const RETRY_DELAY_MS = 2000;

interface Props {
  error: Error | null;
  onRetry: () => void;
}

export function AmicusFabErrorFallback({ error, onRetry }: Props): React.ReactElement | null {
  const hasRetriedRef = useRef(false);

  useEffect(() => {
    // Each new error gets exactly one retry attempt. After that we stay
    // silent for the session. The ref resets only when the component
    // unmounts entirely (e.g., app relaunch).
    if (hasRetriedRef.current) return;
    if (!error) return;
    hasRetriedRef.current = true;
    const t = setTimeout(onRetry, RETRY_DELAY_MS);
    return () => clearTimeout(t);
  }, [error, onRetry]);

  return null;
}
