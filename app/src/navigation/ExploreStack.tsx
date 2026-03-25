import { createStackNavigator } from '@react-navigation/stack';
import ExploreMenuScreen from '../screens/ExploreMenuScreen';
import GenealogyTreeScreen from '../screens/GenealogyTreeScreen';
import PersonDetailScreen from '../screens/PersonDetailScreen';
import MapScreen from '../screens/MapScreen';
import TimelineScreen from '../screens/TimelineScreen';
import WordStudyBrowseScreen from '../screens/WordStudyBrowseScreen';
import WordStudyDetailScreen from '../screens/WordStudyDetailScreen';
import ScholarBrowseScreen from '../screens/ScholarBrowseScreen';
import ScholarBioScreen from '../screens/ScholarBioScreen';
import ParallelPassageScreen from '../screens/ParallelPassageScreen';
import { base } from '../theme';

export type ExploreStackParamList = {
  ExploreMenu: undefined;
  GenealogyTree: undefined;
  PersonDetail: { personId: string };
  Map: { storyId?: string };
  Timeline: { eventId?: string };
  WordStudyBrowse: undefined;
  WordStudyDetail: { wordId: string };
  ScholarBrowse: undefined;
  ScholarBio: { scholarId: string };
  ParallelPassage: { entryId: string };
};

const Stack = createStackNavigator<ExploreStackParamList>();

export function ExploreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: base.bg },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="ExploreMenu" component={ExploreMenuScreen} />
      <Stack.Screen name="GenealogyTree" component={GenealogyTreeScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
      <Stack.Screen name="Map" component={MapScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="WordStudyBrowse" component={WordStudyBrowseScreen} />
      <Stack.Screen name="WordStudyDetail" component={WordStudyDetailScreen} />
      <Stack.Screen name="ScholarBrowse" component={ScholarBrowseScreen} />
      <Stack.Screen name="ScholarBio" component={ScholarBioScreen} />
      <Stack.Screen name="ParallelPassage" component={ParallelPassageScreen} />
    </Stack.Navigator>
  );
}
