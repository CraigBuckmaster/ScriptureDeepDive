import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import CapExceededBanner from '@/components/amicus/CapExceededBanner';

describe('CapExceededBanner', () => {
  it('renders premium-tier copy with an upgrade CTA', () => {
    const onUpgrade = jest.fn();
    const { getByText, getByLabelText } = renderWithProviders(
      <CapExceededBanner entitlement="premium" onUpgrade={onUpgrade} />,
    );
    expect(getByText(/used all 300 queries/)).toBeTruthy();
    fireEvent.press(getByLabelText('Upgrade to Amicus+'));
    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it('renders partner_plus-tier copy without upgrade CTA', () => {
    const { getByText, queryByLabelText } = renderWithProviders(
      <CapExceededBanner entitlement="partner_plus" />,
    );
    expect(getByText(/used all 1,500 queries/)).toBeTruthy();
    expect(queryByLabelText('Upgrade to Amicus+')).toBeNull();
  });

  it('always renders the reset date line', () => {
    const { getByText } = renderWithProviders(
      <CapExceededBanner entitlement="premium" />,
    );
    expect(getByText(/cap resets on/)).toBeTruthy();
  });
});
