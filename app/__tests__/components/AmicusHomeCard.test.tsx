import { act, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import AmicusHomeCard from '@/components/AmicusHomeCard';

const mockGetPreference = jest.fn();
const mockSetPreference = jest.fn();
jest.mock('@/db/userQueries', () => ({
  getPreference: (key: string) => mockGetPreference(key),
}));
jest.mock('@/db/userMutations', () => ({
  setPreference: (key: string, value: string) => mockSetPreference(key, value),
}));

const mockUseDailyPrompt = jest.fn();
jest.mock('@/hooks/useDailyPrompt', () => ({
  useDailyPrompt: () => mockUseDailyPrompt(),
}));

const mockUseAmicusAccess = jest.fn();
jest.mock('@/hooks/useAmicusAccess', () => ({
  useAmicusAccess: () => mockUseAmicusAccess(),
}));

const mockUseSettingsStore = jest.fn();
jest.mock('@/stores/settingsStore', () => ({
  useSettingsStore: (selector: (s: { amicusEnabled: boolean }) => unknown) =>
    selector({ amicusEnabled: mockUseSettingsStore() }),
}));

const mockNavigate = jest.fn();
const mockParentNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    getParent: () => ({ navigate: mockParentNavigate }),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPreference.mockResolvedValue(null);
  mockSetPreference.mockResolvedValue(undefined);
  mockUseSettingsStore.mockReturnValue(true);
  mockUseAmicusAccess.mockReturnValue({
    canUse: true,
    reason: 'ok',
    entitlement: 'premium',
    usage: { thisMonth: 0, cap: 300, remaining: 300 },
  });
  mockUseDailyPrompt.mockReturnValue({
    prompt: null,
    isLoading: false,
    refresh: jest.fn(),
  });
});

async function flushEffects(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('AmicusHomeCard', () => {
  it('returns null when amicus is disabled in settings', async () => {
    mockUseSettingsStore.mockReturnValue(false);
    const { toJSON } = renderWithProviders(<AmicusHomeCard />);
    await flushEffects();
    expect(toJSON()).toBeNull();
  });

  it('renders the fallback copy when the daily prompt is null', async () => {
    const { findByText } = renderWithProviders(<AmicusHomeCard />);
    expect(await findByText('Meet Amicus')).toBeTruthy();
    expect(
      await findByText(/ready for questions/),
    ).toBeTruthy();
  });

  it('renders the daily prompt and navigates with its seed_query on tap', async () => {
    mockUseDailyPrompt.mockReturnValue({
      prompt: {
        prompt_text: 'Amicus noticed you are deep in Jeremiah.',
        seed_query: 'What is the covenant arc in Jeremiah 29-31?',
      },
      isLoading: false,
      refresh: jest.fn(),
    });
    const { findByText, getByLabelText } = renderWithProviders(<AmicusHomeCard />);
    expect(await findByText('Amicus noticed…')).toBeTruthy();
    expect(await findByText(/deep in Jeremiah/)).toBeTruthy();
    fireEvent.press(getByLabelText('Open Amicus'));
    expect(mockParentNavigate).toHaveBeenCalledWith('AmicusTab', {
      screen: 'NewThread',
      params: { seedQuery: 'What is the covenant arc in Jeremiah 29-31?' },
    });
  });

  it('navigates to an empty new thread when the input row is tapped', async () => {
    mockUseDailyPrompt.mockReturnValue({
      prompt: {
        prompt_text: 'something',
        seed_query: 'query',
      },
      isLoading: false,
      refresh: jest.fn(),
    });
    const { getByLabelText } = renderWithProviders(<AmicusHomeCard />);
    fireEvent.press(getByLabelText('Ask Amicus anything'));
    expect(mockParentNavigate).toHaveBeenCalledWith('AmicusTab', {
      screen: 'NewThread',
      params: undefined,
    });
  });

  it('renders the Unlock variant for non-premium users and navigates to Subscription', async () => {
    mockUseAmicusAccess.mockReturnValue({
      canUse: false,
      reason: 'not_premium',
      entitlement: 'none',
      usage: { thisMonth: 0, cap: 0, remaining: 0 },
    });
    const { findByText, getByLabelText, queryByLabelText } = renderWithProviders(
      <AmicusHomeCard />,
    );
    expect(await findByText('Unlock Amicus')).toBeTruthy();
    expect(await findByText(/72 scholars/)).toBeTruthy();
    expect(queryByLabelText('Ask Amicus anything')).toBeNull();
    fireEvent.press(getByLabelText('See plans'));
    expect(mockParentNavigate).toHaveBeenCalledWith('MoreTab', {
      screen: 'Subscription',
    });
  });

  it('hides itself when already dismissed today', async () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    mockGetPreference.mockResolvedValue(`${y}-${m}-${d}`);

    const { toJSON } = renderWithProviders(<AmicusHomeCard />);
    await flushEffects();
    expect(toJSON()).toBeNull();
  });

  it('dismisses for the day on long-press and persists the date', async () => {
    const { getByLabelText, toJSON } = renderWithProviders(<AmicusHomeCard />);
    await flushEffects();
    const card = getByLabelText('Open Amicus');
    await act(async () => {
      fireEvent(card, 'longPress');
    });
    expect(mockSetPreference).toHaveBeenCalledWith(
      'amicus_home_card_dismissed_date',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
    expect(toJSON()).toBeNull();
  });
});
