import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BookListScreen from '../screens/BookListScreen';
import { useTheme } from '../theme';
import type { ReadStackParamList } from './types';
import { lazySuspense } from './lazySuspense';

// Lazy-loaded screens — each wrapped in its own Suspense boundary
const ChapterListScreen = lazySuspense(() => import('../screens/ChapterListScreen'));
const BookIntroScreen = lazySuspense(() => import('../screens/BookIntroScreen'));
const ChapterScreen = lazySuspense(() => import('../screens/ChapterScreen'));
const ParallelPassageScreen = lazySuspense(() => import('../screens/ParallelPassageScreen'));
const ParallelDetailScreen = lazySuspense(() => import('../screens/ParallelDetailScreen'));
const HarmonyBrowseScreen = lazySuspense(() => import('../screens/HarmonyBrowseScreen'));
const HarmonyDetailScreen = lazySuspense(() => import('../screens/HarmonyDetailScreen'));
const TopicBrowseScreen = lazySuspense(() => import('../screens/TopicBrowseScreen'));
const TopicDetailScreen = lazySuspense(() => import('../screens/TopicDetailScreen'));
const DictionaryBrowseScreen = lazySuspense(() => import('../screens/DictionaryBrowseScreen'));
const DictionaryDetailScreen = lazySuspense(() => import('../screens/DictionaryDetailScreen'));

const Stack = createStackNavigator<ReadStackParamList>();

export function ReadStack() {
  const { base } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: base.bg },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="BookList" component={BookListScreen} />
      <Stack.Screen name="ChapterList" component={ChapterListScreen} />
      <Stack.Screen name="BookIntro" component={BookIntroScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
      <Stack.Screen name="ParallelPassage" component={ParallelPassageScreen} />
      <Stack.Screen name="ParallelDetail" component={ParallelDetailScreen} />
      <Stack.Screen name="HarmonyBrowse" component={HarmonyBrowseScreen} />
      <Stack.Screen name="HarmonyDetail" component={HarmonyDetailScreen} />
      <Stack.Screen name="TopicBrowse" component={TopicBrowseScreen} />
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
      <Stack.Screen name="DictionaryBrowse" component={DictionaryBrowseScreen} />
      <Stack.Screen name="DictionaryDetail" component={DictionaryDetailScreen} />
    </Stack.Navigator>
  );
}
