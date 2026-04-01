import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { CollectionPicker } from '@/components/CollectionPicker';

jest.mock('@/db/user', () => ({
  getCollections: jest.fn().mockResolvedValue([
    { id: 1, name: 'Messianic Prophecy', description: 'OT prophecies', color: '#bfa050' },
    { id: 2, name: 'Pauline Letters', description: '', color: '#70b8e8' },
  ]),
  createCollection: jest.fn().mockResolvedValue(3),
}));

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  currentCollectionId: null as number | null,
  onSelect: jest.fn(),
};

describe('CollectionPicker', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing when visible', () => {
    const { getByText } = renderWithProviders(
      <CollectionPicker {...defaultProps} />,
    );
    expect(getByText('Select Collection')).toBeTruthy();
  });

  it('shows collection list after loading', async () => {
    const { getByText } = renderWithProviders(
      <CollectionPicker {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByText('Messianic Prophecy')).toBeTruthy();
      expect(getByText('Pauline Letters')).toBeTruthy();
    });
  });

  it('shows the New Collection button', () => {
    const { getByText } = renderWithProviders(
      <CollectionPicker {...defaultProps} />,
    );
    expect(getByText('New Collection')).toBeTruthy();
  });

  it('opens create form when New Collection is pressed', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <CollectionPicker {...defaultProps} />,
    );
    fireEvent.press(getByText('New Collection'));
    expect(getByPlaceholderText('Collection name')).toBeTruthy();
  });

  it('selects a collection when tapped', async () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <CollectionPicker {...defaultProps} onSelect={onSelect} />,
    );
    await waitFor(() => {
      expect(getByText('Messianic Prophecy')).toBeTruthy();
    });
    fireEvent.press(getByText('Messianic Prophecy'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
