/**
 * components/amicus/AmicusFabErrorFallback.tsx
 *
 * Silent fallback used by the ErrorBoundary that wraps <AmicusFab />.
 * If the FAB throws during render (e.g. a transient navigation-context
 * issue during app warmup), we render NOTHING rather than the default
 * full-screen "Something went wrong" UI — the FAB is non-essential and
 * its failure should never displace primary content.
 *
 * The error is still captured by the ErrorBoundary's componentDidCatch
 * (which logs via the project's logger), so this is silent to the user
 * but visible to telemetry.
 */
import React from 'react';

interface Props {
  error: Error | null;
  onRetry: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AmicusFabErrorFallback(_props: Props): React.ReactElement | null {
  return null;
}
