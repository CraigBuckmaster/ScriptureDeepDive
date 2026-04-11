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

  it('shows caption CTA label based on screen name', () => {
    const images = [
      { id: 'img1', url: 'https://example.com/img.jpg', caption: 'Test', deepLink: { screen: 'ArchaeologyDetail' } },
    ];
    const { getByText } = renderWithProviders(
      <RecommendedCard
        recommendation={recommendation}
        onPress={jest.fn()}
        isPremium={false}
        images={images as any}
      />,
    );
    expect(getByText(/View discovery/)).toBeTruthy();
  });

  it('renders multiple images with indicator dots', () => {
    const images = [
      { id: 'img1', url: 'https://example.com/1.jpg', caption: null, deepLink: { screen: 'ArchaeologyBrowse' } },
      { id: 'img2', url: 'https://example.com/2.jpg', caption: null, deepLink: { screen: 'PersonDetail' } },
    ];
    // Just verifying it renders without crashing; dots are rendered for >1 images
    expect(() => {
      renderWithProviders(
        <RecommendedCard
          recommendation={recommendation}
          onPress={jest.fn()}
          isPremium={false}
          images={images as any}
        />,
      );
    }).not.toThrow();
  });

  it('calls onPress when text area is pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <RecommendedCard
        recommendation={recommendation}
        onPress={onPress}
        isPremium={false}
      />,
    );
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(getByLabelText(/Archaeology/));
    expect(onPress).toHaveBeenCalled();
  });

  it('calls onImagePress when image is pressed', () => {
    const onImagePress = jest.fn();
    const images = [
      { id: 'img1', url: 'https://example.com/1.jpg', caption: 'Test', deepLink: { screen: 'ArchaeologyDetail', params: { id: '1' } } },
    ];
    const { getByLabelText } = renderWithProviders(
      <RecommendedCard
        recommendation={recommendation}
        onPress={jest.fn()}
        isPremium={false}
        images={images as any}
        onImagePress={onImagePress}
      />,
    );
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(getByLabelText('Test'));
    expect(onImagePress).toHaveBeenCalledWith({ screen: 'ArchaeologyDetail', params: { id: '1' } });
  });

  it('falls back to "View" for unknown screen names', () => {
    const images = [
      { id: 'img1', url: 'https://example.com/img.jpg', caption: null, deepLink: { screen: 'UnknownScreen' } },
    ];
    const { getByText } = renderWithProviders(
      <RecommendedCard
        recommendation={recommendation}
        onPress={jest.fn()}
        isPremium={false}
        images={images as any}
      />,
    );
    expect(getByText(/View ›/)).toBeTruthy();
  });

  it('renders fallback strip with color when no images', () => {
    expect(() => {
      renderWithProviders(
        <RecommendedCard
          recommendation={{ ...recommendation, color: '#ff0000' }}
          onPress={jest.fn()}
          isPremium={false}
          images={[]}
        />,
      );
    }).not.toThrow();
  });
});
