import { useReaderStore } from '@/stores/readerStore';
import type { Book } from '@/types';

const MOCK_BOOK: Book = {
  id: 'genesis',
  name: 'Genesis',
  testament: 'ot',
  total_chapters: 50,
  book_order: 1,
  is_live: true,
};

describe('readerStore', () => {
  beforeEach(() => {
    useReaderStore.setState({
      currentBook: null,
      currentChapter: 1,
      activePanel: null,
      qnavOpen: false,
      notesOverlayOpen: false,
    });
  });

  it('starts with default state', () => {
    const state = useReaderStore.getState();
    expect(state.currentBook).toBeNull();
    expect(state.currentChapter).toBe(1);
    expect(state.activePanel).toBeNull();
    expect(state.qnavOpen).toBe(false);
  });

  describe('setCurrentBook', () => {
    it('sets book and resets chapter to 1', () => {
      useReaderStore.getState().setCurrentChapter(5);
      useReaderStore.getState().setCurrentBook(MOCK_BOOK);
      const state = useReaderStore.getState();
      expect(state.currentBook).toEqual(MOCK_BOOK);
      expect(state.currentChapter).toBe(1);
    });

    it('clears active panel', () => {
      useReaderStore.getState().setActivePanel('s1', 'heb');
      useReaderStore.getState().setCurrentBook(MOCK_BOOK);
      expect(useReaderStore.getState().activePanel).toBeNull();
    });
  });

  describe('setCurrentChapter', () => {
    it('sets chapter and clears active panel', () => {
      useReaderStore.getState().setActivePanel('s1', 'heb');
      useReaderStore.getState().setCurrentChapter(3);
      const state = useReaderStore.getState();
      expect(state.currentChapter).toBe(3);
      expect(state.activePanel).toBeNull();
    });
  });

  describe('setActivePanel (single-open policy)', () => {
    it('opens a panel', () => {
      useReaderStore.getState().setActivePanel('s1', 'heb');
      expect(useReaderStore.getState().activePanel).toEqual({ sectionId: 's1', panelType: 'heb' });
    });

    it('closes panel when tapping same one', () => {
      useReaderStore.getState().setActivePanel('s1', 'heb');
      useReaderStore.getState().setActivePanel('s1', 'heb');
      expect(useReaderStore.getState().activePanel).toBeNull();
    });

    it('switches to different panel', () => {
      useReaderStore.getState().setActivePanel('s1', 'heb');
      useReaderStore.getState().setActivePanel('s1', 'ctx');
      expect(useReaderStore.getState().activePanel).toEqual({ sectionId: 's1', panelType: 'ctx' });
    });

    it('switches when section differs', () => {
      useReaderStore.getState().setActivePanel('s1', 'heb');
      useReaderStore.getState().setActivePanel('s2', 'heb');
      expect(useReaderStore.getState().activePanel).toEqual({ sectionId: 's2', panelType: 'heb' });
    });
  });

  describe('clearActivePanel', () => {
    it('clears the active panel', () => {
      useReaderStore.getState().setActivePanel('s1', 'heb');
      useReaderStore.getState().clearActivePanel();
      expect(useReaderStore.getState().activePanel).toBeNull();
    });
  });

  describe('toggleQnav', () => {
    it('toggles qnav open state', () => {
      expect(useReaderStore.getState().qnavOpen).toBe(false);
      useReaderStore.getState().toggleQnav();
      expect(useReaderStore.getState().qnavOpen).toBe(true);
      useReaderStore.getState().toggleQnav();
      expect(useReaderStore.getState().qnavOpen).toBe(false);
    });
  });

  describe('toggleNotesOverlay', () => {
    it('toggles notes overlay state', () => {
      expect(useReaderStore.getState().notesOverlayOpen).toBe(false);
      useReaderStore.getState().toggleNotesOverlay();
      expect(useReaderStore.getState().notesOverlayOpen).toBe(true);
    });
  });
});
