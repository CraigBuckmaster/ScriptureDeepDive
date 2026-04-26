/**
 * Soft "after 3 sessions" upgrade prompt — Phase 3.5 (#1742).
 *
 * The only soft-prompt timing logic added in epic #1725. Free users who
 * have completed 3 or more guided study sessions see the Companion Study
 * Partner upgrade modal once at the end of their next review step. Once
 * dismissed (or shown), it is never shown again.
 *
 * Storage: existing user_preferences row, no migration needed.
 */

import { getCompletedGuidedSessionCount, getPreference } from '../../db/userQueries';
import { setPreference } from '../../db/userMutations';

export const SOFT_PROMPT_PREF_KEY = 'softPromptSeen.companionPartner';
export const SOFT_PROMPT_SESSION_THRESHOLD = 3;

export async function shouldShowSoftPrompt(args: { isPremium: boolean }): Promise<boolean> {
  if (args.isPremium) return false;
  const seen = await getPreference(SOFT_PROMPT_PREF_KEY);
  if (seen === '1') return false;
  const count = await getCompletedGuidedSessionCount();
  return count >= SOFT_PROMPT_SESSION_THRESHOLD;
}

export async function markSoftPromptSeen(): Promise<void> {
  await setPreference(SOFT_PROMPT_PREF_KEY, '1');
}
