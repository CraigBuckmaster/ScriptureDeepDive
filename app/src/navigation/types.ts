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

export type ReadStackParamList = {
  BookList: undefined;
  ChapterList: { bookId: string };
  BookIntro: { bookId: string };
  Chapter: { bookId: string; chapterNum: number };
  ParallelPassage: { entryId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Chapter: { bookId: string; chapterNum: number };
  ChapterList: { bookId: string };
  BookList: undefined;
  BookIntro: { bookId: string };
  ParallelPassage: { entryId: string };
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
  ProphecyBrowse: undefined;
  ProphecyDetail: { chainId: string };
  ConceptBrowse: undefined;
  ConceptDetail: { conceptId: string };
  DifficultPassagesBrowse: undefined;
  DifficultPassageDetail: { passageId: string };
  Chapter: { bookId: string; chapterNum: number };
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
  Chapter: { bookId: string; chapterNum: number };
  BookIntro: { bookId: string };
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
