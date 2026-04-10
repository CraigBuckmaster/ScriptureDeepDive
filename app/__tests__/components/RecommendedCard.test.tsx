import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { RecommendedCard } from '@/components/RecommendedCard';

jest.mock('expo-image', () => ({
  Image: (props: any) => {
    const RN = require('react-native');
    return <RN.View testID="expo-image" />;
  },
}));

describe('RecommendedCard', () => {
  const recommendation = {
    id: 'rec1',
    title: 'Archaeology',
    subtitle: 'Explore discoveries that illuminate the biblical world.',
    screen: 'ArchaeologyBrowse',
    params: {},
    color: '#bfa050',
    premium: false,
  };

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(
        <RecommendedCard
          recommendation={recommendation}
          onPress={jest.fn()}
          isPremium={false}
        />,
      );
    }).not.toThrow();
  });

  it('shows recommendation title', () => {
    const { getByText } = renderWithProviders(
      <RecommendedCard
        recommendation={recommendation}
        onPress={jest.fn()}
        isPremium={false}
      />,
    );
    expect(getByText('Archaeology')).toBeTruthy();
  });

  it('shows subtitle', () => {
    const { getByText } = renderWithProviders(
      <RecommendedCard
        recommendation={recommendation}
        onPress={jest.fn()}
        isPremium={false}
      />,
    );
    expect(getByText(/Explore discoveries/)).toBeTruthy();
  });

  it('shows lock icon for premium content when user is not premium', () => {
    const premiumRec = { ...recommendation, premium: true };
    const { getByText } = renderWithProviders(
      <RecommendedCard
        recommendation={premiumRec}
        onPress={jest.fn()}
        isPremium={false}
      />,
    );
    expect(getByText('✦')).toBeTruthy();
  });

  it('does not show lock icon for premium users', () => {
    const premiumRec = { ...recommendation, premium: true };
    const { queryByText } = renderWithProviders(
      <RecommendedCard
        recommendation={premiumRec}
        onPress={jest.fn()}
        isPremium={true}
      />,
    );
    expect(queryByText('✦')).toBeNull();
  });

  it('renders fallback strip when no images provided', () => {
    const { queryAllByTestId } = renderWithProviders(
      <RecommendedCard
        recommendation={recommendation}
        onPress={jest.fn()}
        isPremium={false}
      />,
    );
    expect(queryAllByTestId('expo-image')).toHaveLength(0);
  });

  it('renders image when images are provided', () => {
    const images = [
      { id: 'img1', url: 'https://example.com/img.jpg', caption: 'Test', deepLink: { screen: 'ArchaeologyBrowse' } },
    ];
    const { queryAllByTestId } = renderWithProviders(
      <RecommendedCard
        recommendation={recommendation}
        onPress={jest.fn()}
        isPremium={false}
        images={images as any}
      />,
    );
    expect(queryAllByTestId('expo-image')).toHaveLength(1);
  });
});
