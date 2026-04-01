import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { NoteLinkSheet } from '@/components/NoteLinkSheet';

jest.mock('@/db/user', () => ({
  getAllNotes: jest.fn().mockResolvedValue([
    { id: 2, verse_ref: 'genesis_1_1', note_text: 'Creation account note' },
    { id: 3, verse_ref: 'john_1_1', note_text: 'In the beginning was the Word' },
  ]),
  searchNotesFTS: jest.fn().mockResolvedValue([]),
  getLinkedNotes: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/utils/verseRef', () => ({
  displayRef: jest.fn((ref: string) => ref.replace(/_/g, ' ')),
}));

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  currentNoteId: 1,
  linkedNoteIds: [] as number[],
  onLink: jest.fn(),
};

describe('NoteLinkSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing when visible', () => {
    const { getByText } = renderWithProviders(
      <NoteLinkSheet {...defaultProps} />,
    );
    expect(getByText('Link to Note')).toBeTruthy();
  });

  it('shows the search input', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <NoteLinkSheet {...defaultProps} />,
    );
    expect(getByPlaceholderText('Search notes...')).toBeTruthy();
  });

  it('displays notes after loading', async () => {
    const { getByText } = renderWithProviders(
      <NoteLinkSheet {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByText('Creation account note')).toBeTruthy();
      expect(getByText('In the beginning was the Word')).toBeTruthy();
    });
  });

  it('filters out the current note from the list', async () => {
    const { getAllNotes } = require('@/db/user');
    getAllNotes.mockResolvedValueOnce([
      { id: 1, verse_ref: 'genesis_1_1', note_text: 'Current note' },
      { id: 2, verse_ref: 'genesis_1_2', note_text: 'Other note' },
    ]);
    const { queryByText, getByText } = renderWithProviders(
      <NoteLinkSheet {...defaultProps} currentNoteId={1} />,
    );
    await waitFor(() => {
      expect(getByText('Other note')).toBeTruthy();
    });
    expect(queryByText('Current note')).toBeNull();
  });
});
