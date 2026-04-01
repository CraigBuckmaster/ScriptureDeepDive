/**
 * PlacesPanel.test.tsx — Tests for the places panel.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { PlacesPanel } from '@/components/panels/PlacesPanel';
import type { PlaceEntry } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const entries: PlaceEntry[] = [
  { name: 'Bethlehem', role: 'Birthplace of David', text: 'A small town south of Jerusalem.' },
  { name: 'Jerusalem', text: 'The holy city.' },
];

describe('PlacesPanel', () => {
  it('renders place entries', () => {
    const { getByText } = renderWithProviders(<PlacesPanel entries={entries} />);
    expect(getByText('Bethlehem')).toBeTruthy();
    expect(getByText('Jerusalem')).toBeTruthy();
  });

  it('shows name and description text', () => {
    const { getByText } = renderWithProviders(<PlacesPanel entries={entries} />);
    expect(getByText('Bethlehem')).toBeTruthy();
    expect(getByText(/small town south/)).toBeTruthy();
  });

  it('shows role when provided', () => {
    const { getByText } = renderWithProviders(<PlacesPanel entries={entries} />);
    expect(getByText('Birthplace of David')).toBeTruthy();
  });

  it('pressing a place name calls onPlacePress', () => {
    const onPlacePress = jest.fn();
    const { getByText } = renderWithProviders(
      <PlacesPanel entries={entries} onPlacePress={onPlacePress} />,
    );
    fireEvent.press(getByText('Bethlehem'));
    expect(onPlacePress).toHaveBeenCalledWith('Bethlehem');
  });
});
