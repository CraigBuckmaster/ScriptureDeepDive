import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { HomeReviewDueCard } from '@/components/guidedStudy/HomeReviewDueCard';

describe('HomeReviewDueCard', () => {
  it('renders nothing when count is zero', () => {
    const { toJSON } = renderWithProviders(
      <HomeReviewDueCard count={0} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders singular copy when exactly 1 prompt is due', () => {
    const { getByText } = renderWithProviders(
      <HomeReviewDueCard count={1} onPress={jest.fn()} />,
    );
    expect(getByText('1 prompt due today')).toBeTruthy();
  });

  it('renders pluralized copy for multiple prompts', () => {
    const { getByText } = renderWithProviders(
      <HomeReviewDueCard count={7} onPress={jest.fn()} />,
    );
    expect(getByText('7 prompts due today')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <HomeReviewDueCard count={3} onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('3 study review prompts due'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
