import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { FullWidthImageCard } from '@/components/explore/FullWidthImageCard';

const IMAGE = {
  url: 'https://example.test/life.jpg',
  caption: 'Life',
  credit: 'Unsplash',
  deepLink: { screen: 'LifeTopics' as const },
};

describe('FullWidthImageCard', () => {
  it('renders title and subtitle', () => {
    const { getByText } = renderWithProviders(
      <FullWidthImageCard
        title="Life Topics"
        subtitle="Biblical guidance"
        onPress={jest.fn()}
      />,
    );
    expect(getByText('Life Topics')).toBeTruthy();
    expect(getByText('Biblical guidance')).toBeTruthy();
  });

  it('renders the count CTA when count and noun are provided', () => {
    const { getByText } = renderWithProviders(
      <FullWidthImageCard
        title="Life Topics"
        count={48}
        noun="topics"
        onPress={jest.fn()}
      />,
    );
    expect(getByText('48 topics ›')).toBeTruthy();
  });

  it('does not render the CTA when count is missing', () => {
    const { queryByText } = renderWithProviders(
      <FullWidthImageCard title="Life Topics" onPress={jest.fn()} />,
    );
    expect(queryByText(/›/)).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <FullWidthImageCard title="Life Topics" onPress={onPress} />,
    );
    fireEvent.press(getByText('Life Topics'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders an image when provided', () => {
    const { toJSON } = renderWithProviders(
      <FullWidthImageCard title="Life Topics" image={IMAGE} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
