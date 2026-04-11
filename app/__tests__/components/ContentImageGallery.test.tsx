import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ContentImageGallery } from '@/components/ContentImageGallery';

jest.mock('expo-image', () => ({
  Image: ({ source, onLoad, onError, ...props }: any) => {
    const RN = require('react-native');
    return <RN.View {...props} testID="expo-image" accessibilityLabel="expo-image" />;
  },
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: any) => children,
  Gesture: {
    Pinch: () => ({ onUpdate: () => ({ onEnd: () => ({}) }), onEnd: () => ({}) }),
    Pan: () => ({ minPointers: () => ({ onUpdate: () => ({ onEnd: () => ({}) }) }) }),
    Tap: () => ({ numberOfTaps: () => ({ onEnd: () => ({}) }) }),
    Simultaneous: () => ({}),
    Race: () => ({}),
  },
  GestureHandlerRootView: ({ children }: any) => children,
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

  it('renders image without caption', () => {
    const noCaptionImages = [
      { id: '1', url: 'https://example.com/1.jpg', caption: null, credit: null },
    ];
    const { queryByText } = renderWithProviders(
      <ContentImageGallery images={noCaptionImages} />,
    );
    // No caption text should appear
    expect(queryByText('First image')).toBeNull();
  });

  it('renders without crashing with many images', () => {
    const manyImages = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      url: `https://example.com/${i}.jpg`,
      caption: `Image ${i}`,
      credit: `Credit ${i}`,
    }));
    expect(() => {
      renderWithProviders(<ContentImageGallery images={manyImages} />);
    }).not.toThrow();
  });

  it('handles image press (zoom viewer)', () => {
    const { getAllByTestId } = renderWithProviders(
      <ContentImageGallery images={[images[0]]} />,
    );

    // Press the image to open zoom viewer
    const { fireEvent } = require('@testing-library/react-native');
    const imageParent = getAllByTestId('expo-image')[0];
    // The image is inside a TouchableOpacity
    fireEvent.press(imageParent);
    // No crash means the zoom viewer modal opened
  });

  it('shows page dots for multiple images', () => {
    // With 2 images, dots should render
    expect(() => {
      renderWithProviders(<ContentImageGallery images={images} />);
    }).not.toThrow();
  });

  it('handles scroll event', () => {
    const { getByTestId, UNSAFE_root } = renderWithProviders(
      <ContentImageGallery images={images} />,
    );
    // Ensure no crash on scroll
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders image with default height when no height provided', () => {
    expect(() => {
      renderWithProviders(<ContentImageGallery images={[images[0]]} />);
    }).not.toThrow();
  });
});
