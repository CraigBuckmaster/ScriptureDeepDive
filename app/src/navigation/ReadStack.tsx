import { createStackNavigator } from '@react-navigation/stack';
import BookListScreen from '../screens/BookListScreen';
import ChapterListScreen from '../screens/ChapterListScreen';
import BookIntroScreen from '../screens/BookIntroScreen';
import ChapterScreen from '../screens/ChapterScreen';
import ParallelPassageScreen from '../screens/ParallelPassageScreen';
import { base } from '../theme';
import type { ReadStackParamList } from './types';

const Stack = createStackNavigator<ReadStackParamList>();

export function ReadStack() {
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
    </Stack.Navigator>
  );
}
