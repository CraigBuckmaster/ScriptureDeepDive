import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { NoteIndicator } from '@/components/NoteIndicator';

describe('NoteIndicator', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <NoteIndicator verseNum={1} hasNote={false} onPress={jest.fn()} />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('calls onPress with verseNum when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <NoteIndicator verseNum={7} hasNote={false} onPress={mockOnPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledWith(7);
  });

  it('shows "Add note" accessibility label when no note exists', () => {
    const { getByLabelText } = renderWithProviders(
      <NoteIndicator verseNum={3} hasNote={false} onPress={jest.fn()} />,
    );
    expect(getByLabelText('Add note for verse 3')).toBeTruthy();
  });

  it('shows "Edit note" accessibility label when note exists', () => {
    const { getByLabelText } = renderWithProviders(
      <NoteIndicator verseNum={3} hasNote={true} onPress={jest.fn()} />,
    );
    expect(getByLabelText('Edit note for verse 3')).toBeTruthy();
  });
});
