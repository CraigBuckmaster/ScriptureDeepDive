import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DailyReadingCard } from '@/components/DailyReadingCard';

describe('DailyReadingCard', () => {
  const defaultProps = {
    planName: 'Bible in a Year',
    dayNum: 14,
    chapters: ['Genesis_12', 'Genesis_13'],
    onStartReading: jest.fn(),
  };

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<DailyReadingCard {...defaultProps} />);
    expect(toJSON()).not.toBeNull();
  });

  it('displays plan name uppercased with day number', () => {
    const { getByText } = renderWithProviders(<DailyReadingCard {...defaultProps} />);
    expect(getByText('BIBLE IN A YEAR · DAY 14')).toBeTruthy();
  });

  it('displays chapters with underscores replaced by spaces', () => {
    const { getByText } = renderWithProviders(<DailyReadingCard {...defaultProps} />);
    expect(getByText('Genesis 12, Genesis 13')).toBeTruthy();
  });

  it('calls onStartReading with first chapter on press', () => {
    const mockStart = jest.fn();
    const { getByText } = renderWithProviders(
      <DailyReadingCard {...defaultProps} onStartReading={mockStart} />,
    );
    fireEvent.press(getByText('Start reading →'));
    expect(mockStart).toHaveBeenCalledWith('Genesis_12');
  });

  it('renders with a single chapter', () => {
    const { getByText } = renderWithProviders(
      <DailyReadingCard {...defaultProps} chapters={['Psalm_23']} />,
    );
    expect(getByText('Psalm 23')).toBeTruthy();
  });
});
