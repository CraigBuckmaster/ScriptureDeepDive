import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { NoteCard } from '@/components/notes/NoteCard';
import type { UserNote, StudyCollection } from '@/types';

// Mock TagChips to simplify
jest.mock('@/components/TagChips', () => {
  const React = require('react');
  return {
    TagChips: ({ tags, onTagsChange }: any) =>
      React.createElement('View', { testID: 'tag-chips' },
        tags.map((t: string) => React.createElement('Text', { key: t }, `#${t}`)),
      ),
  };
});

jest.mock('@/utils/verseRef', () => ({
  displayRef: (ref: string) => ref,
}));

const makeNote = (overrides?: Partial<UserNote>): UserNote => ({
  id: 1,
  verse_ref: 'GEN.1.1',
  note_text: 'This is a test note.',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-06-20T14:30:00Z',
  tags_json: '["prayer","faith"]',
  collection_id: null,
  ...overrides,
});

const baseProps = {
  note: makeNote(),
  isEditing: false,
  editText: '',
  editTags: [] as string[],
  editCollection: null as StudyCollection | null,
  editLinkedNotes: [] as UserNote[],
  formatNoteRef: (ref: string) => ref.replace(/\./g, ' '),
  parseTags: (json: string) => { try { return JSON.parse(json); } catch { return []; } },
  onStartEditing: jest.fn(),
  onEditTextChange: jest.fn(),
  onDone: jest.fn(),
  onDelete: jest.fn(),
  onTagsChange: jest.fn().mockResolvedValue(undefined),
  onOpenCollectionPicker: jest.fn(),
  onOpenLinkSheet: jest.fn(),
  onUnlink: jest.fn(),
};

describe('NoteCard', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Read mode ──

  it('displays note text in read mode', () => {
    const { getByText } = renderWithProviders(<NoteCard {...baseProps} />);
    expect(getByText('This is a test note.')).toBeTruthy();
  });

  it('displays formatted verse ref', () => {
    const { getByText } = renderWithProviders(<NoteCard {...baseProps} />);
    expect(getByText('GEN 1 1')).toBeTruthy();
  });

  it('displays tags in read mode', () => {
    const { getByText } = renderWithProviders(<NoteCard {...baseProps} />);
    expect(getByText('#prayer')).toBeTruthy();
    expect(getByText('#faith')).toBeTruthy();
  });

  it('displays date in read mode', () => {
    const { getByText } = renderWithProviders(<NoteCard {...baseProps} />);
    expect(getByText('2025-06-20')).toBeTruthy();
  });

  it('tapping note text calls onStartEditing', () => {
    const { getByText } = renderWithProviders(<NoteCard {...baseProps} />);
    fireEvent.press(getByText('This is a test note.'));
    expect(baseProps.onStartEditing).toHaveBeenCalledWith(baseProps.note);
  });

  // ── Edit mode ──

  it('shows text input in edit mode', () => {
    const { getByDisplayValue } = renderWithProviders(
      <NoteCard {...baseProps} isEditing editText="Editing this note" editTags={['study']} />,
    );
    expect(getByDisplayValue('Editing this note')).toBeTruthy();
  });

  it('shows TagChips component in edit mode', () => {
    const { getByTestId } = renderWithProviders(
      <NoteCard {...baseProps} isEditing editText="text" editTags={['study']} />,
    );
    expect(getByTestId('tag-chips')).toBeTruthy();
  });

  it('shows collection picker button in edit mode', () => {
    const { getByText } = renderWithProviders(
      <NoteCard {...baseProps} isEditing editText="text" editTags={[]} />,
    );
    expect(getByText('COLLECTION')).toBeTruthy();
    expect(getByText('None')).toBeTruthy();
  });

  it('pressing Done calls onDone with note id', () => {
    const { getByText } = renderWithProviders(
      <NoteCard {...baseProps} isEditing editText="text" editTags={[]} />,
    );
    fireEvent.press(getByText('Done'));
    expect(baseProps.onDone).toHaveBeenCalledWith(1);
  });

  it('pressing Delete calls onDelete with note id', () => {
    const { getByText } = renderWithProviders(
      <NoteCard {...baseProps} isEditing editText="text" editTags={[]} />,
    );
    fireEvent.press(getByText('Delete'));
    expect(baseProps.onDelete).toHaveBeenCalledWith(1);
  });
});
