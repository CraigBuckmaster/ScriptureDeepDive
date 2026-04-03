import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { AlphabetBar } from '@/components/AlphabetBar';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

describe('AlphabetBar', () => {
  const defaultProps = {
    activeLetter: null,
    availableLetters: new Set(['A', 'B', 'C']),
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 26 letters A-Z', () => {
    const { getByText } = renderWithProviders(<AlphabetBar {...defaultProps} />);
    for (const letter of LETTERS) {
      expect(getByText(letter)).toBeTruthy();
    }
  });

  it('calls onSelect when an available letter is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <AlphabetBar {...defaultProps} onSelect={onSelect} />,
    );
    fireEvent.press(getByText('A'));
    expect(onSelect).toHaveBeenCalledWith('A');
  });

  it('does NOT call onSelect when an unavailable letter is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <AlphabetBar {...defaultProps} onSelect={onSelect} />,
    );
    // 'Z' is not in the available set
    fireEvent.press(getByText('Z'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('displays the active letter', () => {
    const { getByText } = renderWithProviders(
      <AlphabetBar {...defaultProps} activeLetter="B" />,
    );
    expect(getByText('B')).toBeTruthy();
  });
});
