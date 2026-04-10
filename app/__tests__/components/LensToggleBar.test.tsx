import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { LensToggleBar } from '@/components/LensToggleBar';

describe('LensToggleBar', () => {
  const lenses = [
    { id: 'reformed', name: 'Reformed', icon: '⛪' },
    { id: 'catholic', name: 'Catholic', icon: null },
    { id: 'jewish', name: 'Jewish', icon: '✡' },
  ] as any[];

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(
        <LensToggleBar lenses={lenses} activeLensId={null} onSelect={jest.fn()} />,
      );
    }).not.toThrow();
  });

  it('returns null with empty lenses', () => {
    const { toJSON } = renderWithProviders(
      <LensToggleBar lenses={[]} activeLensId={null} onSelect={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows Default pill', () => {
    const { getByText } = renderWithProviders(
      <LensToggleBar lenses={lenses} activeLensId={null} onSelect={jest.fn()} />,
    );
    expect(getByText('Default')).toBeTruthy();
  });

  it('shows lens names', () => {
    const { getByText } = renderWithProviders(
      <LensToggleBar lenses={lenses} activeLensId={null} onSelect={jest.fn()} />,
    );
    expect(getByText('Reformed')).toBeTruthy();
    expect(getByText('Catholic')).toBeTruthy();
    expect(getByText('Jewish')).toBeTruthy();
  });

  it('shows lens icons', () => {
    const { getByText } = renderWithProviders(
      <LensToggleBar lenses={lenses} activeLensId={null} onSelect={jest.fn()} />,
    );
    expect(getByText('⛪')).toBeTruthy();
    expect(getByText('✡')).toBeTruthy();
  });

  it('calls onSelect with null when Default is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <LensToggleBar lenses={lenses} activeLensId="reformed" onSelect={onSelect} />,
    );

    fireEvent.press(getByText('Default'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('calls onSelect with lens id when a lens is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <LensToggleBar lenses={lenses} activeLensId={null} onSelect={onSelect} />,
    );

    fireEvent.press(getByText('Catholic'));
    expect(onSelect).toHaveBeenCalledWith('catholic');
  });
});
