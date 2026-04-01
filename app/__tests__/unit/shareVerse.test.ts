import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { copyVerse, shareVerse } from '@/utils/shareVerse';

jest.mock('react-native', () => ({
  Share: { share: jest.fn().mockResolvedValue({}) },
}));

describe('shareVerse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('copyVerse', () => {
    it('copies formatted text to clipboard', async () => {
      await copyVerse('In the beginning', 'Genesis 1:1', 'niv');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
        '"In the beginning" — Genesis 1:1 (NIV)\n\nCompanion Study',
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
      await shareVerse('In the beginning', 'Genesis 1:1', 'esv');
      expect(Share.share).toHaveBeenCalledWith({
        message: '"In the beginning" — Genesis 1:1 (ESV)\n\nCompanion Study',
      });
    });
  });
});
