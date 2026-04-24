import { useMemo } from 'react';
import { useNavigationState } from '@react-navigation/native';
import type { AmicusGuidedStudyContext } from '@/services/amicus/context';
import { findDeepestRoute, routeToAmicusGuidedStudyContext } from '@/utils/routeContext';
import { logger } from '@/utils/logger';

function isNavigationStateUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /Couldn't get the navigation state/i.test(error.message);
}

export function useAmicusGuidedRouteContext(): AmicusGuidedStudyContext | null {
  let state: unknown = undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    state = useNavigationState((s) => s);
  } catch (e) {
    if (!isNavigationStateUnavailable(e)) {
      logger.warn('AmicusGuidedRouteContext', 'navigation state resolution failed', e);
    }
  }

  return useMemo(() => routeToAmicusGuidedStudyContext(findDeepestRoute(state)), [state]);
}
