import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import BookmarkListScreen from '../screens/BookmarkListScreen';
import ReadingHistoryScreen from '../screens/ReadingHistoryScreen';
import PlanListScreen from '../screens/PlanListScreen';
import PlanDetailScreen from '../screens/PlanDetailScreen';
import { base } from '../theme';

const Stack = createStackNavigator();

export function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: base.bg } }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarkListScreen} />
      <Stack.Screen name="ReadingHistory" component={ReadingHistoryScreen} />
      <Stack.Screen name="PlanList" component={PlanListScreen} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
    </Stack.Navigator>
  );
}
