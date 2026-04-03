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
import ParallelDetailScreen from '../screens/ParallelDetailScreen';
import HarmonyBrowseScreen from '../screens/HarmonyBrowseScreen';
import HarmonyDetailScreen from '../screens/HarmonyDetailScreen';
import TopicBrowseScreen from '../screens/TopicBrowseScreen';
import TopicDetailScreen from '../screens/TopicDetailScreen';
import ProphecyBrowseScreen from '../screens/ProphecyBrowseScreen';
import ProphecyDetailScreen from '../screens/ProphecyDetailScreen';
import ConceptBrowseScreen from '../screens/ConceptBrowseScreen';
import ConceptDetailScreen from '../screens/ConceptDetailScreen';
import DifficultPassagesBrowseScreen from '../screens/DifficultPassagesBrowseScreen';
import DifficultPassageDetailScreen from '../screens/DifficultPassageDetailScreen';
import ConcordanceScreen from '../screens/ConcordanceScreen';
import ContentLibraryScreen from '../screens/ContentLibraryScreen';
import DictionaryBrowseScreen from '../screens/DictionaryBrowseScreen';
import DictionaryDetailScreen from '../screens/DictionaryDetailScreen';
import DebateBrowseScreen from '../screens/DebateBrowseScreen';
import DebateDetailScreen from '../screens/DebateDetailScreen';
import LifeTopicsScreen from '../screens/LifeTopicsScreen';
import LifeTopicDetailScreen from '../screens/LifeTopicDetailScreen';
import LensBrowseScreen from '../screens/LensBrowseScreen';
import ArchaeologyBrowseScreen from '../screens/ArchaeologyBrowseScreen';
import ArchaeologyDetailScreen from '../screens/ArchaeologyDetailScreen';
import ChapterScreen from '../screens/ChapterScreen';
import { useTheme } from '../theme';
import type { ExploreStackParamList } from './types';

const Stack = createStackNavigator<ExploreStackParamList>();

export function ExploreStack() {
  const { base } = useTheme();

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
      <Stack.Screen name="ParallelDetail" component={ParallelDetailScreen} />
      <Stack.Screen name="HarmonyBrowse" component={HarmonyBrowseScreen} />
      <Stack.Screen name="HarmonyDetail" component={HarmonyDetailScreen} />
      <Stack.Screen name="TopicBrowse" component={TopicBrowseScreen} />
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
      <Stack.Screen name="ProphecyBrowse" component={ProphecyBrowseScreen} />
      <Stack.Screen name="ProphecyDetail" component={ProphecyDetailScreen} />
      <Stack.Screen name="ConceptBrowse" component={ConceptBrowseScreen} />
      <Stack.Screen name="ConceptDetail" component={ConceptDetailScreen} />
      <Stack.Screen name="DifficultPassagesBrowse" component={DifficultPassagesBrowseScreen} />
      <Stack.Screen name="DifficultPassageDetail" component={DifficultPassageDetailScreen} />
      <Stack.Screen name="Concordance" component={ConcordanceScreen} />
      <Stack.Screen name="ContentLibrary" component={ContentLibraryScreen} />
      <Stack.Screen name="DictionaryBrowse" component={DictionaryBrowseScreen} />
      <Stack.Screen name="DictionaryDetail" component={DictionaryDetailScreen} />
      <Stack.Screen name="DebateBrowse" component={DebateBrowseScreen} />
      <Stack.Screen name="DebateDetail" component={DebateDetailScreen} />
      <Stack.Screen name="LifeTopics" component={LifeTopicsScreen} />
      <Stack.Screen name="LifeTopicDetail" component={LifeTopicDetailScreen} />
      <Stack.Screen name="LensBrowse" component={LensBrowseScreen} />
      <Stack.Screen name="ArchaeologyBrowse" component={ArchaeologyBrowseScreen} />
      <Stack.Screen name="ArchaeologyDetail" component={ArchaeologyDetailScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
    </Stack.Navigator>
  );
}
