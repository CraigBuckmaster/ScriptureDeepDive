import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import { useTheme } from '../theme';
import type { MoreStackParamList } from './types';
import { lazySuspense } from './lazySuspense';

// Lazy-loaded screens — each wrapped in its own Suspense boundary
const SettingsScreen = lazySuspense(() => import('../screens/SettingsScreen'));
const BookmarkListScreen = lazySuspense(() => import('../screens/BookmarkListScreen'));
const ReadingHistoryScreen = lazySuspense(() => import('../screens/ReadingHistoryScreen'));
const AllNotesScreen = lazySuspense(() => import('../screens/AllNotesScreen'));
const CollectionDetailScreen = lazySuspense(() => import('../screens/CollectionDetailScreen'));
const PlanListScreen = lazySuspense(() => import('../screens/PlanListScreen'));
const PlanDetailScreen = lazySuspense(() => import('../screens/PlanDetailScreen'));
const ChapterScreen = lazySuspense(() => import('../screens/ChapterScreen'));
const BookIntroScreen = lazySuspense(() => import('../screens/BookIntroScreen'));
const SubscriptionScreen = lazySuspense(() => import('../screens/SubscriptionScreen'));
const LoginScreen = lazySuspense(() => import('../screens/LoginScreen'));
const SignUpScreen = lazySuspense(() => import('../screens/SignUpScreen'));
const ForgotPasswordScreen = lazySuspense(() => import('../screens/ForgotPasswordScreen'));
const UserProfileScreen = lazySuspense(() => import('../screens/UserProfileScreen'));
const NotificationPrefsScreen = lazySuspense(() => import('../screens/NotificationPrefsScreen'));
const NotificationFeedScreen = lazySuspense(() => import('../screens/NotificationFeedScreen'));

const Stack = createStackNavigator<MoreStackParamList>();

export function MoreStack() {
  const { base } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: base.bg } }}>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarkListScreen} />
      <Stack.Screen name="ReadingHistory" component={ReadingHistoryScreen} />
      <Stack.Screen name="AllNotes" component={AllNotesScreen} />
      <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
      <Stack.Screen name="PlanList" component={PlanListScreen} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
      <Stack.Screen name="BookIntro" component={BookIntroScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="NotificationPrefs" component={NotificationPrefsScreen} />
      <Stack.Screen name="NotificationFeed" component={NotificationFeedScreen} />
    </Stack.Navigator>
  );
}
