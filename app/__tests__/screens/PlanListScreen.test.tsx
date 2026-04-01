import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import PlanListScreen from '@/screens/PlanListScreen';

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

jest.mock('@/components/PlanProgressBar', () => ({
  PlanProgressBar: () => null,
}));

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: ({ label }: { label: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, label);
  },
}));

// ── Mock DB functions ────────────────────────────────────────────
const mockGetPlans = jest.fn();
const mockGetActivePlanId = jest.fn();
const mockGetPlanProgress = jest.fn();

jest.mock('@/db/user', () => ({
  getPlans: (...args: unknown[]) => mockGetPlans(...args),
  getActivePlanId: (...args: unknown[]) => mockGetActivePlanId(...args),
  getPlanProgress: (...args: unknown[]) => mockGetPlanProgress(...args),
}));

const samplePlans = [
  { id: 'plan-1', name: 'Bible in a Year', description: 'Read the whole Bible in 365 days', total_days: 365, chapters_json: '[]' },
  { id: 'plan-2', name: 'Gospels in 30 Days', description: 'Read all four Gospels', total_days: 30, chapters_json: '[]' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPlans.mockResolvedValue(samplePlans);
  mockGetActivePlanId.mockResolvedValue('plan-1');
  mockGetPlanProgress.mockResolvedValue([
    { plan_id: 'plan-1', day_num: 1, completed_at: '2025-01-01' },
    { plan_id: 'plan-1', day_num: 2, completed_at: null },
  ]);
});

describe('PlanListScreen', () => {
  it('renders the Reading Plans header', () => {
    const { getByText } = renderWithProviders(<PlanListScreen />);
    expect(getByText('Reading Plans')).toBeTruthy();
  });

  it('renders plan list', async () => {
    const { getAllByText, getByText } = renderWithProviders(<PlanListScreen />);
    await waitFor(() => {
      // Name appears in both active card and list item
      expect(getAllByText('Bible in a Year').length).toBeGreaterThanOrEqual(1);
    });
    expect(getByText('Gospels in 30 Days')).toBeTruthy();
  });

  it('shows active plan indicator', async () => {
    const { getByText } = renderWithProviders(<PlanListScreen />);
    await waitFor(() => {
      expect(getByText('ACTIVE PLAN')).toBeTruthy();
    });
    // The BadgeChip mock renders the label text
    expect(getByText('Active')).toBeTruthy();
  });

  it('shows plan metadata (days)', async () => {
    const { getByText } = renderWithProviders(<PlanListScreen />);
    await waitFor(() => {
      expect(getByText('365 days')).toBeTruthy();
      expect(getByText('30 days')).toBeTruthy();
    });
  });
});
