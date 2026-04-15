import React from 'react';
import { useNavigation } from '@react-navigation/native';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { TabNavigator } from './TabNavigator';

export function RootNavigator() {
  const { isFirstLaunch, markComplete } = useOnboardingStatus();

  // Still loading preference — splash screen is still visible, render nothing
  if (isFirstLaunch === null) return null;

  if (isFirstLaunch) {
    return <OnboardingScreen onComplete={markComplete} />;
  }

  return <TabNavigator />;
}
