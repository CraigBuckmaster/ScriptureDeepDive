/**
 * __tests__/services/pushNotifications.test.ts
 *
 * Tests for push notification registration, token storage,
 * and Supabase sync.
 */

import { Platform } from 'react-native';

// expo-notifications is mocked in jest.setup.js with getPermissionsAsync & getExpoPushTokenAsync
const mockNotifications = require('expo-notifications');

// Mock user preferences DB
const mockSetPreference = jest.fn().mockResolvedValue(undefined);
const mockGetPreference = jest.fn().mockResolvedValue(null);
jest.mock('@/db/user', () => ({
  setPreference: (...args: any[]) => mockSetPreference(...args),
  getPreference: (...args: any[]) => mockGetPreference(...args),
}));

// Supabase mock is provided by jest.setup.js; grab it for per-test overrides
const { getSupabase } = require('@/lib/supabase');
const mockSupabase = getSupabase();

import {
  registerForPushNotifications,
  savePushToken,
  getStoredPushToken,
} from '@/services/pushNotifications';

describe('pushNotifications service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[xxx]' });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
  });

  // ── registerForPushNotifications ───────────────────────────────

  describe('registerForPushNotifications', () => {
    it('returns token when permission already granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const token = await registerForPushNotifications();
      expect(token).toBe('ExponentPushToken[xxx]');
      expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission when not already granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const token = await registerForPushNotifications();
      expect(token).toBe('ExponentPushToken[xxx]');
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns null when permission denied', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
      const token = await registerForPushNotifications();
      expect(token).toBeNull();
    });

    it('saves token locally', async () => {
      await registerForPushNotifications();
      expect(mockSetPreference).toHaveBeenCalledWith('push_token', 'ExponentPushToken[xxx]');
    });

    it('returns null on error', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValueOnce(new Error('fail'));
      mockNotifications.getExpoPushTokenAsync.mockRejectedValueOnce(new Error('fail'));
      const token = await registerForPushNotifications();
      expect(token).toBeNull();
    });

    it('sets Android notification channel on Android', async () => {
      (Platform as any).OS = 'android';
      await registerForPushNotifications();
      expect(mockNotifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', {
        name: 'Default',
        importance: expect.anything(),
      });
    });
  });

  // ── savePushToken ──────────────────────────────────────────────

  describe('savePushToken', () => {
    it('returns false when supabase is null', async () => {
      (getSupabase as jest.Mock).mockReturnValueOnce(null);
      const result = await savePushToken('tok');
      expect(result).toBe(false);
    });

    it('returns false when no authenticated user', async () => {
      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: null },
      });
      const result = await savePushToken('tok');
      expect(result).toBe(false);
    });

    it('upserts token to Supabase on success', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
      mockSupabase.from = jest.fn().mockReturnValue({ upsert: mockUpsert });

      const result = await savePushToken('ExponentPushToken[abc]');
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('push_tokens');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          token: 'ExponentPushToken[abc]',
        }),
        expect.objectContaining({ onConflict: 'user_id,token' }),
      );
    });

    it('returns false on Supabase error', async () => {
      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
      mockSupabase.from = jest.fn().mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: { message: 'fail' } }),
      });

      const result = await savePushToken('tok');
      expect(result).toBe(false);
    });
  });

  // ── getStoredPushToken ─────────────────────────────────────────

  describe('getStoredPushToken', () => {
    it('returns stored token from preferences', async () => {
      mockGetPreference.mockResolvedValue('ExponentPushToken[stored]');
      const token = await getStoredPushToken();
      expect(token).toBe('ExponentPushToken[stored]');
      expect(mockGetPreference).toHaveBeenCalledWith('push_token');
    });

    it('returns null when no token stored', async () => {
      mockGetPreference.mockResolvedValue(null);
      const token = await getStoredPushToken();
      expect(token).toBeNull();
    });
  });
});
