import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { RelatedWordCard } from '@/components/RelatedWordCard';

describe('RelatedWordCard', () => {
  it('renders lemma, transliteration, and gloss', () => {
    const { getByText } = renderWithProviders(
      <RelatedWordCard lemma="ἀγαπάω" transliteration="agapaō" gloss="to love" onPress={jest.fn()} />,
    );
    expect(getByText('ἀγαπάω')).toBeTruthy();
    expect(getByText('agapaō')).toBeTruthy();
    expect(getByText('to love')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <RelatedWordCard lemma="λόγος" transliteration="logos" gloss="word" onPress={onPress} />,
    );
    fireEvent.press(getByText('λόγος'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = renderWithProviders(
      <RelatedWordCard lemma="test" transliteration="test" gloss="a test" onPress={jest.fn()} />,
    );
    expect(getByLabelText('Related word: test, a test')).toBeTruthy();
  });
});
