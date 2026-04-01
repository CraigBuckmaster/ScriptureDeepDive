import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { TappableReference } from '@/components/TappableReference';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn((text: string) => {
    // Simulate finding "Gen 3:15" in the text
    const idx = text.indexOf('Gen 3:15');
    if (idx === -1) return [];
    return [{ ref: 'Gen 3:15', start: idx, end: idx + 8 }];
  }),
}));

jest.mock('@/utils/verseResolver', () => ({
  parseReference: jest.fn((ref: string) => ({
    book: 'Genesis',
    chapter: 3,
    verse: 15,
  })),
}));

describe('TappableReference', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(
      <TappableReference text="Hello world" />,
    );
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('returns null for empty text', () => {
    const { toJSON } = renderWithProviders(
      <TappableReference text="" />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders plain text when no references are found', () => {
    const { getByText } = renderWithProviders(
      <TappableReference text="No refs here." />,
    );
    expect(getByText('No refs here.')).toBeTruthy();
  });

  it('renders tappable scripture references with link role', () => {
    const { getByLabelText } = renderWithProviders(
      <TappableReference text="See Gen 3:15 for details." />,
    );
    expect(getByLabelText('Scripture reference: Gen 3:15')).toBeTruthy();
  });

  it('calls onRefPress with parsed data when a reference is tapped', () => {
    const onRefPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <TappableReference text="See Gen 3:15 for details." onRefPress={onRefPress} />,
    );
    fireEvent.press(getByLabelText('Scripture reference: Gen 3:15'));
    expect(onRefPress).toHaveBeenCalledWith({ book: 'Genesis', chapter: 3, verse: 15 });
  });
});
