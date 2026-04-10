import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { RelatedContentCard } from '@/components/RelatedContentCard';

jest.mock('expo-image', () => ({
  Image: (props: any) => {
    const RN = require('react-native');
    return <RN.View testID="expo-image" />;
  },
}));

describe('RelatedContentCard', () => {
  const item = {
    type: 'person',
    title: 'Moses',
    snippet: 'The great leader who delivered Israel from Egypt.',
    color: '#4a7c4f',
    screen: 'PersonDetail',
    params: { personId: 'moses' },
    imageUrl: 'https://example.com/moses.jpg',
    label: 'Person',
  };

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(
        <RelatedContentCard item={item} onPress={jest.fn()} />,
      );
    }).not.toThrow();
  });

  it('shows the item title', () => {
    const { getByText } = renderWithProviders(
      <RelatedContentCard item={item} onPress={jest.fn()} />,
    );
    expect(getByText('Moses')).toBeTruthy();
  });

  it('shows the snippet', () => {
    const { getByText } = renderWithProviders(
      <RelatedContentCard item={item} onPress={jest.fn()} />,
    );
    expect(getByText(/great leader/)).toBeTruthy();
  });

  it('shows the action link', () => {
    const { getByText } = renderWithProviders(
      <RelatedContentCard item={item} onPress={jest.fn()} />,
    );
    expect(getByText('See full Person ›')).toBeTruthy();
  });

  it('renders gradient fallback when no image', () => {
    const noImgItem = { ...item, imageUrl: null };
    const { getByText } = renderWithProviders(
      <RelatedContentCard item={noImgItem} onPress={jest.fn()} />,
    );
    expect(getByText('Person')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <RelatedContentCard item={item} onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Person: Moses'));
    expect(onPress).toHaveBeenCalledWith(item);
  });
});
