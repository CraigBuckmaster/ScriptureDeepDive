/**
 * shareLifeTopic — Share a life topic summary via the system share sheet.
 *
 * Uses the same pattern as shareVerse.ts but formats the message
 * for life topic content.
 */

import { Share } from 'react-native';
import { logger } from './logger';
import { logEvent } from '../services/analytics';

export async function shareLifeTopic(title: string, summary: string, topicId: string) {
  const message = `📖 What the Bible Says About ${title}\n\n${summary.slice(0, 200)}...\n\nRead more in Companion Study`;
  try {
    await Share.share({ message, title: `What the Bible Says About ${title}` });
    logEvent('share_life_topic', { topicId, title });
  } catch (err) {
    logger.warn('shareLifeTopic', 'Share failed', err);
  }
}
