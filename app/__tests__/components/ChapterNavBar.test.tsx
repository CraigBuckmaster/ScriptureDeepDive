/**
 * Tests for ChapterNavBar layout changes.
 *
 * Issues fixed:
 * - Added back button on the left for smoother navigation
 * - Moved translation picker between back button and chapter nav
 * - Removed redundant translation picker from QnavOverlay
 */

import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ChapterNavBar } from '@/components/ChapterNavBar';

const defaultProps = {
  bookName: 'Genesis',
  chapterNum: 1,
  hasPrev: false,
  hasNext: true,
  onPrev: jest.fn(),
  onNext: jest.fn(),
  onQnav: jest.fn(),
  translation: 'niv',
  onTranslationChange: jest.fn(),
};

describe('ChapterNavBar', () => {
  it('renders chapter name', () => {
    const { getByText } = renderWithProviders(<ChapterNavBar {...defaultProps} />);
    expect(getByText('Genesis 1')).toBeTruthy();
  });

  it('renders back button when onBack is provided', () => {
    const { getByLabelText } = renderWithProviders(
      <ChapterNavBar {...defaultProps} onBack={jest.fn()} />
    );
    expect(getByLabelText('Go back')).toBeTruthy();
  });

  it('does not render back button when onBack is undefined', () => {
    const { queryByLabelText } = renderWithProviders(
      <ChapterNavBar {...defaultProps} />
    );
    expect(queryByLabelText('Go back')).toBeNull();
  });

  it('calls onBack when back button pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <ChapterNavBar {...defaultProps} onBack={onBack} />
    );
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders qnav button with chapter label', () => {
    const { getByLabelText } = renderWithProviders(
      <ChapterNavBar {...defaultProps} />
    );
    expect(getByLabelText('Genesis 1. Tap to jump to another chapter.')).toBeTruthy();
  });
});
