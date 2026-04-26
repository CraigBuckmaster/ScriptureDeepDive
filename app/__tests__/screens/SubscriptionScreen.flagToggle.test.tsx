/**
 * Phase 4.5 (#1748) — verifies the flag-aware Captures vs Drafts copy on
 * the second partner-capability row, and confirms the tagline holds in
 * both flag states. Uses a getter-backed mock so the same compiled
 * SubscriptionScreen reads the flag through `isFlagEnabled` per render.
 */
import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';

let mockFlagState = false;

jest.mock('@/config/featureFlags', () => ({
  FEATURE_FLAGS: {
    get GUIDED_STUDY_AMICUS_SYNTHESIS() {
      return mockFlagState;
    },
  },
  isFlagEnabled: (flag: string) =>
    flag === 'GUIDED_STUDY_AMICUS_SYNTHESIS' && mockFlagState,
}));

jest.mock('@/stores/premiumStore', () => ({
  usePremiumStore: jest.fn((selector) =>
    selector({ isPremium: false, purchaseType: null }),
  ),
}));

jest.mock('@/services/purchases', () => ({
  PLANS: [
    { id: 'monthly', name: 'Monthly', price: '$4.99' },
    { id: 'annual', name: 'Annual', price: '$29.99' },
    { id: 'lifetime', name: 'Lifetime', price: '$79.99' },
  ],
  PARTNER_PLUS_PLANS: [
    { id: 'partner_plus_monthly', productId: 'p_m', label: 'Monthly', price: '$9.99', detail: '/month' },
    { id: 'partner_plus_annual', productId: 'p_a', label: 'Annual', price: '$99.99', detail: '/year' },
  ],
  purchasePlan: jest.fn().mockResolvedValue(false),
  restorePurchases: jest.fn().mockResolvedValue(false),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SubscriptionScreen = require('@/screens/SubscriptionScreen').default;

afterEach(() => {
  mockFlagState = false;
});

describe('SubscriptionScreen flag-aware partner row (#1748)', () => {
  it('flag OFF → "Captures what you discovered"', () => {
    mockFlagState = false;
    const { getByText, queryByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText('Captures what you discovered')).toBeTruthy();
    expect(queryByText('Drafts what you discovered')).toBeNull();
  });

  it('flag ON → "Drafts what you discovered"', () => {
    mockFlagState = true;
    const { getByText, queryByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText('Drafts what you discovered')).toBeTruthy();
    expect(queryByText('Captures what you discovered')).toBeNull();
  });

  it('hero subtitle stays "From reading to understanding." in both states', () => {
    mockFlagState = false;
    const off = renderWithProviders(<SubscriptionScreen />);
    expect(off.getByText('From reading to understanding.')).toBeTruthy();
    mockFlagState = true;
    const on = renderWithProviders(<SubscriptionScreen />);
    expect(on.getByText('From reading to understanding.')).toBeTruthy();
  });
});
