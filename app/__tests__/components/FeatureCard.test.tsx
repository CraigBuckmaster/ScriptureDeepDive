import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import {
  FeatureCard,
  CARD_WIDTH,
  COMPACT_CARD_WIDTH,
  type FeatureCardData,
} from '@/components/FeatureCard';

const FEATURE: FeatureCardData = {
  title: 'Timeline',
  subtitle: 'Events across history',
  color: '#70b8e8',
  screen: 'Timeline',
};

function cardWidthFromTree(node: any): number | undefined {
  // The first View with a numeric width in the style is the card container.
  if (!node) return undefined;
  const style = node.props?.style;
  if (Array.isArray(style)) {
    const merged = Object.assign({}, ...style.filter(Boolean));
    if (typeof merged.width === 'number') return merged.width;
  } else if (style && typeof style.width === 'number') {
    return style.width;
  }
  if (Array.isArray(node.children)) {
    for (const c of node.children) {
      const w = cardWidthFromTree(c);
      if (typeof w === 'number') return w;
    }
  }
  return undefined;
}

describe('FeatureCard', () => {
  it('renders title and subtitle', () => {
    const { getByText } = renderWithProviders(
      <FeatureCard feature={FEATURE} onPress={jest.fn()} isPremium />,
    );
    expect(getByText('Timeline')).toBeTruthy();
    expect(getByText('Events across history')).toBeTruthy();
  });

  it('renders the count CTA when count and noun are provided', () => {
    const { getByText } = renderWithProviders(
      <FeatureCard
        feature={FEATURE}
        onPress={jest.fn()}
        isPremium
        count={5}
        noun="items"
      />,
    );
    expect(getByText('5 items ›')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <FeatureCard feature={FEATURE} onPress={onPress} isPremium />,
    );
    fireEvent.press(getByText('Timeline'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows the lock icon when feature is premium and user is not', () => {
    const { getByText } = renderWithProviders(
      <FeatureCard
        feature={{ ...FEATURE, premium: true }}
        onPress={jest.fn()}
        isPremium={false}
      />,
    );
    expect(getByText('✦')).toBeTruthy();
  });

  it('exposes stable width constants', () => {
    expect(CARD_WIDTH).toBe(174);
    expect(COMPACT_CARD_WIDTH).toBe(130);
  });

  it('applies the compact width when compact=true', () => {
    const { toJSON } = renderWithProviders(
      <FeatureCard feature={FEATURE} onPress={jest.fn()} isPremium compact />,
    );
    expect(cardWidthFromTree(toJSON())).toBe(COMPACT_CARD_WIDTH);
  });

  it('applies the default width when compact is not set', () => {
    const { toJSON } = renderWithProviders(
      <FeatureCard feature={FEATURE} onPress={jest.fn()} isPremium />,
    );
    expect(cardWidthFromTree(toJSON())).toBe(CARD_WIDTH);
  });
});
