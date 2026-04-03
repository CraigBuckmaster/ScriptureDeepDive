/**
 * navigation/types.ts — Centralized navigation type definitions.
 *
 * Single source of truth for all stack and tab param lists.
 * Screens import typed helpers from here instead of using <any>.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

// ── Stack Param Lists ─────────────────────────────────────────────

/** Deep-link param to auto-open a specific panel on the Chapter screen. */
export interface OpenPanelParam {
  sectionNum?: number;
  panelType: string;
  tabKey?: string;
}

export type ReadStackParamList = {
  BookList: undefined;
  ChapterList: { bookId: string };
  BookIntro: { bookId: string };
  Chapter: { bookId: string; chapterNum: number; openPanel?: OpenPanelParam };
  ParallelPassage: { entryId: string };
  ParallelDetail: { entryId: string };
  HarmonyBrowse: undefined;
  HarmonyDetail: { entryId: string };
  TopicBrowse: undefined;
  TopicDetail: { topicId: string };
  DictionaryBrowse: undefined;
  DictionaryDetail: { entryId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Chapter: { bookId: string; chapterNum: number; openPanel?: OpenPanelParam };
  ChapterList: { bookId: string };
  BookList: undefined;
  BookIntro: { bookId: string };
  ParallelPassage: { entryId: string };
  ParallelDetail: { entryId: string };
  HarmonyBrowse: undefined;
  HarmonyDetail: { entryId: string };
  TopicBrowse: undefined;
  TopicDetail: { topicId: string };
  DictionaryBrowse: undefined;
  DictionaryDetail: { entryId: string };
};

export type ExploreStackParamList = {
  ExploreMenu: undefined;
  GenealogyTree: { personId?: string } | undefined;
  PersonDetail: { personId: string };
  Map: { storyId?: string; placeId?: string };
  Timeline: { eventId?: string };
  WordStudyBrowse: undefined;
  WordStudyDetail: { wordId: string };
  ScholarBrowse: undefined;
  ScholarBio: { scholarId: string };
  ParallelPassage: { entryId: string };
  ParallelDetail: { entryId: string };
  HarmonyBrowse: undefined;
  HarmonyDetail: { entryId: string };
  TopicBrowse: undefined;
  TopicDetail: { topicId: string };
  ProphecyBrowse: undefined;
  ProphecyDetail: { chainId: string };
  ConceptBrowse: undefined;
  ConceptDetail: { conceptId: string };
  DifficultPassagesBrowse: undefined;
  DifficultPassageDetail: { passageId: string };
  DictionaryBrowse: undefined;
  DictionaryDetail: { entryId: string };
  DebateBrowse: undefined;
  DebateDetail: { topicId: string };
  LifeTopics: undefined;
  LifeTopicDetail: { topicId: string };
  ContentLibrary: undefined;
  Concordance: {
    strongs?: string;
    original?: string;
    transliteration?: string;
    gloss?: string;
  } | undefined;
  Chapter: { bookId: string; chapterNum: number; openPanel?: OpenPanelParam };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Settings: undefined;
  Bookmarks: undefined;
  ReadingHistory: undefined;
  AllNotes: undefined;
  CollectionDetail: { collectionId: number };
  PlanList: undefined;
  PlanDetail: { planId: string };
  Chapter: { bookId: string; chapterNum: number; openPanel?: OpenPanelParam };
  BookIntro: { bookId: string };
  Subscription: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type SearchStackParamList = {
  SearchMain: undefined;
};

// ── Tab Param List ────────────────────────────────────────────────

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ReadTab: NavigatorScreenParams<ReadStackParamList>;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  MoreTab: NavigatorScreenParams<MoreStackParamList>;
};

// ── Screen-level helper types ─────────────────────────────────────
// Usage: const navigation = useNavigation<ScreenNavProp<'Read', 'Chapter'>>();
//        const route = useRoute<ScreenRouteProp<'Read', 'Chapter'>>();

type StackMap = {
  Home: HomeStackParamList;
  Read: ReadStackParamList;
  Explore: ExploreStackParamList;
  More: MoreStackParamList;
  Search: SearchStackParamList;
};

export type ScreenNavProp<
  S extends keyof StackMap,
  T extends keyof StackMap[S],
> = StackNavigationProp<StackMap[S], T>;

export type ScreenRouteProp<
  S extends keyof StackMap,
  T extends keyof StackMap[S],
> = RouteProp<StackMap[S], T>;

// TODO: Add CrossTabNavProp once @react-navigation type constraints are resolved
