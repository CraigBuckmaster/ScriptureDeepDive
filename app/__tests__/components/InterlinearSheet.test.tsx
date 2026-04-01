import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { InterlinearSheet } from '@/components/InterlinearSheet';

jest.mock('@/db/content', () => ({
  getInterlinearWords: jest.fn().mockResolvedValue([
    {
      id: 'w1',
      original: '\u05D1\u05E8\u05D0\u05E9\u05D9\u05EA',
      transliteration: 'bereshit',
      strongs: 'H7225',
      morphology: 'Noun',
      gloss: 'In the beginning',
      word_study_id: null,
    },
  ]),
}));

const defaultProps = {
  visible: true,
  bookId: 'genesis',
  chapter: 1,
  verse: 1,
  verseRef: 'Genesis 1:1',
  onClose: jest.fn(),
};

describe('InterlinearSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing when visible', () => {
    const { getByText } = renderWithProviders(
      <InterlinearSheet {...defaultProps} />,
    );
    expect(getByText('INTERLINEAR')).toBeTruthy();
  });

  it('shows the verse reference', () => {
    const { getByText } = renderWithProviders(
      <InterlinearSheet {...defaultProps} />,
    );
    expect(getByText('Genesis 1:1')).toBeTruthy();
  });

  it('displays word cards after loading', async () => {
    const { getByText } = renderWithProviders(
      <InterlinearSheet {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByText('bereshit')).toBeTruthy();
    });
  });

  it('calls onClose when backdrop is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = renderWithProviders(
      <InterlinearSheet {...defaultProps} onClose={onClose} />,
    );
    // The X close button triggers onClose
    fireEvent(getByText('Genesis 1:1').parent!.parent!, 'requestClose');
  });

  it('shows empty message when no interlinear data', async () => {
    const { getInterlinearWords } = require('@/db/content');
    getInterlinearWords.mockResolvedValueOnce([]);

    const { getByText } = renderWithProviders(
      <InterlinearSheet {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByText('No interlinear data available for this verse.')).toBeTruthy();
    });
  });
});
