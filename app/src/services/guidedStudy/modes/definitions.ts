import type { GuidedStudyMode } from '../types';
import { DEEP_MODE } from './deep';
import { DEVOTIONAL_MODE } from './devotional';
import { QUICK_MODE } from './quick';
import { TEACHING_MODE } from './teaching';
import type { ModeDefinition } from './types';

export const MODE_DEFINITIONS: Record<GuidedStudyMode, ModeDefinition> = {
  quick: QUICK_MODE,
  deep: DEEP_MODE,
  teaching: TEACHING_MODE,
  devotional: DEVOTIONAL_MODE,
};

export function getModeDefinition(key: GuidedStudyMode): ModeDefinition {
  return MODE_DEFINITIONS[key] ?? MODE_DEFINITIONS.deep;
}
