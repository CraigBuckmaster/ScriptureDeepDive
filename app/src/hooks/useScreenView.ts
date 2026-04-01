/**
 * hooks/useScreenView.ts — Log screen_view events on focus.
 */

import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { logEvent } from '../services/analytics';

export function useScreenView(screenName: string) {
  useFocusEffect(
    useCallback(() => {
      logEvent('screen_view', { screen: screenName });
    }, [screenName]),
  );
}
