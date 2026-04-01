import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '@/screens/SettingsScreen';

// Mock components that have complex deps
jest.mock('@/components/NotificationSettings', () => ({
  NotificationSettings: () => null,
}));

jest.mock('@/components/ThemePicker', () => ({
  ThemePicker: () => null,
}));

jest.mock('@/db/content', () => ({
  getContentStats: jest.fn().mockResolvedValue({
    liveBooks: 10, liveChapters: 100, scholarCount: 5, peopleCount: 50,
    timelineCount: 20, prophecyChainCount: 3, conceptCount: 8, difficultPassageCount: 4,
  }),
}));

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
  }),
}));

jest.mock('@/db/user', () => ({
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn(),
}));

jest.mock('@/utils/exportData', () => ({
  exportStudyData: jest.fn(),
  ExportError: class ExportError extends Error {},
}));

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Settings')).toBeTruthy();
  });

  it('shows translation options', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('KJV')).toBeTruthy();
  });
});
