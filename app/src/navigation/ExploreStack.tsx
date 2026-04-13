import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExploreMenuScreen from '../screens/ExploreMenuScreen';
import { useTheme } from '../theme';
import type { ExploreStackParamList } from './types';
import { lazySuspense } from './lazySuspense';

// Lazy-loaded screens — each wrapped in its own Suspense boundary
const GenealogyTreeScreen = lazySuspense(() => import('../screens/GenealogyTreeScreen'));
const PersonDetailScreen = lazySuspense(() => import('../screens/PersonDetailScreen'));
const MapScreen = lazySuspense(() => import('../screens/MapScreen'));
const TimelineScreen = lazySuspense(() => import('../screens/TimelineScreen'));
const PeriodsScreen = lazySuspense(() => import('../screens/PeriodsScreen'));
const RedemptiveArcScreen = lazySuspense(() => import('../screens/RedemptiveArcScreen'));
const PersonJourneyScreen = lazySuspense(() => import('../screens/PersonJourneyScreen'));
const JourneyBrowseScreen = lazySuspense(() => import('../screens/JourneyBrowseScreen'));
const WordStudyBrowseScreen = lazySuspense(() => import('../screens/WordStudyBrowseScreen'));
const WordStudyDetailScreen = lazySuspense(() => import('../screens/WordStudyDetailScreen'));
const ScholarBrowseScreen = lazySuspense(() => import('../screens/ScholarBrowseScreen'));
const ScholarBioScreen = lazySuspense(() => import('../screens/ScholarBioScreen'));
const ParallelPassageScreen = lazySuspense(() => import('../screens/ParallelPassageScreen'));
const ParallelDetailScreen = lazySuspense(() => import('../screens/ParallelDetailScreen'));
const HarmonyBrowseScreen = lazySuspense(() => import('../screens/HarmonyBrowseScreen'));
const HarmonyDetailScreen = lazySuspense(() => import('../screens/HarmonyDetailScreen'));
const TopicBrowseScreen = lazySuspense(() => import('../screens/TopicBrowseScreen'));
const TopicDetailScreen = lazySuspense(() => import('../screens/TopicDetailScreen'));
const ProphecyBrowseScreen = lazySuspense(() => import('../screens/ProphecyBrowseScreen'));
const ProphecyDetailScreen = lazySuspense(() => import('../screens/ProphecyDetailScreen'));
const ConceptBrowseScreen = lazySuspense(() => import('../screens/ConceptBrowseScreen'));
const ConceptDetailScreen = lazySuspense(() => import('../screens/ConceptDetailScreen'));
const DifficultPassagesBrowseScreen = lazySuspense(() => import('../screens/DifficultPassagesBrowseScreen'));
const DifficultPassageDetailScreen = lazySuspense(() => import('../screens/DifficultPassageDetailScreen'));
const ConcordanceScreen = lazySuspense(() => import('../screens/ConcordanceScreen'));
const ContentLibraryScreen = lazySuspense(() => import('../screens/ContentLibraryScreen'));
const DictionaryBrowseScreen = lazySuspense(() => import('../screens/DictionaryBrowseScreen'));
const DictionaryDetailScreen = lazySuspense(() => import('../screens/DictionaryDetailScreen'));
const DebateBrowseScreen = lazySuspense(() => import('../screens/DebateBrowseScreen'));
const DebateDetailScreen = lazySuspense(() => import('../screens/DebateDetailScreen'));
const LifeTopicsScreen = lazySuspense(() => import('../screens/LifeTopicsScreen'));
const LifeTopicDetailScreen = lazySuspense(() => import('../screens/LifeTopicDetailScreen'));
const LensBrowseScreen = lazySuspense(() => import('../screens/LensBrowseScreen'));
const ArchaeologyBrowseScreen = lazySuspense(() => import('../screens/ArchaeologyBrowseScreen'));
const ArchaeologyDetailScreen = lazySuspense(() => import('../screens/ArchaeologyDetailScreen'));
const TimeTravelBrowseScreen = lazySuspense(() => import('../screens/TimeTravelBrowseScreen'));
const TimeTravelDetailScreen = lazySuspense(() => import('../screens/TimeTravelDetailScreen'));
const GrammarBrowseScreen = lazySuspense(() => import('../screens/GrammarBrowseScreen'));
const GrammarArticleScreen = lazySuspense(() => import('../screens/GrammarArticleScreen'));
const ThreadBrowseScreen = lazySuspense(() => import('../screens/ThreadBrowseScreen'));
const ThreadDetailScreen = lazySuspense(() => import('../screens/ThreadDetailScreen'));
const SubmissionFlowScreen = lazySuspense(() => import('../screens/SubmissionFlowScreen'));
const SubmissionDetailScreen = lazySuspense(() => import('../screens/SubmissionDetailScreen'));
const SubmissionFeedScreen = lazySuspense(() => import('../screens/SubmissionFeedScreen'));
const ChapterScreen = lazySuspense(() => import('../screens/ChapterScreen'));

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
      <Stack.Screen name="Periods" component={PeriodsScreen} />
      <Stack.Screen name="RedemptiveArc" component={RedemptiveArcScreen} />
      <Stack.Screen name="PersonJourney" component={PersonJourneyScreen} />
      <Stack.Screen name="JourneyBrowse" component={JourneyBrowseScreen} />
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
      <Stack.Screen name="TimeTravelBrowse" component={TimeTravelBrowseScreen} />
      <Stack.Screen name="TimeTravelDetail" component={TimeTravelDetailScreen} />
      <Stack.Screen name="GrammarBrowse" component={GrammarBrowseScreen} />
      <Stack.Screen name="GrammarArticle" component={GrammarArticleScreen} />
      <Stack.Screen name="ThreadBrowse" component={ThreadBrowseScreen} />
      <Stack.Screen name="ThreadDetail" component={ThreadDetailScreen} />
      <Stack.Screen name="SubmissionFlow" component={SubmissionFlowScreen} />
      <Stack.Screen name="SubmissionDetail" component={SubmissionDetailScreen} />
      <Stack.Screen name="SubmissionFeed" component={SubmissionFeedScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
    </Stack.Navigator>
  );
}
