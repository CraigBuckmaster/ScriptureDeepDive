import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DictionaryCrossLink } from '@/components/DictionaryCrossLink';

describe('DictionaryCrossLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no cross-links are provided', () => {
    const { toJSON } = renderWithProviders(<DictionaryCrossLink />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when IDs are provided without handlers', () => {
    const { toJSON } = renderWithProviders(
      <DictionaryCrossLink personId="aaron" />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders "Also in Companion Study" header when links are present', () => {
    const { getByText } = renderWithProviders(
      <DictionaryCrossLink personId="aaron" onPersonPress={jest.fn()} />,
    );
    expect(getByText('Also in Companion Study')).toBeTruthy();
  });

  it('renders "See Person Bio" when personId is provided', () => {
    const { getByText } = renderWithProviders(
      <DictionaryCrossLink personId="aaron" onPersonPress={jest.fn()} />,
    );
    expect(getByText('See Person Bio')).toBeTruthy();
  });

  it('renders "See on Map" when placeId is provided', () => {
    const { getByText } = renderWithProviders(
      <DictionaryCrossLink placeId="jerusalem" onPlacePress={jest.fn()} />,
    );
    expect(getByText('See on Map')).toBeTruthy();
  });

  it('calls handler on press', () => {
    const onPersonPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DictionaryCrossLink personId="aaron" onPersonPress={onPersonPress} />,
    );
    fireEvent.press(getByText('See Person Bio'));
    expect(onPersonPress).toHaveBeenCalledWith('aaron');
  });
});
