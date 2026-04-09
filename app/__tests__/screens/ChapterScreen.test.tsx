import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ChapterScreen from '@/screens/ChapterScreen';

// ── Navigation mock ───────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockPush = jest.fn();
const mockSetParams = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      push: mockPush,
      setParams: mockSetParams,
      setOptions: jest.fn(),
      canGoBack: mockCanGoBack,
    }),
    useRoute: jest.fn().mockReturnValue({
      params: { bookId: 'genesis', chapterNum: 1 },
      key: 'chapter-1',
      name: 'Chapter',
    }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Data hooks ────────────────────────────────────────────────────

const mockChapterData = {
  chapter: {
    id: 'genesis_1',
    book_id: 'genesis',
    chapter_num: 1,
    title: 'Creation',
    coaching_json: null,
    timeline_link_event: null,
    map_story_link_id: null,
  },
  sections: [
    {
      id: 'sec_1',
      chapter_id: 'genesis_1',
      section_num: 1,
      heading: 'The Beginning',
      verse_start: 1,
      verse_end: 5,
      panels: [],
    },
  ],
  verses: [
    { id: 1, book_id: 'genesis', chapter_num: 1, verse_num: 1, text: 'In the beginning God created the heavens and the earth.', book_name: 'Genesis' },
    { id: 2, book_id: 'genesis', chapter_num: 1, verse_num: 2, text: 'Now the earth was formless and empty.', book_name: 'Genesis' },
  ],
  vhlGroups: [],
  chapterPanels: [],
  noteCount: 0,
  isLoading: false,
};

jest.mock('@/hooks/useChapterData', () => ({
  useChapterData: () => mockChapterData,
}));

jest.mock('@/hooks/useTTS', () => ({
  useTTS: () => ({
    isPlaying: false,
    currentVerse: 0,
    speed: 1,
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    skipNext: jest.fn(),
    skipPrev: jest.fn(),
    setSpeed: jest.fn(),
  }),
}));

jest.mock('@/hooks/useSwipeNavigation', () => ({
  useSwipeNavigation: () => ({
    onTouchStart: jest.fn(),
    onTouchEnd: jest.fn(),
  }),
}));

jest.mock('@/hooks/useNotedVerses', () => ({
  useNotedVerses: () => new Set<number>(),
}));

jest.mock('@/hooks/useStudyDepth', () => ({
  useStudyDepth: () => ({
    depthMap: new Map(),
    recordOpen: jest.fn(),
  }),
}));

jest.mock('@/stores', () => ({
  useSettingsStore: Object.assign(
    (sel: any) => sel({
      translation: 'kjv',
      fontSize: 16,
      studyCoachEnabled: false,
      setTranslation: jest.fn(),
      gettingStartedDone: new Set(),
    }),
    { getState: () => ({ markGettingStartedDone: jest.fn(), focusMode: false, gettingStartedDone: new Set() }) },
  ),
  useReaderStore: (sel: any) => sel({
    activePanel: null,
    qnavOpen: false,
    notesOverlayOpen: false,
    setActivePanel: jest.fn(),
    clearActivePanel: jest.fn(),
    toggleQnav: jest.fn(),
    toggleNotesOverlay: jest.fn(),
  }),
}));

jest.mock('@/db/content', () => ({
  getBook: jest.fn().mockResolvedValue({
    id: 'genesis',
    name: 'Genesis',
    testament: 'ot',
    total_chapters: 50,
    is_live: true,
    genre_label: null,
    genre_guidance: null,
  }),
}));

jest.mock('@/db/user', () => ({
  recordVisit: jest.fn(),
  setHighlight: jest.fn(),
  removeHighlight: jest.fn(),
  getHighlightsForChapter: jest.fn().mockResolvedValue([]),
  getBookmarks: jest.fn().mockResolvedValue([]),
  addBookmark: jest.fn().mockResolvedValue(undefined),
  removeBookmark: jest.fn().mockResolvedValue(undefined),
}));

// Stub all child components to avoid deep dependency trees
jest.mock('@/components/ChapterNavBar', () => ({
  ChapterNavBar: (props: any) => {
    const React = require('react');
    const { Text, TouchableOpacity } = require('react-native');
    return React.createElement(
      'ChapterNavBar',
      { testID: 'chapter-nav-bar' },
      React.createElement(Text, null, `${props.bookName} ${props.chapterNum}`),
      props.onBack && React.createElement(TouchableOpacity, { testID: 'back-button', onPress: props.onBack }),
      React.createElement(TouchableOpacity, { testID: 'tts-button', onPress: props.onTTSPress }),
    );
  },
}));

jest.mock('@/components/ChapterHeader', () => ({
  ChapterHeader: () => 'ChapterHeader',
}));

jest.mock('@/components/SectionBlock', () => ({
  SectionBlock: (props: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement('SectionBlock', null,
      React.createElement(Text, null, props.section.heading),
    );
  },
}));

jest.mock('@/components/ButtonRow', () => ({
  ButtonRow: () => 'ButtonRow',
}));

jest.mock('@/components/PanelContainer', () => ({
  PanelContainer: () => 'PanelContainer',
}));

jest.mock('@/components/ScholarlyBlock', () => ({
  ScholarlyBlock: () => 'ScholarlyBlock',
}));

jest.mock('@/components/QnavOverlay', () => ({
  QnavOverlay: () => null,
}));

jest.mock('@/components/notes', () => ({
  NotesOverlay: () => null,
}));

jest.mock('@/components/ChapterSkeleton', () => ({
  ChapterSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'chapter-skeleton' }, 'Loading...');
  },
}));

jest.mock('@/components/VerseLongPressMenu', () => ({
  VerseLongPressMenu: () => null,
}));

jest.mock('@/components/HighlightColorPicker', () => ({
  HighlightColorPicker: () => null,
  HIGHLIGHT_COLORS: [],
}));

jest.mock('@/components/InterlinearSheet', () => ({
  InterlinearSheet: () => null,
}));

jest.mock('@/components/TTSControls', () => ({
  TTSControls: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'tts-controls' }, 'TTSControls');
  },
}));

jest.mock('@/components/GenreBanner', () => ({
  GenreBanner: () => null,
}));

jest.mock('@/components/StudyCoachCard', () => ({
  StudyCoachCard: () => null,
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('ChapterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChapterData.isLoading = false;
    mockChapterData.chapter = {
      id: 'genesis_1',
      book_id: 'genesis',
      chapter_num: 1,
      title: 'Creation',
      coaching_json: null,
      timeline_link_event: null,
      map_story_link_id: null,
    } as any;
    (useRoute as jest.Mock).mockReturnValue({
      params: { bookId: 'genesis', chapterNum: 1 },
      key: 'chapter-1',
      name: 'Chapter',
    });
  });

  it('renders loading skeleton when isLoading', () => {
    mockChapterData.isLoading = true;
    const { getByTestId } = renderWithProviders(<ChapterScreen />);
    expect(getByTestId('chapter-skeleton')).toBeTruthy();
  });

  it('renders loading skeleton when chapter is null', () => {
    mockChapterData.chapter = null as any;
    const { getByTestId } = renderWithProviders(<ChapterScreen />);
    expect(getByTestId('chapter-skeleton')).toBeTruthy();
  });

  it('renders chapter content when loaded', () => {
    const { getByTestId } = renderWithProviders(<ChapterScreen />);
    expect(getByTestId('chapter-nav-bar')).toBeTruthy();
  });

  it('ChapterNavBar receives correct bookName and chapterNum', async () => {
    const { findByText } = renderWithProviders(<ChapterScreen />);
    // Before getBook resolves, bookName falls back to bookId. After it resolves, it shows "Genesis".
    // The mock ChapterNavBar renders bookName + chapterNum as text.
    expect(await findByText('Genesis 1')).toBeTruthy();
  });

  it('renders back button when navigation.canGoBack returns true', () => {
    mockCanGoBack.mockReturnValue(true);
    const { getByTestId } = renderWithProviders(<ChapterScreen />);
    expect(getByTestId('back-button')).toBeTruthy();
  });

  it('does not render back button when canGoBack is false', () => {
    mockCanGoBack.mockReturnValue(false);
    const { queryByTestId } = renderWithProviders(<ChapterScreen />);
    expect(queryByTestId('back-button')).toBeNull();
  });

  it('renders section headings', () => {
    const { getByText } = renderWithProviders(<ChapterScreen />);
    expect(getByText('The Beginning')).toBeTruthy();
  });

  it('renders scholar disclaimer', () => {
    const { getByText } = renderWithProviders(<ChapterScreen />);
    expect(getByText(/Scholar commentary panels present paraphrased summaries/)).toBeTruthy();
  });

  it('does not show TTS controls when ttsActive is false', () => {
    const { queryByTestId } = renderWithProviders(<ChapterScreen />);
    // TTS controls only render when ttsActive state is true (internal state)
    expect(queryByTestId('tts-controls')).toBeNull();
  });

  it('handles different bookId from route params', () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { bookId: 'exodus', chapterNum: 10 },
      key: 'chapter-2',
      name: 'Chapter',
    });
    const { getByText } = renderWithProviders(<ChapterScreen />);
    // bookData returns Genesis from mock, but chapterNum from route
    expect(getByText(/10/)).toBeTruthy();
  });

  it('renders without crash for chapter with no sections', () => {
    mockChapterData.sections = [];
    const { toJSON } = renderWithProviders(<ChapterScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crash for chapter with empty verses', () => {
    mockChapterData.verses = [];
    const { toJSON } = renderWithProviders(<ChapterScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crash when route has openPanel param', () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { bookId: 'genesis', chapterNum: 1, openPanel: { panelType: 'scholarly', sectionNum: 1 } },
      key: 'chapter-3',
      name: 'Chapter',
    });
    const { toJSON } = renderWithProviders(<ChapterScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('TTS button is present in nav bar', () => {
    const { getByTestId } = renderWithProviders(<ChapterScreen />);
    expect(getByTestId('tts-button')).toBeTruthy();
  });

  it('back button calls goBack when pressed', () => {
    mockCanGoBack.mockReturnValue(true);
    const { getByTestId } = renderWithProviders(<ChapterScreen />);
    fireEvent.press(getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
