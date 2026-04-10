import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import BookListScreen from '../screens/BookListScreen';
import { useTheme } from '../theme';
import type { ReadStackParamList } from './types';

// Lazy-loaded screens
const ChapterListScreen = React.lazy(() => import('../screens/ChapterListScreen'));
const BookIntroScreen = React.lazy(() => import('../screens/BookIntroScreen'));
const ChapterScreen = React.lazy(() => import('../screens/ChapterScreen'));
const ParallelPassageScreen = React.lazy(() => import('../screens/ParallelPassageScreen'));
const ParallelDetailScreen = React.lazy(() => import('../screens/ParallelDetailScreen'));
const HarmonyBrowseScreen = React.lazy(() => import('../screens/HarmonyBrowseScreen'));
const HarmonyDetailScreen = React.lazy(() => import('../screens/HarmonyDetailScreen'));
const TopicBrowseScreen = React.lazy(() => import('../screens/TopicBrowseScreen'));
const TopicDetailScreen = React.lazy(() => import('../screens/TopicDetailScreen'));
const DictionaryBrowseScreen = React.lazy(() => import('../screens/DictionaryBrowseScreen'));
const DictionaryDetailScreen = React.lazy(() => import('../screens/DictionaryDetailScreen'));

const Stack = createStackNavigator<ReadStackParamList>();

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

export function ReadStack() {
  const { base } = useTheme();

  return (
    <Suspense fallback={<SuspenseFallback />}>
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
    </Suspense>
  );
}
