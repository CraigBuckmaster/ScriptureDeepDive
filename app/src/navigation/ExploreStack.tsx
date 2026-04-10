import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ExploreMenuScreen from '../screens/ExploreMenuScreen';
import { useTheme } from '../theme';
import type { ExploreStackParamList } from './types';

// Lazy-loaded screens — only imported on first navigation
const GenealogyTreeScreen = React.lazy(() => import('../screens/GenealogyTreeScreen'));
const PersonDetailScreen = React.lazy(() => import('../screens/PersonDetailScreen'));
const MapScreen = React.lazy(() => import('../screens/MapScreen'));
const TimelineScreen = React.lazy(() => import('../screens/TimelineScreen'));
const PeriodsScreen = React.lazy(() => import('../screens/PeriodsScreen'));
const RedemptiveArcScreen = React.lazy(() => import('../screens/RedemptiveArcScreen'));
const PersonJourneyScreen = React.lazy(() => import('../screens/PersonJourneyScreen'));
const WordStudyBrowseScreen = React.lazy(() => import('../screens/WordStudyBrowseScreen'));
const WordStudyDetailScreen = React.lazy(() => import('../screens/WordStudyDetailScreen'));
const ScholarBrowseScreen = React.lazy(() => import('../screens/ScholarBrowseScreen'));
const ScholarBioScreen = React.lazy(() => import('../screens/ScholarBioScreen'));
const ParallelPassageScreen = React.lazy(() => import('../screens/ParallelPassageScreen'));
const ParallelDetailScreen = React.lazy(() => import('../screens/ParallelDetailScreen'));
const HarmonyBrowseScreen = React.lazy(() => import('../screens/HarmonyBrowseScreen'));
const HarmonyDetailScreen = React.lazy(() => import('../screens/HarmonyDetailScreen'));
const TopicBrowseScreen = React.lazy(() => import('../screens/TopicBrowseScreen'));
const TopicDetailScreen = React.lazy(() => import('../screens/TopicDetailScreen'));
const ProphecyBrowseScreen = React.lazy(() => import('../screens/ProphecyBrowseScreen'));
const ProphecyDetailScreen = React.lazy(() => import('../screens/ProphecyDetailScreen'));
const ConceptBrowseScreen = React.lazy(() => import('../screens/ConceptBrowseScreen'));
const ConceptDetailScreen = React.lazy(() => import('../screens/ConceptDetailScreen'));
const DifficultPassagesBrowseScreen = React.lazy(() => import('../screens/DifficultPassagesBrowseScreen'));
const DifficultPassageDetailScreen = React.lazy(() => import('../screens/DifficultPassageDetailScreen'));
const ConcordanceScreen = React.lazy(() => import('../screens/ConcordanceScreen'));
const ContentLibraryScreen = React.lazy(() => import('../screens/ContentLibraryScreen'));
const DictionaryBrowseScreen = React.lazy(() => import('../screens/DictionaryBrowseScreen'));
const DictionaryDetailScreen = React.lazy(() => import('../screens/DictionaryDetailScreen'));
const DebateBrowseScreen = React.lazy(() => import('../screens/DebateBrowseScreen'));
const DebateDetailScreen = React.lazy(() => import('../screens/DebateDetailScreen'));
const LifeTopicsScreen = React.lazy(() => import('../screens/LifeTopicsScreen'));
const LifeTopicDetailScreen = React.lazy(() => import('../screens/LifeTopicDetailScreen'));
const LensBrowseScreen = React.lazy(() => import('../screens/LensBrowseScreen'));
const ArchaeologyBrowseScreen = React.lazy(() => import('../screens/ArchaeologyBrowseScreen'));
const ArchaeologyDetailScreen = React.lazy(() => import('../screens/ArchaeologyDetailScreen'));
const TimeTravelBrowseScreen = React.lazy(() => import('../screens/TimeTravelBrowseScreen'));
const TimeTravelDetailScreen = React.lazy(() => import('../screens/TimeTravelDetailScreen'));
const GrammarBrowseScreen = React.lazy(() => import('../screens/GrammarBrowseScreen'));
const GrammarArticleScreen = React.lazy(() => import('../screens/GrammarArticleScreen'));
const ThreadBrowseScreen = React.lazy(() => import('../screens/ThreadBrowseScreen'));
const ThreadDetailScreen = React.lazy(() => import('../screens/ThreadDetailScreen'));
const SubmissionFlowScreen = React.lazy(() => import('../screens/SubmissionFlowScreen'));
const SubmissionDetailScreen = React.lazy(() => import('../screens/SubmissionDetailScreen'));
const SubmissionFeedScreen = React.lazy(() => import('../screens/SubmissionFeedScreen'));
const ChapterScreen = React.lazy(() => import('../screens/ChapterScreen'));

const Stack = createStackNavigator<ExploreStackParamList>();

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

export function ExploreStack() {
  const { base } = useTheme();

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: base.bg },
          gestureEnabled: true,
          lazy: true,
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
    </Suspense>
  );
}
