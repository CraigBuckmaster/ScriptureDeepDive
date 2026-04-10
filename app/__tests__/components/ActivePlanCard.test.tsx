import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ActivePlanCard } from '@/components/ActivePlanCard';

jest.mock('@/db/user', () => ({
  getActivePlanId: jest.fn().mockResolvedValue(null),
  getPlans: jest.fn().mockResolvedValue([]),
  getPlanProgress: jest.fn().mockResolvedValue([]),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

describe('ActivePlanCard', () => {
  it('renders without crashing', () => {
    const result = renderWithProviders(<ActivePlanCard />);
    // Returns null when no active plan, so no crash
    expect(result).toBeTruthy();
  });

  it('returns null when no active plan', () => {
    const { toJSON } = renderWithProviders(<ActivePlanCard />);
    // When planData is null, component returns null
    expect(toJSON()).toBeNull();
  });

  it('does not throw when rendered inside providers', () => {
    expect(() => {
      renderWithProviders(<ActivePlanCard />);
    }).not.toThrow();
  });
});
