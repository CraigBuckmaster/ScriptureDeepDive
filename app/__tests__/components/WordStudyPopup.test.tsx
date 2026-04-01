import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { WordStudyPopup } from '@/components/WordStudyPopup';

jest.mock('@/db/content', () => ({
  getAllWordStudies: jest.fn().mockResolvedValue([
    {
      id: 'hesed',
      original: 'חֶסֶד',
      transliteration: 'hesed',
      strongs: 'H2617',
      glosses_json: '["steadfast love","mercy","kindness"]',
      semantic_range: 'Loyal love, covenant faithfulness',
      note: 'Central to covenant theology.',
    },
  ]),
}));

describe('WordStudyPopup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <WordStudyPopup visible onClose={jest.fn()} word={null} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('shows "No word selected" when word is null', () => {
    const { getByText } = renderWithProviders(
      <WordStudyPopup visible onClose={jest.fn()} word={null} />,
    );
    expect(getByText('No word selected')).toBeTruthy();
  });

  it('displays lexicon entry when a matching word is provided', async () => {
    const { getByText } = renderWithProviders(
      <WordStudyPopup visible onClose={jest.fn()} word="hesed" />,
    );
    await waitFor(() => expect(getByText('חֶסֶד')).toBeTruthy());
    expect(getByText('hesed')).toBeTruthy();
    expect(getByText("Strong's: H2617")).toBeTruthy();
  });

  it('shows no-match message for unknown word', async () => {
    const { getByText } = renderWithProviders(
      <WordStudyPopup visible onClose={jest.fn()} word="zzzzz" />,
    );
    await waitFor(() =>
      expect(getByText('No lexicon entry found for "zzzzz"')).toBeTruthy(),
    );
  });

  it('calls onGoToFullStudy and onClose when link is pressed', async () => {
    const onGoToFullStudy = jest.fn();
    const onClose = jest.fn();
    const { getByText } = renderWithProviders(
      <WordStudyPopup
        visible
        onClose={onClose}
        word="hesed"
        onGoToFullStudy={onGoToFullStudy}
      />,
    );
    await waitFor(() => expect(getByText('See full study →')).toBeTruthy());
    fireEvent.press(getByText('See full study →'));
    expect(onGoToFullStudy).toHaveBeenCalledWith('hesed');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
