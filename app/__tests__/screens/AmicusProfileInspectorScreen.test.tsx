import React from 'react';
import { render, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AmicusProfileInspectorScreen from '@/screens/AmicusProfileInspectorScreen';
import { ThemeProvider } from '@/theme';
import { resetMockUserDb } from '../helpers/mockUserDb';
import { resetMockDb } from '../helpers/mockDb';

jest.mock('@/db/userDatabase', () =>
  require('../helpers/mockUserDb').mockUserDatabaseModule(),
);
jest.mock('@/db/database', () =>
  require('../helpers/mockDb').mockDatabaseModule(),
);

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ goBack: mockGoBack }),
  };
});

jest.mock('@/services/amicus/profile/generator', () => ({
  generateProfile: jest.fn().mockResolvedValue({
    prose: 'Test profile prose',
    preferred_scholars: ['calvin'],
    preferred_traditions: ['Reformed'],
    generated_at: new Date().toISOString(),
    raw_signals_hash: 'x',
  }),
  getProfileForInspection: jest.fn().mockResolvedValue({
    prose: 'Test profile prose',
    preferred_scholars: ['calvin'],
    preferred_traditions: ['Reformed'],
    generated_at: new Date().toISOString(),
    raw_signals: {
      total_chapters_read: 10,
      last_30_day_chapters: 2,
      top_scholars_opened: [],
      tradition_distribution: {},
      genre_distribution: {},
      completed_journeys: [],
      active_journey: null,
      recent_chapters: [],
      current_focus: null,
    },
  }),
}));

function renderScreen() {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <AmicusProfileInspectorScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  resetMockUserDb();
  resetMockDb();
});

describe('AmicusProfileInspectorScreen', () => {
  it('renders the prose after load', async () => {
    const { findByText } = renderScreen();
    expect(await findByText('Test profile prose')).toBeTruthy();
  });

  it('renders the subtitle disclosure', async () => {
    const { findByText } = renderScreen();
    expect(
      await findByText(/summary sent to our AI provider/),
    ).toBeTruthy();
  });

  it('shows the header title', async () => {
    const { findByText } = renderScreen();
    expect(await findByText('Your Amicus Profile')).toBeTruthy();
  });
});
