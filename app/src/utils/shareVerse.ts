/**
 * shareVerse — Format verse text for clipboard copy or system share sheet.
 *
 * Format: "[text]" — Ref (TRANSLATION)\n\nCompanion Study
 */

import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { logger } from './logger';

function formatVerseMessage(text: string, ref: string, translation?: string): string {
  const translationTag = translation ? ` (${translation.toUpperCase()})` : '';
  return `"${text}" — ${ref}${translationTag}\n\nCompanion Study`;
}

export async function copyVerse(text: string, ref: string, translation?: string): Promise<void> {
  try {
    await Clipboard.setStringAsync(formatVerseMessage(text, ref, translation));
  } catch (err) {
    logger.warn('shareVerse', 'Copy failed', err);
    throw err;
  }
}

export async function shareVerse(text: string, ref: string, translation?: string): Promise<void> {
  try {
    await Share.share({ message: formatVerseMessage(text, ref, translation) });
  } catch (err) {
    logger.warn('shareVerse', 'Share failed', err);
    throw err;
  }
}
