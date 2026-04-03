import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ChapterScreen from '../screens/ChapterScreen';
import ChapterListScreen from '../screens/ChapterListScreen';
import BookListScreen from '../screens/BookListScreen';
import BookIntroScreen from '../screens/BookIntroScreen';
import ParallelPassageScreen from '../screens/ParallelPassageScreen';
import ParallelDetailScreen from '../screens/ParallelDetailScreen';
import HarmonyBrowseScreen from '../screens/HarmonyBrowseScreen';
import HarmonyDetailScreen from '../screens/HarmonyDetailScreen';
import TopicBrowseScreen from '../screens/TopicBrowseScreen';
import TopicDetailScreen from '../screens/TopicDetailScreen';
import DictionaryBrowseScreen from '../screens/DictionaryBrowseScreen';
import DictionaryDetailScreen from '../screens/DictionaryDetailScreen';
import PlanDetailScreen from '../screens/PlanDetailScreen';
import { useTheme } from '../theme';
import type { HomeStackParamList } from './types';

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
