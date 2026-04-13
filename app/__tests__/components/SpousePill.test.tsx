import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { SpousePill } from '@/components/tree/SpousePill';

describe('SpousePill', () => {
  it('renders the spouse name with the infinity marker', () => {
    const { getByText } = renderWithProviders(
      <SpousePill spouseId="sarah" spouseName="Sarah" onPress={jest.fn()} />,
    );
    expect(getByText(/∞ Sarah/)).toBeTruthy();
  });

  it('calls onPress with the spouse id', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <SpousePill spouseId="sarah" spouseName="Sarah" onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledWith('sarah');
  });

  it('exposes an accessibility label', () => {
    const { getByLabelText } = renderWithProviders(
      <SpousePill spouseId="rachel" spouseName="Rachel" onPress={jest.fn()} />,
    );
    expect(getByLabelText('Spouse: Rachel')).toBeTruthy();
  });
});
