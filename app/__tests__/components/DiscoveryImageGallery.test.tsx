import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DiscoveryImageGallery } from '@/components/DiscoveryImageGallery';

jest.mock('@/components/ContentImageGallery', () => ({
  ContentImageGallery: ({ images }: any) => {
    const RN = require('react-native');
    return <RN.Text>Gallery: {images.length} images</RN.Text>;
  },
}));

describe('DiscoveryImageGallery', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<DiscoveryImageGallery images={[]} />);
    }).not.toThrow();
  });

  it('passes images to ContentImageGallery', () => {
    const images = [
      { id: 1, url: 'https://example.com/1.jpg', caption: 'Test' },
    ] as any[];
    const { getByText } = renderWithProviders(
      <DiscoveryImageGallery images={images} />,
    );
    expect(getByText('Gallery: 1 images')).toBeTruthy();
  });
});
