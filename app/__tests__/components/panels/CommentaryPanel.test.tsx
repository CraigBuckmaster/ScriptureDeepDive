/**
 * CommentaryPanel.test.tsx — Tests for the scholar commentary panel.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { CommentaryPanel } from '@/components/panels/CommentaryPanel';
import type { CommentaryNote } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const notes: CommentaryNote[] = [
  { ref: 'v. 1', note: 'This verse introduces the concept of creation ex nihilo.' },
  { ref: 'v. 2', note: 'The Spirit of God was hovering over the waters.' },
];

describe('CommentaryPanel', () => {
  it('renders the scholar tag', () => {
    const { getByLabelText } = renderWithProviders(
      <CommentaryPanel notes={notes} scholarId="mac" />,
    );
    expect(getByLabelText('Scholar: MacArthur')).toBeTruthy();
  });

  it('shows "Faithful Paraphrase" subtitle', () => {
    const { getByText } = renderWithProviders(
      <CommentaryPanel notes={notes} scholarId="mac" />,
    );
    expect(getByText('Faithful Paraphrase')).toBeTruthy();
  });

  it('renders notes with ref and text', () => {
    const { getByText } = renderWithProviders(
      <CommentaryPanel notes={notes} scholarId="mac" />,
    );
    expect(getByText('v. 1')).toBeTruthy();
    expect(getByText(/creation ex nihilo/)).toBeTruthy();
    expect(getByText('v. 2')).toBeTruthy();
  });

  it('pressing scholar tag calls onScholarPress', () => {
    const onScholarPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <CommentaryPanel notes={notes} scholarId="mac" onScholarPress={onScholarPress} />,
    );
    fireEvent.press(getByLabelText('Scholar: MacArthur'));
    expect(onScholarPress).toHaveBeenCalled();
  });

  it('renders with empty notes without crashing', () => {
    const { getByText } = renderWithProviders(
      <CommentaryPanel notes={[]} scholarId="mac" />,
    );
    // Should still show scholar tag and subtitle
    expect(getByText('Faithful Paraphrase')).toBeTruthy();
  });
});
