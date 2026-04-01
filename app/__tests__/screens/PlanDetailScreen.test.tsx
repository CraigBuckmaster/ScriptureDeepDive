import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import PlanDetailScreen from '@/screens/PlanDetailScreen';

// ── Navigation mock ───────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: { planId: 'plan-1' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'Loading...');
  },
}));

jest.mock('@/components/PlanProgressBar', () => ({
  PlanProgressBar: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'ProgressBar');
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// ── DB mocks ────────────────────────────────────────────────────
const samplePlan = {
  id: 'plan-1',
  name: 'Gospels in 30 Days',
  description: 'Read through all four Gospels in one month.',
  chapters_json: JSON.stringify([
    { day: 1, chapters: ['matthew_1', 'matthew_2'] },
    { day: 2, chapters: ['matthew_3', 'matthew_4'] },
    { day: 3, chapters: ['mark_1'] },
  ]),
};

jest.mock('@/db/user', () => ({
  getPlans: jest.fn().mockResolvedValue([
    {
      id: 'plan-1',
      name: 'Gospels in 30 Days',
      description: 'Read through all four Gospels in one month.',
      chapters_json: JSON.stringify([
        { day: 1, chapters: ['matthew_1', 'matthew_2'] },
        { day: 2, chapters: ['matthew_3', 'matthew_4'] },
        { day: 3, chapters: ['mark_1'] },
      ]),
    },
  ]),
  getActivePlanId: jest.fn().mockResolvedValue(null),
  getPlanProgress: jest.fn().mockResolvedValue([]),
  startPlan: jest.fn().mockResolvedValue(undefined),
  completePlanDay: jest.fn().mockResolvedValue(undefined),
  abandonPlan: jest.fn().mockResolvedValue(undefined),
}));

// ── Tests ─────────────────────────────────────────────────────────
describe('PlanDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<PlanDetailScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows loading skeleton initially', () => {
    const { getByText } = renderWithProviders(<PlanDetailScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders plan name after loading', async () => {
    const { findByText } = renderWithProviders(<PlanDetailScreen />);
    expect(await findByText('Gospels in 30 Days')).toBeTruthy();
  });

  it('renders plan description after loading', async () => {
    const { findByText } = renderWithProviders(<PlanDetailScreen />);
    expect(await findByText('Read through all four Gospels in one month.')).toBeTruthy();
  });

  it('shows Start Plan button when plan is not active', async () => {
    const { findByText } = renderWithProviders(<PlanDetailScreen />);
    expect(await findByText('Start Plan')).toBeTruthy();
  });

  it('renders day rows with chapter labels', async () => {
    const { findByText } = renderWithProviders(<PlanDetailScreen />);
    expect(await findByText('matthew 1')).toBeTruthy();
    expect(await findByText('matthew 2')).toBeTruthy();
    expect(await findByText('mark 1')).toBeTruthy();
  });
});
