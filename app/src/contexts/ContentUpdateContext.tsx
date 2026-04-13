/**
 * ContentUpdateContext — Shared state for content update UI.
 *
 * Tracks banner visibility, progress percentage, update status,
 * and a dbVersion counter that bumps after each successful OTA
 * update. Data hooks subscribe to dbVersion via useDbVersion()
 * to auto-refetch when the underlying database changes.
 * Part of epic #758 (CloudFlare R2 Delta DB Delivery).
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UpdateStatus } from '../components/ContentUpdateBanner';

interface ContentUpdateState {
  visible: boolean;
  progress: number;
  status: UpdateStatus;
  error: string | null;
  /** Monotonically increasing counter. Bumps after each successful DB swap. */
  dbVersion: number;
}

interface ContentUpdateActions {
  showUpdate: () => void;
  updateProgress: (pct: number) => void;
  setStatus: (status: UpdateStatus, error?: string) => void;
  hideUpdate: () => void;
  /** Increment dbVersion to trigger data hook re-fetches. */
  bumpDbVersion: () => void;
}

type ContentUpdateContextType = ContentUpdateState & ContentUpdateActions;

const ContentUpdateCtx = createContext<ContentUpdateContextType | null>(null);

export function useContentUpdate(): ContentUpdateContextType {
  const ctx = useContext(ContentUpdateCtx);
  if (!ctx) {
    throw new Error('useContentUpdate must be used within a ContentUpdateProvider');
  }
  return ctx;
}

/**
 * Safe accessor for dbVersion only. Returns 0 if called outside the
 * provider (e.g., in tests or isolated renders). Data hooks use this
 * so they work in any context but auto-reload when the DB changes.
 */
export function useDbVersion(): number {
  const ctx = useContext(ContentUpdateCtx);
  return ctx?.dbVersion ?? 0;
}

interface ProviderProps {
  children: ReactNode;
}

export function ContentUpdateProvider({ children }: ProviderProps) {
  const [state, setState] = useState<ContentUpdateState>({
    visible: false,
    progress: 0,
    status: 'downloading',
    error: null,
    dbVersion: 0,
  });

  const showUpdate = useCallback(() => {
    setState((prev) => ({ ...prev, visible: true, progress: 0, status: 'downloading', error: null }));
  }, []);

  const updateProgress = useCallback((pct: number) => {
    setState((prev) => ({ ...prev, progress: pct }));
  }, []);

  const setStatus = useCallback((status: UpdateStatus, error?: string) => {
    setState((prev) => ({ ...prev, status, error: error ?? null }));
  }, []);

  const hideUpdate = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const bumpDbVersion = useCallback(() => {
    setState((prev) => ({ ...prev, dbVersion: prev.dbVersion + 1 }));
  }, []);

  return (
    <ContentUpdateCtx.Provider
      value={{ ...state, showUpdate, updateProgress, setStatus, hideUpdate, bumpDbVersion }}
    >
      {children}
    </ContentUpdateCtx.Provider>
  );
}
