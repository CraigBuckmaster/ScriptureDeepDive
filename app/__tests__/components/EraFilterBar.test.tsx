import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { EraFilterBar } from '@/components/tree/EraFilterBar';

describe('EraFilterBar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(
      <EraFilterBar activeEra="all" onSelect={jest.fn()} />,
    );
    expect(getByText('All')).toBeTruthy();
  });

  it('renders the "All" pill and era pills', () => {
    const { getByText } = renderWithProviders(
      <EraFilterBar activeEra="all" onSelect={jest.fn()} />,
    );
    expect(getByText('All')).toBeTruthy();
  });

  it('marks the active era pill as selected', () => {
    const { getByLabelText } = renderWithProviders(
      <EraFilterBar activeEra="all" onSelect={jest.fn()} />,
    );
    const allBtn = getByLabelText('Filter by All era');
    expect(allBtn.props.accessibilityState).toEqual({ selected: true });
  });

  it('calls onSelect when a pill is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <EraFilterBar activeEra="all" onSelect={onSelect} />,
    );
    fireEvent.press(getByText('All'));
    expect(onSelect).toHaveBeenCalledWith('all');
  });
});
