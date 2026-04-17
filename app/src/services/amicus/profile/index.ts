/**
 * services/amicus/profile/index.ts — Public entry point.
 */
export {
  generateProfile,
  getProfileForInspection,
  clearProfile,
  hashRawSignals,
} from './generator';
export type {
  CompressedProfile,
  ProfileForInspection,
  RawSignals,
  ScholarEngagement,
  RecentChapter,
  CurrentFocus,
} from './types';
