/**
 * Tests for the computeReason pure helper of useAmicusAccess.
 * The full hook depends on Zustand stores + connectivity listeners;
 * computeReason is the testable kernel.
 */
import { computeReason, AMICUS_CAPS } from '../useAmicusAccess';

describe('computeReason', () => {
  it('returns not_premium when entitlement is none', () => {
    expect(
      computeReason({
        entitlement: 'none',
        amicusEnabled: true,
        online: true,
        remaining: 300,
      }),
    ).toBe('not_premium');
  });

  it('returns disabled_in_settings when the settings toggle is off', () => {
    expect(
      computeReason({
        entitlement: 'premium',
        amicusEnabled: false,
        online: true,
        remaining: 300,
      }),
    ).toBe('disabled_in_settings');
  });

  it('returns offline when not online', () => {
    expect(
      computeReason({
        entitlement: 'premium',
        amicusEnabled: true,
        online: false,
        remaining: 300,
      }),
    ).toBe('offline');
  });

  it('returns monthly_cap_reached when remaining is 0', () => {
    expect(
      computeReason({
        entitlement: 'premium',
        amicusEnabled: true,
        online: true,
        remaining: 0,
      }),
    ).toBe('monthly_cap_reached');
  });

  it('returns ok when everything is fine', () => {
    expect(
      computeReason({
        entitlement: 'premium',
        amicusEnabled: true,
        online: true,
        remaining: 10,
      }),
    ).toBe('ok');
  });

  it('disabled_in_settings precedes not_premium', () => {
    expect(
      computeReason({
        entitlement: 'none',
        amicusEnabled: false,
        online: true,
        remaining: 0,
      }),
    ).toBe('disabled_in_settings');
  });

  it('partner_plus has a 1500 monthly cap', () => {
    expect(AMICUS_CAPS.partner_plus).toBe(1500);
    expect(AMICUS_CAPS.premium).toBe(300);
    expect(AMICUS_CAPS.none).toBe(0);
  });
});
