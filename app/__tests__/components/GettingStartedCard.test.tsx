import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { GettingStartedCard, GETTING_STARTED_ITEMS } from '@/components/GettingStartedCard';

describe('GettingStartedCard', () => {
  const mockOnItemPress = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders the "GETTING STARTED" heading', () => {
    const { getByText } = renderWithProviders(
      <GettingStartedCard
        items={GETTING_STARTED_ITEMS}
        completedKeys={new Set()}
        onItemPress={mockOnItemPress}
      />,
    );
    expect(getByText('GETTING STARTED')).toBeTruthy();
  });

  it('renders all checklist items', () => {
    const { getByText } = renderWithProviders(
      <GettingStartedCard
        items={GETTING_STARTED_ITEMS}
        completedKeys={new Set()}
        onItemPress={mockOnItemPress}
      />,
    );
    expect(getByText('Read your first chapter')).toBeTruthy();
    expect(getByText('Tap a study panel')).toBeTruthy();
  });
});
