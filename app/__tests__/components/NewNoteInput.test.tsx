import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { NewNoteInput } from '@/components/notes/NewNoteInput';
import type { StudyCollection, UserNote } from '@/types';

// Mock TagChips to simplify
jest.mock('@/components/TagChips', () => {
  const React = require('react');
  return {
    TagChips: ({ tags }: any) =>
      React.createElement('View', { testID: 'tag-chips' },
        tags.map((t: string) => React.createElement('Text', { key: t }, `#${t}`)),
      ),
  };
});

jest.mock('@/utils/verseRef', () => ({
  displayRef: (ref: string) => ref,
}));

const baseProps = {
  addRef: 'GEN.1.1',
  newText: '',
  newTextRef: { current: null },
  formatNoteRef: (ref: string) => ref.replace(/\./g, ' '),
  onTextChange: jest.fn(),
  onBlur: jest.fn(),
  onCancel: jest.fn(),
  newTags: [] as string[],
  onNewTagsChange: jest.fn(),
  newCollection: null as StudyCollection | null,
  onOpenCollectionPicker: jest.fn(),
  newLinkedNotes: [] as UserNote[],
  onOpenLinkSheet: jest.fn(),
  onUnlink: jest.fn(),
};

describe('NewNoteInput', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders formatted verse ref', () => {
    const { getByText } = renderWithProviders(<NewNoteInput {...baseProps} />);
    expect(getByText('GEN 1 1')).toBeTruthy();
  });

  it('renders text input with placeholder', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <NewNoteInput {...baseProps} />,
    );
    expect(getByPlaceholderText('Type your note — saves automatically...')).toBeTruthy();
  });

  it('calls onTextChange when typing in text input', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <NewNoteInput {...baseProps} />,
    );
    fireEvent.changeText(
      getByPlaceholderText('Type your note — saves automatically...'),
      'Hello world',
    );
    expect(baseProps.onTextChange).toHaveBeenCalledWith('Hello world');
  });

  it('renders tags section with TagChips', () => {
    const { getByTestId, getByText } = renderWithProviders(
      <NewNoteInput {...baseProps} newTags={['study']} />,
    );
    expect(getByTestId('tag-chips')).toBeTruthy();
    expect(getByText('TAGS')).toBeTruthy();
  });

  it('renders collection picker button', () => {
    const { getByText } = renderWithProviders(<NewNoteInput {...baseProps} />);
    expect(getByText('COLLECTION')).toBeTruthy();
    expect(getByText('None')).toBeTruthy();
  });

  it('shows collection name when a collection is selected', () => {
    const collection: StudyCollection = {
      id: 1, name: 'My Study', description: '', color: '#ff0000', created_at: '', updated_at: '',
    };
    const { getByText } = renderWithProviders(
      <NewNoteInput {...baseProps} newCollection={collection} />,
    );
    expect(getByText('My Study')).toBeTruthy();
  });

  it('renders linked notes section', () => {
    const { getByText } = renderWithProviders(<NewNoteInput {...baseProps} />);
    expect(getByText('LINKED NOTES')).toBeTruthy();
    expect(getByText('No linked notes')).toBeTruthy();
  });

  it('cancel button calls onCancel', () => {
    const { getByText } = renderWithProviders(<NewNoteInput {...baseProps} />);
    fireEvent.press(getByText('Cancel'));
    expect(baseProps.onCancel).toHaveBeenCalled();
  });
});
