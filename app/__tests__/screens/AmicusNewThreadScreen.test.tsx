import React from 'react';
import { render, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AmicusNewThreadScreen from '@/screens/AmicusNewThreadScreen';
import { ThemeProvider } from '@/theme';
import { getMockUserDb, resetMockUserDb } from '../helpers/mockUserDb';

const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ replace: mockReplace, goBack: mockGoBack }),
    useRoute: () => ({ params: { seedQuery: 'Tell me about hesed' } }),
  };
});

jest.mock('@/db/userDatabase', () =>
  require('../helpers/mockUserDb').mockUserDatabaseModule(),
);

function renderScreen() {
  return render(
    <SafeAreaProvider>
      <ThemeProvider>
        <AmicusNewThreadScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('AmicusNewThreadScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockUserDb();
  });

  it('creates a thread then replaces the route with the new thread', async () => {
    renderScreen();
    await act(async () => {});
    const calls = getMockUserDb().runAsync.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(calls.some((s) => s.includes('INSERT INTO amicus_threads'))).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith(
      'Thread',
      expect.objectContaining({ threadId: expect.any(String) }),
    );
  });

  it('goes back if create fails', async () => {
    getMockUserDb().runAsync.mockRejectedValueOnce(new Error('DB down'));
    renderScreen();
    await act(async () => {});
    expect(mockGoBack).toHaveBeenCalled();
  });
});
