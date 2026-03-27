import { createStackNavigator } from '@react-navigation/stack';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BookmarkListScreen from '../screens/BookmarkListScreen';
import ReadingHistoryScreen from '../screens/ReadingHistoryScreen';
import AllNotesScreen from '../screens/AllNotesScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import PlanListScreen from '../screens/PlanListScreen';
import PlanDetailScreen from '../screens/PlanDetailScreen';
import ChapterScreen from '../screens/ChapterScreen';
import BookIntroScreen from '../screens/BookIntroScreen';
import { base } from '../theme';
import type { MoreStackParamList } from './types';

const Stack = createStackNavigator<MoreStackParamList>();

export function MoreStack() {
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
    </Stack.Navigator>
  );
}
