/**
 * Tests for NotificationSettings minute-level time picker.
 *
 * Bug: Time picker only allowed hour-level selection (no minutes).
 * Fix: Added independent hour and minute controls.
 */

import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@/services/notifications', () => ({
  requestPermission: jest.fn().mockResolvedValue(true),
  scheduleDailyVerse: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/user', () => ({
  getPreference: jest.fn().mockImplementation((key: string) => {
    const map: Record<string, string> = {
      notifications_granted: '1',
      daily_verse_enabled: '1',
      notification_hour: '7',
      notification_minute: '30',
    };
    return Promise.resolve(map[key] ?? null);
  }),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

import { NotificationSettings } from '@/components/NotificationSettings';

describe('NotificationSettings', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crash', () => {
    expect(() => {
      renderWithProviders(<NotificationSettings />);
    }).not.toThrow();
  });

  it('displays HOUR and MIN labels when daily verse is enabled', async () => {
    const { findByText } = renderWithProviders(<NotificationSettings />);
    expect(await findByText('HOUR')).toBeTruthy();
    expect(await findByText('MIN')).toBeTruthy();
  });

  it('displays AM/PM indicator', async () => {
    const { findByText } = renderWithProviders(<NotificationSettings />);
    expect(await findByText('AM')).toBeTruthy();
  });

  it('displays time in correct format', async () => {
    const { findByText } = renderWithProviders(<NotificationSettings />);
    expect(await findByText(/7:30/)).toBeTruthy();
  });

  it('shows enable notifications button when not granted', async () => {
    const { getPreference } = require('@/db/user');
    getPreference.mockImplementation((key: string) => {
      if (key === 'notifications_granted') return Promise.resolve('0');
      return Promise.resolve(null);
    });

    const { findByText } = renderWithProviders(<NotificationSettings />);
    expect(await findByText('Enable Notifications')).toBeTruthy();
  });

  it('renders notifications heading', async () => {
    const { findByText } = renderWithProviders(<NotificationSettings />);
    expect(await findByText('NOTIFICATIONS')).toBeTruthy();
  });

  it('handles missing preferences gracefully', async () => {
    const { getPreference } = require('@/db/user');
    getPreference.mockResolvedValue(null);

    expect(() => {
      renderWithProviders(<NotificationSettings />);
    }).not.toThrow();
  });
});
