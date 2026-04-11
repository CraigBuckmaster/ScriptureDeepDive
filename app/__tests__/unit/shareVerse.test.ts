import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { copyVerse, shareVerse, shareStreak, shareProgress } from '@/utils/shareVerse';
import { logEvent } from '@/services/analytics';

jest.mock('react-native', () => ({
  Share: { share: jest.fn().mockResolvedValue({}) },
}));

describe('shareVerse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('copyVerse', () => {
    it('copies formatted text to clipboard', async () => {
      await copyVerse('In the beginning', 'Genesis 1:1', 'kjv');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
        '"In the beginning" — Genesis 1:1 (KJV)\n\nCompanion Study',
      );
    });

    it('omits translation tag when not provided', async () => {
      await copyVerse('In the beginning', 'Genesis 1:1');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
        '"In the beginning" — Genesis 1:1\n\nCompanion Study',
      );
    });
  });

  describe('shareVerse', () => {
    it('calls Share.share with formatted message', async () => {
      await shareVerse('In the beginning', 'Genesis 1:1', 'asv');
      expect(Share.share).toHaveBeenCalledWith({
        message: '"In the beginning" — Genesis 1:1 (ASV)\n\nCompanion Study',
      });
    });
  });

  describe('copyVerse with translation', () => {
    it('calls Clipboard.setStringAsync with formatted message including translation tag', async () => {
      await copyVerse('For God so loved the world', 'John 3:16', 'esv');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
        '"For God so loved the world" — John 3:16 (ESV)\n\nCompanion Study',
      );
    });
  });

  describe('shareStreak', () => {
    it('includes streak count in message and logs analytics', async () => {
      await shareStreak(7);
      expect(Share.share).toHaveBeenCalledTimes(1);
      const call = (Share.share as jest.Mock).mock.calls[0][0];
      expect(call.message).toContain('7-day reading streak');
      expect(logEvent).toHaveBeenCalledWith('share_streak', { streak: 7 });
    });

    it('swallows errors and does not throw', async () => {
      (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share cancelled'));
      await expect(shareStreak(10)).resolves.toBeUndefined();
    });
  });

  describe('shareProgress', () => {
    it('includes pct and chaptersRead in message and logs analytics', async () => {
      await shareProgress('42', 500);
      expect(Share.share).toHaveBeenCalledTimes(1);
      const call = (Share.share as jest.Mock).mock.calls[0][0];
      expect(call.message).toContain('42%');
      expect(call.message).toContain('500 chapters');
      expect(logEvent).toHaveBeenCalledWith('share_progress', { pct: '42', chaptersRead: 500 });
    });

    it('swallows errors and does not throw', async () => {
      (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share cancelled'));
      await expect(shareProgress('50', 600)).resolves.toBeUndefined();
    });
  });
});
