/**
 * shareVerse — Format text for clipboard copy or system share sheet.
 *
 * Verse format: "[text]" — Ref (TRANSLATION)\n\nCompanion Study
 * Streak format: I'm on a X-day reading streak...\n\nCompanion Study
 * Progress format: I've studied X% of the Bible...\n\nCompanion Study
 */

import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { logEvent } from '../services/analytics';
import { logger } from './logger';

function formatVerseMessage(text: string, ref: string, translation?: string, bookId?: string, ch?: number): string {
  const translationTag = translation ? ` (${translation.toUpperCase()})` : '';
  const deepLink = bookId && ch ? `\nscripture://book/${bookId}/${ch}` : '';
  return `"${text}" — ${ref}${translationTag}\n\nCompanion Study${deepLink}`;
}

export async function copyVerse(text: string, ref: string, translation?: string): Promise<void> {
  try {
    await Clipboard.setStringAsync(formatVerseMessage(text, ref, translation));
    logEvent('share_verse', { ref, action: 'copy' });
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

export async function shareStreak(streak: number): Promise<void> {
  const message = `I'm on a ${streak}-day reading streak in Companion Study! Studying the Bible the way it was written.\n\nCompanion Study`;
  try {
    await Share.share({ message });
    logEvent('share_streak', { streak });
  } catch (err) {
    logger.warn('shareVerse', 'Share streak failed', err);
  }
}

export async function shareProgress(pct: string, chaptersRead: number): Promise<void> {
  const message = `I've studied ${pct}% of the Bible (${chaptersRead} chapters) with Companion Study. Learning to read it the way it was written.\n\nCompanion Study`;
  try {
    await Share.share({ message });
    logEvent('share_progress', { pct, chaptersRead });
  } catch (err) {
    logger.warn('shareVerse', 'Share progress failed', err);
  }
}
