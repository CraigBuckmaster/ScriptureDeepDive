/**
 * providers/ContentUpdateProvider.tsx — Lifecycle-aware content updater.
 *
 * Listens for app state changes (background → active) and triggers
 * OTA content update checks via ContentUpdater. Bridges the update
 * service with the UI context so the banner reflects real progress.
 * Part of epic #758 (CloudFlare R2 Delta DB Delivery).
 */

import React, { useEffect, useRef, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { ContentUpdater } from '../services/ContentUpdater';
import {
  ContentUpdateProvider as ContextProvider,
  useContentUpdate,
} from '../contexts/ContentUpdateContext';
import { ContentUpdateBanner } from '../components/ContentUpdateBanner';
import { logger } from '../utils/logger';

const TAG = 'ContentUpdateProvider';

/**
 * Inner component that uses the context to drive updates.
 * Separated so it can call useContentUpdate() inside the provider.
 */
function ContentUpdateListener({ children }: { children: ReactNode }) {
  const { visible, progress, status, showUpdate, updateProgress, setStatus, hideUpdate } =
    useContentUpdate();
  const checking = useRef(false);

  useEffect(() => {
    async function runCheck() {
      if (checking.current) return;
      if (!ContentUpdater.shouldCheckForUpdates()) return;
      checking.current = true;

      try {
        // Peek at manifest first to avoid showing banner for no-ops
        const manifest = await ContentUpdater.fetchManifest();
        const installed = await ContentUpdater.getInstalledVersion();

        if (installed === manifest.current_version) {
          logger.info(TAG, 'Already up to date — no banner needed');
          return;
        }

        // There's an update — show the banner and run the full check
        showUpdate();
        updateProgress(10);

        const result = await ContentUpdater.checkForUpdates();

        if (result.status === 'updated') {
          updateProgress(100);
          setStatus('success');
        } else if (result.status === 'failed') {
          setStatus('error', result.error);
        }
        // 'up_to_date' means manifest changed between peek and check — hide banner
        if (result.status === 'up_to_date') {
          hideUpdate();
        }
      } catch (err) {
        logger.error(TAG, 'Update check error', err);
        setStatus('error', err instanceof Error ? err.message : String(err));
      } finally {
        checking.current = false;
      }
    }

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        runCheck();
      }
    };

    // Check on mount (initial app open)
    runCheck();

    // Check when app comes to foreground
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [showUpdate, updateProgress, setStatus, hideUpdate]);

  return (
    <>
      {children}
      <ContentUpdateBanner
        visible={visible}
        progress={progress}
        status={status}
        onDismiss={hideUpdate}
      />
    </>
  );
}

/**
 * Wrap the app tree to enable OTA content updates with UI feedback.
 */
export function ContentUpdateProvider({ children }: { children: ReactNode }) {
  return (
    <ContextProvider>
      <ContentUpdateListener>{children}</ContentUpdateListener>
    </ContextProvider>
  );
}
