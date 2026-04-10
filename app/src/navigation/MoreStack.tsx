import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import { useTheme } from '../theme';
import type { MoreStackParamList } from './types';

// Lazy-loaded screens
const SettingsScreen = React.lazy(() => import('../screens/SettingsScreen'));
const BookmarkListScreen = React.lazy(() => import('../screens/BookmarkListScreen'));
const ReadingHistoryScreen = React.lazy(() => import('../screens/ReadingHistoryScreen'));
const AllNotesScreen = React.lazy(() => import('../screens/AllNotesScreen'));
const CollectionDetailScreen = React.lazy(() => import('../screens/CollectionDetailScreen'));
const PlanListScreen = React.lazy(() => import('../screens/PlanListScreen'));
const PlanDetailScreen = React.lazy(() => import('../screens/PlanDetailScreen'));
const ChapterScreen = React.lazy(() => import('../screens/ChapterScreen'));
const BookIntroScreen = React.lazy(() => import('../screens/BookIntroScreen'));
const SubscriptionScreen = React.lazy(() => import('../screens/SubscriptionScreen'));
const LoginScreen = React.lazy(() => import('../screens/LoginScreen'));
const SignUpScreen = React.lazy(() => import('../screens/SignUpScreen'));
const ForgotPasswordScreen = React.lazy(() => import('../screens/ForgotPasswordScreen'));
const UserProfileScreen = React.lazy(() => import('../screens/UserProfileScreen'));
const NotificationPrefsScreen = React.lazy(() => import('../screens/NotificationPrefsScreen'));
const NotificationFeedScreen = React.lazy(() => import('../screens/NotificationFeedScreen'));

const Stack = createStackNavigator<MoreStackParamList>();

function SuspenseFallback() {
  return (
    <View style={fallbackStyles.container}>
      <ActivityIndicator color="#bfa050" size="large" />
    </View>
  );
}

const fallbackStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export function MoreStack() {
  const { base } = useTheme();

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: base.bg }, lazy: true }}>
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
    </Suspense>
  );
}
