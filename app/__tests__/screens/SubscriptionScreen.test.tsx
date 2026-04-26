import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import SubscriptionScreen from '@/screens/SubscriptionScreen';

jest.mock('@/stores/premiumStore', () => ({
  usePremiumStore: jest.fn((selector) =>
    selector({
      isPremium: false,
      purchaseType: null,
    }),
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
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('SubscriptionScreen', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<SubscriptionScreen />);
    }).not.toThrow();
  });

  it('renders the Companion+ hero title', () => {
    const { getByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText('Companion+')).toBeTruthy();
  });

  it('renders the new tagline subtitle (#1746)', () => {
    const { getByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText('From reading to understanding.')).toBeTruthy();
  });

  it('renders the WHAT YOU GET partner section heading (#1746)', () => {
    const { getByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText('WHAT YOU GET')).toBeTruthy();
  });

  it.each([
    'Helps you study more deeply',
    'Remembers what you have learned',
    'Reads the original languages with you',
    'Traces ideas across Scripture',
    'Brings 269 study articles',
    'Syncs across your devices',
  ])('renders the %s partner row (#1746)', (title) => {
    const { getByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText(title)).toBeTruthy();
  });

  it('renders the flag-off copy for the synthesis row (Captures, not Drafts)', () => {
    const { getByText, queryByText } = renderWithProviders(<SubscriptionScreen />);
    expect(getByText('Captures what you discovered')).toBeTruthy();
    expect(queryByText('Drafts what you discovered')).toBeNull();
  });

  it('renders the trust footer copy (#1746)', () => {
    const { getByText } = renderWithProviders(<SubscriptionScreen />);
    expect(
      getByText(/Every claim cited\. Every scholar named\./),
    ).toBeTruthy();
  });
});
