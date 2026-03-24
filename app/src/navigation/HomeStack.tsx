import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ChapterScreen from '../screens/ChapterScreen';
import ChapterListScreen from '../screens/ChapterListScreen';
import BookListScreen from '../screens/BookListScreen';
import BookIntroScreen from '../screens/BookIntroScreen';
import ParallelPassageScreen from '../screens/ParallelPassageScreen';
import { base } from '../theme';

export type HomeStackParamList = {
  HomeMain: undefined;
  Chapter: { bookId: string; chapterNum: number };
  ChapterList: { bookId: string };
  BookList: undefined;
  BookIntro: { bookId: string };
  ParallelPassage: { entryId: string };
};

const Stack = createStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: base.bg } }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
      <Stack.Screen name="ChapterList" component={ChapterListScreen} />
      <Stack.Screen name="BookList" component={BookListScreen} />
      <Stack.Screen name="BookIntro" component={BookIntroScreen} />
      <Stack.Screen name="ParallelPassage" component={ParallelPassageScreen} />
    </Stack.Navigator>
  );
}
