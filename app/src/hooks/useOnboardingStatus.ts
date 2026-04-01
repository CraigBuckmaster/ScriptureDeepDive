/**
 * hooks/useOnboardingStatus.ts — First-launch detection for onboarding.
 *
 * Reads a flag from user preferences to determine if the user has
 * completed onboarding. Returns null while loading to avoid flashing
 * the wrong screen before the check completes.
 */

import { useState, useEffect, useCallback } from 'react';
import { getPreference, setPreference } from '../db/user';

export function useOnboardingStatus() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    getPreference('onboarding_complete').then((val) => {
      setIsFirstLaunch(val !== '1');
    });
  }, []);

  const markComplete = useCallback(async () => {
    await setPreference('onboarding_complete', '1');
    setIsFirstLaunch(false);
  }, []);

  return { isFirstLaunch, markComplete };
}
