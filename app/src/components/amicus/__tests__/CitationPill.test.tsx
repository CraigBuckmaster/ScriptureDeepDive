import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import CitationPill from '@/components/amicus/CitationPill';

describe('CitationPill', () => {
  it('renders display label', () => {
    const { getByText } = renderWithProviders(
      <CitationPill
        chunkId="section_panel:romans-9-s1-calvin"
        sourceType="section_panel"
        displayLabel="Calvin · Romans 9"
      />,
    );
    expect(getByText('Calvin · Romans 9')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <CitationPill
        chunkId="word_study:hesed"
        sourceType="word_study"
        displayLabel="Word study · hesed"
        onPress={onPress}
      />,
    );
    fireEvent.press(getByLabelText('Open source: Word study · hesed'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders without onPress without crashing', () => {
    const { getByText } = renderWithProviders(
      <CitationPill
        chunkId="x:y"
        sourceType="word_study"
        displayLabel="Lookup"
      />,
    );
    expect(getByText('Lookup')).toBeTruthy();
  });
});
