/**
 * ContentUpdateContext — Shared state for content update UI.
 *
 * Tracks banner visibility, progress percentage, and update status
 * so any component in the tree can react to ongoing OTA updates.
 * Part of epic #758 (CloudFlare R2 Delta DB Delivery).
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UpdateStatus } from '../components/ContentUpdateBanner';

interface ContentUpdateState {
  visible: boolean;
  progress: number;
  status: UpdateStatus;
  error: string | null;
}

interface ContentUpdateActions {
  showUpdate: () => void;
  updateProgress: (pct: number) => void;
  setStatus: (status: UpdateStatus, error?: string) => void;
  hideUpdate: () => void;
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

interface ProviderProps {
  children: ReactNode;
}

export function ContentUpdateProvider({ children }: ProviderProps) {
  const [state, setState] = useState<ContentUpdateState>({
    visible: false,
    progress: 0,
    status: 'downloading',
    error: null,
  });

  const showUpdate = useCallback(() => {
    setState({ visible: true, progress: 0, status: 'downloading', error: null });
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

  return (
    <ContentUpdateCtx.Provider
      value={{ ...state, showUpdate, updateProgress, setStatus, hideUpdate }}
    >
      {children}
    </ContentUpdateCtx.Provider>
  );
}
