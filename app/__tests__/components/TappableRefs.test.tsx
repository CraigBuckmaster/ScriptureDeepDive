import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { TappableRefs } from '@/components/TappableRefs';

describe('TappableRefs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when refs is empty', () => {
    const { toJSON } = renderWithProviders(
      <TappableRefs refs={[]} onRefPress={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders each ref as text', () => {
    const refs = ['Gen 1:1', 'Ex 4:14', 'Ps 23:1'];
    const { getByText } = renderWithProviders(
      <TappableRefs refs={refs} onRefPress={jest.fn()} />,
    );
    for (const ref of refs) {
      expect(getByText(ref)).toBeTruthy();
    }
  });

  it('calls onRefPress with the correct ref on press', () => {
    const onRefPress = jest.fn();
    const refs = ['Gen 1:1', 'Ex 4:14'];
    const { getByText } = renderWithProviders(
      <TappableRefs refs={refs} onRefPress={onRefPress} />,
    );
    fireEvent.press(getByText('Ex 4:14'));
    expect(onRefPress).toHaveBeenCalledWith('Ex 4:14');
    expect(onRefPress).toHaveBeenCalledTimes(1);
  });
});
