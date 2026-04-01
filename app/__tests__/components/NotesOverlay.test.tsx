import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { NotesOverlay } from '@/components/notes/NotesOverlay';

jest.mock('lucide-react-native', () => ({
  X: () => null,
  Plus: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/components/CollectionPicker', () => ({
  CollectionPicker: () => null,
}));

jest.mock('@/components/NoteLinkSheet', () => ({
  NoteLinkSheet: () => null,
}));

const mockState = {
  notes: [] as any[],
  displayName: 'Genesis',
  editingId: null,
  editText: '',
  editTags: [],
  editCollection: null,
  editLinkedNotes: [],
  showAdd: false,
  addRef: '',
  newText: '',
  newTextRef: { current: null },
  newTags: [],
  newCollection: null,
  newLinkedNotes: [],
  showCollectionPicker: false,
  showLinkSheet: false,
  formatNoteRef: jest.fn((ref: string) => ref),
  parseTags: jest.fn(() => []),
  startEditing: jest.fn(),
  setEditText: jest.fn(),
  handleUpdate: jest.fn(),
  handleDelete: jest.fn(),
  handleTagsChange: jest.fn(),
  setShowCollectionPicker: jest.fn(),
  setShowLinkSheet: jest.fn(),
  handleUnlink: jest.fn(),
  handleShowAdd: jest.fn(),
  handleClose: jest.fn(),
  handleNewTextChange: jest.fn(),
  handleNewNoteBlur: jest.fn(),
  handleCancelAdd: jest.fn(),
  handleNewTagsChange: jest.fn(),
  handleNewUnlink: jest.fn(),
  handleCollectionSelect: jest.fn(),
  handleLinkNote: jest.fn(),
};

jest.mock('@/components/notes/useNotesOverlay', () => ({
  useNotesOverlay: () => mockState,
}));

jest.mock('@/components/notes/NoteCard', () => ({
  NoteCard: () => null,
}));

jest.mock('@/components/notes/NewNoteInput', () => ({
  NewNoteInput: () => null,
}));

describe('NotesOverlay', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders header with book name and chapter', () => {
    const { getByText } = renderWithProviders(
      <NotesOverlay visible onClose={jest.fn()} bookId="gen" bookName="Genesis" chapterNum={3} />,
    );
    expect(getByText('Notes — Genesis 3')).toBeTruthy();
  });

  it('shows empty message when there are no notes', () => {
    const { getByText } = renderWithProviders(
      <NotesOverlay visible onClose={jest.fn()} bookId="gen" bookName="Genesis" chapterNum={1} />,
    );
    expect(getByText('No notes yet for this chapter.')).toBeTruthy();
  });

  it('calls handleClose when close button is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <NotesOverlay visible onClose={jest.fn()} bookId="gen" bookName="Genesis" chapterNum={1} />,
    );
    fireEvent.press(getByLabelText('Close notes'));
    expect(mockState.handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls handleShowAdd when add button is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <NotesOverlay visible onClose={jest.fn()} bookId="gen" bookName="Genesis" chapterNum={1} />,
    );
    fireEvent.press(getByLabelText('Add note'));
    expect(mockState.handleShowAdd).toHaveBeenCalledTimes(1);
  });
});
