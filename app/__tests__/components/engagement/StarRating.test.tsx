import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { StarRating } from '@/components/engagement/StarRating';

jest.mock('@/stores', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { id: 'user-1' } })),
}));

describe('StarRating', () => {
  const mockOnRate = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByLabelText } = renderWithProviders(
      <StarRating rating={3} onRate={mockOnRate} />,
    );
    expect(getByLabelText(/Rating: 3 of 5 stars/)).toBeTruthy();
  });

  it('displays 5 star buttons', () => {
    const { getByLabelText } = renderWithProviders(
      <StarRating rating={0} onRate={mockOnRate} />,
    );
    expect(getByLabelText('1 star')).toBeTruthy();
    expect(getByLabelText('2 stars')).toBeTruthy();
    expect(getByLabelText('5 stars')).toBeTruthy();
  });

  it('shows correct rating in accessibility label', () => {
    const { getByLabelText } = renderWithProviders(
      <StarRating rating={4} onRate={mockOnRate} />,
    );
    expect(getByLabelText(/Rating: 4 of 5 stars/)).toBeTruthy();
  });
});
