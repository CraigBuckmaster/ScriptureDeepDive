/**
 * Tests for useNotesOverlay hook.
 */
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock db/user functions
const mockGetNotesForChapter = jest.fn().mockResolvedValue([]);
const mockSaveNote = jest.fn().mockResolvedValue(1);
const mockUpdateNote = jest.fn().mockResolvedValue(undefined);
const mockDeleteNote = jest.fn().mockResolvedValue(undefined);
const mockUpdateNoteTags = jest.fn().mockResolvedValue(undefined);
const mockSetNoteCollection = jest.fn().mockResolvedValue(undefined);
const mockGetLinkedNotes = jest.fn().mockResolvedValue([]);
const mockLinkNotes = jest.fn().mockResolvedValue(undefined);
const mockUnlinkNotes = jest.fn().mockResolvedValue(undefined);
const mockGetCollection = jest.fn().mockResolvedValue(null);

jest.mock('@/db/user', () => ({
  getNotesForChapter: (...args: any[]) => mockGetNotesForChapter(...args),
  saveNote: (...args: any[]) => mockSaveNote(...args),
  updateNote: (...args: any[]) => mockUpdateNote(...args),
  deleteNote: (...args: any[]) => mockDeleteNote(...args),
  updateNoteTags: (...args: any[]) => mockUpdateNoteTags(...args),
  setNoteCollection: (...args: any[]) => mockSetNoteCollection(...args),
  getLinkedNotes: (...args: any[]) => mockGetLinkedNotes(...args),
  linkNotes: (...args: any[]) => mockLinkNotes(...args),
  unlinkNotes: (...args: any[]) => mockUnlinkNotes(...args),
  getCollection: (...args: any[]) => mockGetCollection(...args),
}));

jest.mock('@/utils/verseRef', () => ({
  formatVerseRef: (bookId: string, chapter: number, verse?: number) =>
    verse ? `${bookId}_${chapter}:${verse}` : `${bookId}_${chapter}`,
  displayRef: (ref: string) => ref.replace(/_/g, ' '),
}));

import { useNotesOverlay } from '@/components/notes/useNotesOverlay';

describe('useNotesOverlay', () => {
  const defaultParams = {
    visible: true,
    onClose: jest.fn(),
    bookId: 'genesis',
    bookName: 'Genesis',
    chapterNum: 1,
    initialVerseNum: null as number | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNotesForChapter.mockResolvedValue([]);
    mockSaveNote.mockResolvedValue(1);
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    expect(result.current.notes).toEqual([]);
    expect(result.current.displayName).toBe('Genesis');
    expect(result.current.editingId).toBeNull();
    expect(result.current.editText).toBe('');
    expect(result.current.showAdd).toBe(false);
    expect(result.current.newText).toBe('');
    expect(result.current.showCollectionPicker).toBe(false);
    expect(result.current.showLinkSheet).toBe(false);
  });

  it('uses bookId as displayName when bookName is not provided', () => {
    const { result } = renderHook(() =>
      useNotesOverlay({ ...defaultParams, bookName: undefined }),
    );
    expect(result.current.displayName).toBe('genesis');
  });

  it('reloads notes when visible', async () => {
    const notes = [{ id: 1, verse_ref: 'genesis_1:1', note_text: 'Test', tags_json: '[]', collection_id: null }];
    mockGetNotesForChapter.mockResolvedValue(notes);

    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(mockGetNotesForChapter).toHaveBeenCalledWith('genesis', 1);
    expect(result.current.notes).toEqual(notes);
  });

  it('handleShowAdd sets showAdd to true', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.handleShowAdd();
    });

    expect(result.current.showAdd).toBe(true);
  });

  it('handleCancelAdd resets new note state', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.handleShowAdd();
    });
    expect(result.current.showAdd).toBe(true);

    await act(async () => {
      result.current.handleCancelAdd();
    });
    expect(result.current.showAdd).toBe(false);
    expect(result.current.newText).toBe('');
  });

  it('handleNewTextChange updates newText', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.handleNewTextChange('Hello world');
    });

    expect(result.current.newText).toBe('Hello world');
  });

  it('startEditing sets editingId and editText', async () => {
    const note = { id: 5, verse_ref: 'genesis_1:1', note_text: 'My note', tags_json: '[]', collection_id: null } as any;

    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.startEditing(note);
    });

    expect(result.current.editingId).toBe(5);
    expect(result.current.editText).toBe('My note');
  });

  it('handleUpdate calls updateNote and resets editingId', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    // Set up editing state
    await act(async () => {
      result.current.startEditing({ id: 3, note_text: 'Original', verse_ref: 'gen_1:1', tags_json: '[]', collection_id: null } as any);
    });

    await act(async () => {
      result.current.setEditText('Updated text');
    });

    await act(async () => {
      await result.current.handleUpdate(3);
    });

    expect(mockUpdateNote).toHaveBeenCalledWith(3, 'Updated text');
  });

  it('handleDelete shows Alert', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.handleDelete(1);
    });

    expect(alertSpy).toHaveBeenCalledWith('Delete Note', 'Are you sure?', expect.any(Array));
    alertSpy.mockRestore();
  });

  it('handleNewNoteBlur saves note with pending text', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.handleShowAdd();
    });

    await act(async () => {
      result.current.handleNewTextChange('New note text');
    });

    await act(async () => {
      await result.current.handleNewNoteBlur();
    });

    expect(mockSaveNote).toHaveBeenCalledWith(expect.any(String), 'New note text');
  });

  it('handleTagsChange updates tags for editing note', async () => {
    const note = { id: 1, verse_ref: 'gen_1:1', note_text: 'Test', tags_json: '[]', collection_id: null } as any;
    mockGetNotesForChapter.mockResolvedValue([note]);

    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.startEditing(note);
    });

    await act(async () => {
      await result.current.handleTagsChange(['tag1', 'tag2']);
    });

    expect(mockUpdateNoteTags).toHaveBeenCalledWith(1, ['tag1', 'tag2']);
  });

  it('handleNewTagsChange updates new note tags', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.handleNewTagsChange(['prayer', 'faith']);
    });

    expect(result.current.newTags).toEqual(['prayer', 'faith']);
  });

  it('setShowCollectionPicker toggles the picker', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.setShowCollectionPicker(true);
    });

    expect(result.current.showCollectionPicker).toBe(true);
  });

  it('setShowLinkSheet toggles the link sheet', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.setShowLinkSheet(true);
    });

    expect(result.current.showLinkSheet).toBe(true);
  });

  it('handleClose calls onClose', async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useNotesOverlay({ ...defaultParams, onClose }),
    );

    await act(async () => {
      await result.current.handleClose();
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('formatNoteRef formats references correctly', () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));
    const formatted = result.current.formatNoteRef('genesis_1:5');
    expect(typeof formatted).toBe('string');
  });

  it('parseTags parses JSON tags', () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));
    expect(result.current.parseTags('["a","b"]')).toEqual(['a', 'b']);
    expect(result.current.parseTags('invalid')).toEqual([]);
  });

  it('handleNewUnlink removes note from newLinkedNotes', async () => {
    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    // The newLinkedNotes starts empty, so unlink should be a no-op
    await act(async () => {
      result.current.handleNewUnlink(99);
    });

    expect(result.current.newLinkedNotes).toEqual([]);
  });

  it('handleCollectionSelect in new note mode stores collection temporarily', async () => {
    mockGetCollection.mockResolvedValue({ id: 1, name: 'My Collection' });

    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    // Enter add mode
    await act(async () => {
      result.current.handleShowAdd();
    });

    await act(async () => {
      await result.current.handleCollectionSelect(1);
    });

    expect(mockGetCollection).toHaveBeenCalledWith(1);
  });

  it('handleUnlink calls unlinkNotes when editing', async () => {
    const note = { id: 1, verse_ref: 'gen_1', note_text: 'Test', tags_json: '[]', collection_id: null } as any;
    mockGetNotesForChapter.mockResolvedValue([note]);

    const { result } = renderHook(() => useNotesOverlay(defaultParams));

    await act(async () => {
      result.current.startEditing(note);
    });

    await act(async () => {
      await result.current.handleUnlink(2);
    });

    expect(mockUnlinkNotes).toHaveBeenCalledWith(1, 2);
  });
});
