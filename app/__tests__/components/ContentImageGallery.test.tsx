import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ContentImageGallery } from '@/components/ContentImageGallery';

jest.mock('expo-image', () => ({
  Image: ({ source, onLoad, onError, ...props }: any) => {
    const RN = require('react-native');
    return <RN.View {...props} testID="expo-image" />;
  },
}));

jest.mock('@/components/ImageCredit', () => ({
  ImageCredit: ({ credit }: any) => {
    const RN = require('react-native');
    return <RN.Text>Credit: {credit || 'default'}</RN.Text>;
  },
}));

describe('ContentImageGallery', () => {
  const images = [
    { id: '1', url: 'https://example.com/1.jpg', caption: 'First image', credit: 'Author A' },
    { id: '2', url: 'https://example.com/2.jpg', caption: 'Second image', credit: 'Author B' },
  ];

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ContentImageGallery images={images} />);
    }).not.toThrow();
  });

  it('returns null for empty images', () => {
    const { toJSON } = renderWithProviders(<ContentImageGallery images={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('renders a single image without dots', () => {
    const { queryAllByTestId } = renderWithProviders(
      <ContentImageGallery images={[images[0]]} />,
    );
    // Should render 1 image
    expect(queryAllByTestId('expo-image')).toHaveLength(1);
  });

  it('renders multiple images with page dots', () => {
    const { queryAllByTestId } = renderWithProviders(
      <ContentImageGallery images={images} />,
    );
    expect(queryAllByTestId('expo-image')).toHaveLength(2);
  });

  it('shows captions', () => {
    const { getByText } = renderWithProviders(
      <ContentImageGallery images={[images[0]]} />,
    );
    expect(getByText('First image')).toBeTruthy();
  });

  it('shows credits', () => {
    const { getByText } = renderWithProviders(
      <ContentImageGallery images={[images[0]]} />,
    );
    expect(getByText('Credit: Author A')).toBeTruthy();
  });

  it('accepts custom height', () => {
    expect(() => {
      renderWithProviders(<ContentImageGallery images={images} height={200} />);
    }).not.toThrow();
  });
});
