import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ContextGuardBanner } from '@/components/guidedStudy/ContextGuardBanner';

const guard = {
  ref: 'jeremiah 29:11',
  book_id: 'jeremiah',
  chapter_num: 29,
  verse_num: 11,
  common_misreading: 'Personal promise of prosperity',
  actual_context_summary: 'Letter to Judean exiles in Babylon',
  suggested_book_id: 'jeremiah',
  suggested_chapter_num: 29,
};

describe('ContextGuardBanner', () => {
  it('renders nothing when no guard is passed', () => {
    const { toJSON } = renderWithProviders(
      <ContextGuardBanner guard={null} onReadContext={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders the common-misreading copy and action link', () => {
    const { getByText } = renderWithProviders(
      <ContextGuardBanner guard={guard} onReadContext={jest.fn()} />,
    );
    expect(getByText('READ IN CONTEXT')).toBeTruthy();
    expect(getByText('Personal promise of prosperity')).toBeTruthy();
    expect(getByText('Open the surrounding chapter')).toBeTruthy();
  });

  it('fires onReadContext when the action row is tapped', () => {
    const onReadContext = jest.fn();
    const { getByText } = renderWithProviders(
      <ContextGuardBanner guard={guard} onReadContext={onReadContext} />,
    );
    fireEvent.press(getByText('Open the surrounding chapter'));
    expect(onReadContext).toHaveBeenCalledTimes(1);
  });

  it('hides itself after the dismiss button is tapped', () => {
    const { queryByText, getByLabelText } = renderWithProviders(
      <ContextGuardBanner guard={guard} onReadContext={jest.fn()} />,
    );
    expect(queryByText('READ IN CONTEXT')).toBeTruthy();
    fireEvent.press(getByLabelText('Dismiss context note'));
    expect(queryByText('READ IN CONTEXT')).toBeNull();
  });
});
