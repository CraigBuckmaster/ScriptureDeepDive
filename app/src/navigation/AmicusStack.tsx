/**
 * navigation/AmicusStack.tsx — Stack for the Amicus tab.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../theme';
import type { AmicusStackParamList } from './types';
import { lazySuspense } from './lazySuspense';

const ThreadListScreen = lazySuspense(() => import('../screens/AmicusThreadListScreen'));
const ThreadScreen = lazySuspense(() => import('../screens/AmicusThreadScreen'));
const NewThreadScreen = lazySuspense(() => import('../screens/AmicusNewThreadScreen'));
const PaywallScreen = lazySuspense(() => import('../screens/AmicusPaywallScreen'));

const Stack = createStackNavigator<AmicusStackParamList>();

export function AmicusStack(): React.ReactElement {
  const { base } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: base.bg },
      }}
    >
      <Stack.Screen name="ThreadList" component={ThreadListScreen} />
      <Stack.Screen name="Thread" component={ThreadScreen} />
      <Stack.Screen name="NewThread" component={NewThreadScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}
