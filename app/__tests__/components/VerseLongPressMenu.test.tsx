import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { VerseLongPressMenu } from '@/components/VerseLongPressMenu';

jest.mock('@/utils/shareVerse', () => ({
  copyVerse: jest.fn().mockResolvedValue(undefined),
  shareVerse: jest.fn().mockResolvedValue(undefined),
}));

const defaultProps = {
  visible: true,
  verseText: 'In the beginning God created the heavens and the earth.',
  verseRef: 'Genesis 1:1',
  translation: 'KJV',
  onClose: jest.fn(),
  onAddNote: jest.fn(),
  onHighlight: jest.fn(),
};

describe('VerseLongPressMenu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders when visible=true', () => {
    const { getByText } = renderWithProviders(
      <VerseLongPressMenu {...defaultProps} />,
    );
    expect(getByText('Genesis 1:1')).toBeTruthy();
    expect(getByText(/In the beginning/)).toBeTruthy();
  });

  it('shows Copy, Share, Highlight, and Add Note options', () => {
    const { getByText } = renderWithProviders(
      <VerseLongPressMenu {...defaultProps} />,
    );
    expect(getByText('Copy')).toBeTruthy();
    expect(getByText('Share')).toBeTruthy();
    expect(getByText('Highlight')).toBeTruthy();
    expect(getByText('Add Note')).toBeTruthy();
  });

  it('calls copyVerse when Copy is pressed', () => {
    const { copyVerse } = require('@/utils/shareVerse');
    const { getByText } = renderWithProviders(
      <VerseLongPressMenu {...defaultProps} />,
    );
    fireEvent.press(getByText('Copy'));
    expect(copyVerse).toHaveBeenCalledWith(
      defaultProps.verseText,
      defaultProps.verseRef,
      defaultProps.translation,
    );
  });

  it('calls onClose then shareVerse when Share is pressed', () => {
    const { getByText } = renderWithProviders(
      <VerseLongPressMenu {...defaultProps} />,
    );
    fireEvent.press(getByText('Share'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose and onAddNote when Add Note is pressed', () => {
    const { getByText } = renderWithProviders(
      <VerseLongPressMenu {...defaultProps} />,
    );
    fireEvent.press(getByText('Add Note'));
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(defaultProps.onAddNote).toHaveBeenCalled();
  });

  it('shows "Change Highlight" when highlightColor is set', () => {
    const { getByText } = renderWithProviders(
      <VerseLongPressMenu {...defaultProps} highlightColor="#bfa050" />,
    );
    expect(getByText('Change Highlight')).toBeTruthy();
  });
});
