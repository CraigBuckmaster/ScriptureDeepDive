import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ActivePlanCard } from '@/components/ActivePlanCard';

const mockGetActivePlanId = jest.fn().mockResolvedValue(null);
const mockGetPlans = jest.fn().mockResolvedValue([]);
const mockGetPlanProgress = jest.fn().mockResolvedValue([]);

jest.mock('@/db/user', () => ({
  getActivePlanId: (...args: any[]) => mockGetActivePlanId(...args),
  getPlans: (...args: any[]) => mockGetPlans(...args),
  getPlanProgress: (...args: any[]) => mockGetPlanProgress(...args),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (cb: () => void) => { cb(); },
}));

describe('ActivePlanCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActivePlanId.mockResolvedValue(null);
    mockGetPlans.mockResolvedValue([]);
    mockGetPlanProgress.mockResolvedValue([]);
  });

  it('renders without crashing', () => {
    const result = renderWithProviders(<ActivePlanCard />);
    expect(result).toBeTruthy();
  });

  it('returns null when no active plan', () => {
    const { toJSON } = renderWithProviders(<ActivePlanCard />);
    expect(toJSON()).toBeNull();
  });

  it('renders plan details when active plan exists', async () => {
    mockGetActivePlanId.mockResolvedValue('genesis_deep_dive');
    mockGetPlans.mockResolvedValue([
      {
        id: 'genesis_deep_dive',
        name: 'Genesis Deep Dive',
        description: 'Explore Genesis',
        total_days: 14,
        chapters_json: JSON.stringify([
          { day: 1, chapters: ['genesis_1'] },
          { day: 2, chapters: ['genesis_2'] },
        ]),
      },
    ]);
    mockGetPlanProgress.mockResolvedValue([
      { plan_id: 'genesis_deep_dive', day_num: 1, completed_at: '2025-01-01' },
      { plan_id: 'genesis_deep_dive', day_num: 2, completed_at: null },
    ]);

    const { findByText } = renderWithProviders(<ActivePlanCard />);
    const title = await findByText('Genesis Deep Dive');
    expect(title).toBeTruthy();
  });

  it('shows next day info', async () => {
    mockGetActivePlanId.mockResolvedValue('plan1');
    mockGetPlans.mockResolvedValue([
      {
        id: 'plan1',
        name: 'Test Plan',
        description: 'Desc',
        total_days: 3,
        chapters_json: JSON.stringify([
          { day: 1, chapters: ['genesis_1'] },
          { day: 2, chapters: ['genesis_2', 'genesis_3'] },
        ]),
      },
    ]);
    mockGetPlanProgress.mockResolvedValue([
      { plan_id: 'plan1', day_num: 1, completed_at: '2025-01-01' },
      { plan_id: 'plan1', day_num: 2, completed_at: null },
    ]);

    const { findByText } = renderWithProviders(<ActivePlanCard />);
    const dayText = await findByText(/Day 2/);
    expect(dayText).toBeTruthy();
  });

  it('shows complete when all days are done', async () => {
    mockGetActivePlanId.mockResolvedValue('plan1');
    mockGetPlans.mockResolvedValue([
      {
        id: 'plan1',
        name: 'Done Plan',
        description: 'Desc',
        total_days: 1,
        chapters_json: JSON.stringify([{ day: 1, chapters: ['genesis_1'] }]),
      },
    ]);
    mockGetPlanProgress.mockResolvedValue([
      { plan_id: 'plan1', day_num: 1, completed_at: '2025-01-01' },
    ]);

    const { findByText } = renderWithProviders(<ActivePlanCard />);
    const complete = await findByText(/Complete/);
    expect(complete).toBeTruthy();
  });

  it('returns null when plan ID exists but plan not found', async () => {
    mockGetActivePlanId.mockResolvedValue('nonexistent');
    mockGetPlans.mockResolvedValue([]);

    const { toJSON } = renderWithProviders(<ActivePlanCard />);
    await waitFor(() => {
      expect(mockGetPlans).toHaveBeenCalled();
    });
    expect(toJSON()).toBeNull();
  });

  it('handles malformed chapters_json', async () => {
    mockGetActivePlanId.mockResolvedValue('plan1');
    mockGetPlans.mockResolvedValue([
      {
        id: 'plan1',
        name: 'Bad JSON',
        description: 'Desc',
        total_days: 1,
        chapters_json: 'not json',
      },
    ]);
    mockGetPlanProgress.mockResolvedValue([]);

    const { findByText } = renderWithProviders(<ActivePlanCard />);
    // Should render the plan name even with bad JSON
    const title = await findByText('Bad JSON');
    expect(title).toBeTruthy();
  });

  it('navigates to PlanDetail on press', async () => {
    mockGetActivePlanId.mockResolvedValue('plan1');
    mockGetPlans.mockResolvedValue([
      {
        id: 'plan1',
        name: 'Test Plan',
        description: 'Desc',
        total_days: 1,
        chapters_json: JSON.stringify([{ day: 1, chapters: ['genesis_1'] }]),
      },
    ]);
    mockGetPlanProgress.mockResolvedValue([]);

    const { findByLabelText } = renderWithProviders(<ActivePlanCard />);
    const card = await findByLabelText(/Active reading plan/);
    fireEvent.press(card);
    expect(mockNavigate).toHaveBeenCalledWith('PlanDetail', { planId: 'plan1' });
  });
});
