import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import { useTheme } from '../theme';
import type { HomeStackParamList } from './types';
import { lazySuspense } from './lazySuspense';

// Lazy-loaded screens — each wrapped in its own Suspense boundary
const ChapterScreen = lazySuspense(() => import('../screens/ChapterScreen'));
const ChapterListScreen = lazySuspense(() => import('../screens/ChapterListScreen'));
const BookListScreen = lazySuspense(() => import('../screens/BookListScreen'));
const BookIntroScreen = lazySuspense(() => import('../screens/BookIntroScreen'));
const ParallelPassageScreen = lazySuspense(() => import('../screens/ParallelPassageScreen'));
const ParallelDetailScreen = lazySuspense(() => import('../screens/ParallelDetailScreen'));
const HarmonyBrowseScreen = lazySuspense(() => import('../screens/HarmonyBrowseScreen'));
const HarmonyDetailScreen = lazySuspense(() => import('../screens/HarmonyDetailScreen'));
const TopicBrowseScreen = lazySuspense(() => import('../screens/TopicBrowseScreen'));
const TopicDetailScreen = lazySuspense(() => import('../screens/TopicDetailScreen'));
const DictionaryBrowseScreen = lazySuspense(() => import('../screens/DictionaryBrowseScreen'));
const DictionaryDetailScreen = lazySuspense(() => import('../screens/DictionaryDetailScreen'));
const PlanDetailScreen = lazySuspense(() => import('../screens/PlanDetailScreen'));

const Stack = createStackNavigator<HomeStackParamList>();

export function HomeStack() {
  const { base } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: base.bg } }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
      <Stack.Screen name="ChapterList" component={ChapterListScreen} />
      <Stack.Screen name="BookList" component={BookListScreen} />
      <Stack.Screen name="BookIntro" component={BookIntroScreen} />
      <Stack.Screen name="ParallelPassage" component={ParallelPassageScreen} />
      <Stack.Screen name="ParallelDetail" component={ParallelDetailScreen} />
      <Stack.Screen name="HarmonyBrowse" component={HarmonyBrowseScreen} />
      <Stack.Screen name="HarmonyDetail" component={HarmonyDetailScreen} />
      <Stack.Screen name="TopicBrowse" component={TopicBrowseScreen} />
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
      <Stack.Screen name="DictionaryBrowse" component={DictionaryBrowseScreen} />
      <Stack.Screen name="DictionaryDetail" component={DictionaryDetailScreen} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
    </Stack.Navigator>
  );
}
