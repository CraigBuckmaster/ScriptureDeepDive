/**
 * PanelCallbacksContext — Provides panel callback handlers via context
 * to eliminate prop drilling through PanelContainer → PanelRenderer → 20+ panels.
 *
 * Usage in ChapterScreen (provider):
 *   <PanelCallbacksProvider value={{ onRefPress, onWordStudyPress, ... }}>
 *     <PanelContainer ... />
 *   </PanelCallbacksProvider>
 *
 * Usage in panel components (consumer):
 *   const { onRefPress } = usePanelCallbacks();
 */

import { createContext, useContext } from 'react';
import type { ParsedRef } from '../../types';

export interface PanelCallbacks {
  onRefPress?: (ref: ParsedRef) => void;
  onWordStudyPress?: (word: string) => void;
  onScholarPress?: (scholarId: string) => void;
  onPersonPress?: (name: string) => void;
  onPlacePress?: (name: string) => void;
  onEventPress?: (name: string) => void;
}

const PanelCallbacksContext = createContext<PanelCallbacks>({});

export const PanelCallbacksProvider = PanelCallbacksContext.Provider;

export function usePanelCallbacks(): PanelCallbacks {
  return useContext(PanelCallbacksContext);
}
