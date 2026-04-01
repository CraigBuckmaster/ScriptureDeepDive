/**
 * PeoplePanel.test.tsx — Tests for the people panel.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { PeoplePanel } from '@/components/panels/PeoplePanel';
import type { PeopleEntry } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const entries: PeopleEntry[] = [
  { name: 'Moses', role: 'Prophet & Lawgiver', text: 'Led Israel out of Egypt.' },
  { name: 'Aaron', role: 'High Priest', text: 'Brother of Moses.' },
];

describe('PeoplePanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<PeoplePanel entries={entries} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders person names and roles', () => {
    const { getByText } = renderWithProviders(<PeoplePanel entries={entries} />);
    expect(getByText('Moses')).toBeTruthy();
    expect(getByText('Prophet & Lawgiver')).toBeTruthy();
    expect(getByText('Aaron')).toBeTruthy();
    expect(getByText('High Priest')).toBeTruthy();
  });

  it('pressing a person name calls onPersonPress', () => {
    const onPersonPress = jest.fn();
    const { getByText } = renderWithProviders(
      <PeoplePanel entries={entries} onPersonPress={onPersonPress} />,
    );
    fireEvent.press(getByText('Moses'));
    expect(onPersonPress).toHaveBeenCalledWith('Moses');
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(<PeoplePanel entries={[]} />);
    expect(toJSON()).toBeTruthy();
  });
});
