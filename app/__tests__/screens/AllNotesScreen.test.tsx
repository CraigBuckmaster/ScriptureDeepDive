import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import AllNotesScreen from '@/screens/AllNotesScreen';

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/TagChips', () => ({
  TagChips: ({ tags }: { tags: string[] }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'TagChips' }, tags.join(', '));
  },
}));

jest.mock('@/components/CollectionPicker', () => ({
  CollectionPicker: () => null,
}));

jest.mock('@/components/NoteLinkSheet', () => ({
  NoteLinkSheet: () => null,
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

// ── Mock DB functions ────────────────────────────────────────────
const mockGetAllNotes = jest.fn().mockResolvedValue([]);
const mockSearchNotesFTS = jest.fn().mockResolvedValue([]);
const mockGetCollections = jest.fn().mockResolvedValue([]);
const mockGetCollectionNoteCounts = jest.fn().mockResolvedValue({});
const mockGetAllTags = jest.fn().mockResolvedValue([]);
const mockGetNotesByTag = jest.fn().mockResolvedValue([]);
const mockUpdateNote = jest.fn().mockResolvedValue(undefined);
const mockDeleteNote = jest.fn().mockResolvedValue(undefined);
const mockCreateCollection = jest.fn().mockResolvedValue(1);
const mockUpdateNoteTags = jest.fn().mockResolvedValue(undefined);
const mockSetNoteCollection = jest.fn().mockResolvedValue(undefined);
const mockGetCollection = jest.fn().mockResolvedValue(null);
const mockGetLinkedNotes = jest.fn().mockResolvedValue([]);
const mockLinkNotes = jest.fn().mockResolvedValue(undefined);
const mockUnlinkNotes = jest.fn().mockResolvedValue(undefined);

jest.mock('@/db/user', () => ({
  getAllNotes: (...args: unknown[]) => mockGetAllNotes(...args),
  searchNotesFTS: (...args: unknown[]) => mockSearchNotesFTS(...args),
  getCollections: (...args: unknown[]) => mockGetCollections(...args),
  getCollectionNoteCounts: (...args: unknown[]) => mockGetCollectionNoteCounts(...args),
  getAllTags: (...args: unknown[]) => mockGetAllTags(...args),
  getNotesByTag: (...args: unknown[]) => mockGetNotesByTag(...args),
  updateNote: (...args: unknown[]) => mockUpdateNote(...args),
  deleteNote: (...args: unknown[]) => mockDeleteNote(...args),
  createCollection: (...args: unknown[]) => mockCreateCollection(...args),
  updateNoteTags: (...args: unknown[]) => mockUpdateNoteTags(...args),
  setNoteCollection: (...args: unknown[]) => mockSetNoteCollection(...args),
  getCollection: (...args: unknown[]) => mockGetCollection(...args),
  getLinkedNotes: (...args: unknown[]) => mockGetLinkedNotes(...args),
  linkNotes: (...args: unknown[]) => mockLinkNotes(...args),
  unlinkNotes: (...args: unknown[]) => mockUnlinkNotes(...args),
}));

jest.mock('@/utils/verseRef', () => ({
  parseVerseRef: (ref: string) => {
    if (ref === 'genesis 1:1') return { bookId: 'genesis', ch: 1, v: 1 };
    if (ref === 'genesis 1:2') return { bookId: 'genesis', ch: 1, v: 2 };
    if (ref === 'psalms 23:1') return { bookId: 'psalms', ch: 23, v: 1 };
    return null;
  },
  displayRef: (key: string) => key.replace(/_/g, ' '),
}));

// ── Helpers ──────────────────────────────────────────────────────
const sampleNotes = [
  {
    id: 1,
    verse_ref: 'genesis 1:1',
    note_text: 'In the beginning note',
    tags_json: '["creation","theology"]',
    collection_id: null,
    updated_at: '2025-01-01',
  },
  {
    id: 2,
    verse_ref: 'genesis 1:2',
    note_text: 'Formless and void note',
    tags_json: '[]',
    collection_id: null,
    updated_at: '2025-01-02',
  },
  {
    id: 3,
    verse_ref: 'psalms 23:1',
    note_text: 'The Lord is my shepherd',
    tags_json: '["comfort"]',
    collection_id: null,
    updated_at: '2025-02-01',
  },
];

const sampleCollections = [
  { id: 1, name: 'Creation Studies', description: 'Notes on creation', color: '#4488cc' },
  { id: 2, name: 'Psalms Deep Dive', description: null, color: '#cc8844' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAllNotes.mockResolvedValue([]);
  mockGetCollections.mockResolvedValue([]);
  mockGetCollectionNoteCounts.mockResolvedValue({});
  mockGetAllTags.mockResolvedValue([]);
});

describe('AllNotesScreen', () => {
  it('renders the Notes header', async () => {
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    expect(getByText('Notes')).toBeTruthy();
  });

  it('renders 3 tabs: Collections, Tags, All', () => {
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    expect(getByText('Collections')).toBeTruthy();
    expect(getByText('Tags')).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
  });

  it('starts on the All tab and calls getAllNotes', async () => {
    renderWithProviders(<AllNotesScreen />);
    await waitFor(() => {
      expect(mockGetAllNotes).toHaveBeenCalled();
    });
  });

  it('shows notes grouped by chapter on the All tab', async () => {
    mockGetAllNotes.mockResolvedValue(sampleNotes);
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    await waitFor(() => {
      expect(getByText('In the beginning note')).toBeTruthy();
    });
    expect(getByText('The Lord is my shepherd')).toBeTruthy();
  });

  it('shows empty state when no notes exist', async () => {
    mockGetAllNotes.mockResolvedValue([]);
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    await waitFor(() => {
      expect(getByText(/No notes yet/)).toBeTruthy();
    });
  });

  it('switches to Collections tab and loads collections', async () => {
    mockGetCollections.mockResolvedValue(sampleCollections);
    mockGetCollectionNoteCounts.mockResolvedValue({ 1: 5, 2: 3 });
    const { getByText } = renderWithProviders(<AllNotesScreen />);

    fireEvent.press(getByText('Collections'));

    await waitFor(() => {
      expect(mockGetCollections).toHaveBeenCalled();
    });
    expect(getByText('Creation Studies')).toBeTruthy();
    expect(getByText('Psalms Deep Dive')).toBeTruthy();
  });

  it('shows collection note counts', async () => {
    mockGetCollections.mockResolvedValue(sampleCollections);
    mockGetCollectionNoteCounts.mockResolvedValue({ 1: 5, 2: 3 });
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    fireEvent.press(getByText('Collections'));

    await waitFor(() => {
      expect(getByText('5')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });
  });

  it('shows empty state for collections tab', async () => {
    mockGetCollections.mockResolvedValue([]);
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    fireEvent.press(getByText('Collections'));

    await waitFor(() => {
      expect(getByText(/No collections yet/)).toBeTruthy();
    });
  });

  it('switches to Tags tab and loads tags', async () => {
    mockGetAllTags.mockResolvedValue(['creation', 'theology', 'comfort']);
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    fireEvent.press(getByText('Tags'));

    await waitFor(() => {
      expect(mockGetAllTags).toHaveBeenCalled();
    });
    expect(getByText('#creation')).toBeTruthy();
    expect(getByText('#theology')).toBeTruthy();
    expect(getByText('#comfort')).toBeTruthy();
  });

  it('shows empty state for tags tab', async () => {
    mockGetAllTags.mockResolvedValue([]);
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    fireEvent.press(getByText('Tags'));

    await waitFor(() => {
      expect(getByText(/No tags yet/)).toBeTruthy();
    });
  });

  it('loads notes for a selected tag', async () => {
    mockGetAllTags.mockResolvedValue(['creation']);
    mockGetNotesByTag.mockResolvedValue([sampleNotes[0]]);
    const { getByText } = renderWithProviders(<AllNotesScreen />);
    fireEvent.press(getByText('Tags'));

    await waitFor(() => {
      expect(getByText('#creation')).toBeTruthy();
    });
    fireEvent.press(getByText('#creation'));

    await waitFor(() => {
      expect(mockGetNotesByTag).toHaveBeenCalledWith('creation');
    });
  });

  it('shows Delete button on notes and triggers confirmation', async () => {
    mockGetAllNotes.mockResolvedValue([sampleNotes[0]]);
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = renderWithProviders(<AllNotesScreen />);

    await waitFor(() => {
      expect(getByText('In the beginning note')).toBeTruthy();
    });

    fireEvent.press(getByText('Delete'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete Note',
      'Are you sure?',
      expect.any(Array),
    );
    alertSpy.mockRestore();
  });

  it('shows tags on individual note cards', async () => {
    mockGetAllNotes.mockResolvedValue([sampleNotes[0]]);
    const { getByText } = renderWithProviders(<AllNotesScreen />);

    await waitFor(() => {
      expect(getByText('#creation')).toBeTruthy();
      expect(getByText('#theology')).toBeTruthy();
    });
  });

  it('shows search empty state when search has no results', async () => {
    mockGetAllNotes.mockResolvedValue([]);
    mockSearchNotesFTS.mockResolvedValue([]);
    const { getByText, getByPlaceholderText } = renderWithProviders(<AllNotesScreen />);

    await waitFor(() => {
      expect(getByText(/No notes yet/)).toBeTruthy();
    });

    // Type a search query
    fireEvent.changeText(getByPlaceholderText('Search notes...'), 'nonexistent term');

    await waitFor(() => {
      expect(getByText(/No notes match your search/)).toBeTruthy();
    });
  });

  it('uses searchNotesFTS when query is >= 2 characters', async () => {
    mockSearchNotesFTS.mockResolvedValue([sampleNotes[0]]);
    const { getByPlaceholderText } = renderWithProviders(<AllNotesScreen />);

    fireEvent.changeText(getByPlaceholderText('Search notes...'), 'beginning');

    await waitFor(() => {
      expect(mockSearchNotesFTS).toHaveBeenCalledWith('beginning');
    });
  });

  it('enters edit mode when a note is tapped', async () => {
    mockGetAllNotes.mockResolvedValue([sampleNotes[0]]);
    const { getByText, findByDisplayValue } = renderWithProviders(<AllNotesScreen />);

    await waitFor(() => {
      expect(getByText('In the beginning note')).toBeTruthy();
    });

    fireEvent.press(getByText('In the beginning note'));

    // Should show the edit text input with the note text
    const input = await findByDisplayValue('In the beginning note');
    expect(input).toBeTruthy();
  });

  it('shows "Back to all tags" link when a tag is selected', async () => {
    mockGetAllTags.mockResolvedValue(['creation']);
    mockGetNotesByTag.mockResolvedValue([sampleNotes[0]]);
    const { getByText, findByText } = renderWithProviders(<AllNotesScreen />);

    fireEvent.press(getByText('Tags'));

    await waitFor(() => {
      expect(getByText('#creation')).toBeTruthy();
    });

    fireEvent.press(getByText('#creation'));

    const backLink = await findByText(/All Tags/);
    expect(backLink).toBeTruthy();
  });

  it('clears search when X button is pressed', async () => {
    mockGetAllNotes.mockResolvedValue(sampleNotes);
    const { getByPlaceholderText, getByLabelText } = renderWithProviders(<AllNotesScreen />);

    fireEvent.changeText(getByPlaceholderText('Search notes...'), 'test');

    await waitFor(() => {
      expect(getByLabelText('Clear search')).toBeTruthy();
    });

    fireEvent.press(getByLabelText('Clear search'));

    await waitFor(() => {
      expect(mockGetAllNotes).toHaveBeenCalled();
    });
  });
});
