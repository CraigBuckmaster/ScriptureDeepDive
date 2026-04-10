import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ArchaeologyCard } from '@/components/ArchaeologyCard';

describe('ArchaeologyCard', () => {
  const props = {
    name: 'Dead Sea Scrolls',
    category: 'Manuscripts',
    location: 'Qumran, Israel',
    dateRange: '1947',
    significance: 'Oldest known copies of most OT books.',
    onPress: jest.fn(),
  };

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ArchaeologyCard {...props} />);
    }).not.toThrow();
  });

  it('shows the discovery name', () => {
    const { getByText } = renderWithProviders(<ArchaeologyCard {...props} />);
    expect(getByText('Dead Sea Scrolls')).toBeTruthy();
  });

  it('shows the category badge', () => {
    const { getByText } = renderWithProviders(<ArchaeologyCard {...props} />);
    expect(getByText('Manuscripts')).toBeTruthy();
  });

  it('shows location and date range', () => {
    const { getByText } = renderWithProviders(<ArchaeologyCard {...props} />);
    expect(getByText('Qumran, Israel')).toBeTruthy();
    expect(getByText('1947')).toBeTruthy();
  });

  it('renders without location and dateRange', () => {
    const { getByText } = renderWithProviders(
      <ArchaeologyCard {...props} location={undefined} dateRange={undefined} />,
    );
    expect(getByText('Dead Sea Scrolls')).toBeTruthy();
  });
});
