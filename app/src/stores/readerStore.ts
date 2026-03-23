/**
 * stores/readerStore.ts — Reading session state (not persisted).
 *
 * Tracks current book/chapter, active panel (single-open policy),
 * and overlay visibility.
 */

import { create } from 'zustand';
import type { Book } from '../types';

interface ActivePanel {
  sectionId: string;
  panelType: string;
}

interface ReaderState {
  currentBook: Book | null;
  currentChapter: number;
  activePanel: ActivePanel | null;
  qnavOpen: boolean;
  notesOverlayOpen: boolean;

  setCurrentBook: (book: Book | null) => void;
  setCurrentChapter: (ch: number) => void;
  setActivePanel: (sectionId: string, panelType: string) => void;
  clearActivePanel: () => void;
  toggleQnav: () => void;
  toggleNotesOverlay: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBook: null,
  currentChapter: 1,
  activePanel: null,
  qnavOpen: false,
  notesOverlayOpen: false,

  setCurrentBook: (book) => set({ currentBook: book, currentChapter: 1, activePanel: null }),
  setCurrentChapter: (ch) => set({ currentChapter: ch, activePanel: null }),

  /** Single-open policy: tap same panel → close; tap different → switch. */
  setActivePanel: (sectionId, panelType) => {
    const current = get().activePanel;
    if (current?.sectionId === sectionId && current?.panelType === panelType) {
      set({ activePanel: null });
    } else {
      set({ activePanel: { sectionId, panelType } });
    }
  },

  clearActivePanel: () => set({ activePanel: null }),
  toggleQnav: () => set((s) => ({ qnavOpen: !s.qnavOpen })),
  toggleNotesOverlay: () => set((s) => ({ notesOverlayOpen: !s.notesOverlayOpen })),
}));
