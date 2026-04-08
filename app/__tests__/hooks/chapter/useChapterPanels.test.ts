import { renderHook, act } from '@testing-library/react-native';
import { createRef } from 'react';
import type { ScrollView } from 'react-native';
import { LayoutAnimation } from 'react-native';

// --- Store mock ---
let mockActivePanel: { sectionId: string; panelType: string } | null = null;
const mockSetActivePanel = jest.fn((sectionId: string, panelType: string) => {
  // Replicate single-open policy: same panel toggles off, different toggles on
  if (mockActivePanel?.sectionId === sectionId && mockActivePanel?.panelType === panelType) {
    mockActivePanel = null;
  } else {
    mockActivePanel = { sectionId, panelType };
  }
});
const mockClearActivePanel = jest.fn(() => {
  mockActivePanel = null;
});

jest.mock('@/stores', () => ({
  useReaderStore: (selector: any) =>
    selector({
      activePanel: mockActivePanel,
      setActivePanel: mockSetActivePanel,
      clearActivePanel: mockClearActivePanel,
    }),
}));

// --- Study depth mock ---
const mockRecordOpen = jest.fn();
jest.mock('@/hooks/useStudyDepth', () => ({
  useStudyDepth: jest.fn(() => ({
    depthMap: new Map(),
    recordOpen: mockRecordOpen,
  })),
}));

// --- Study recorder mock ---
const mockRecordEvent = jest.fn();
jest.mock('@/hooks/useStudyRecorder', () => ({
  useStudyRecorder: jest.fn(() => ({
    recordEvent: mockRecordEvent,
  })),
}));

import { useChapterPanels } from '@/hooks/chapter/useChapterPanels';

const mockSections = [
  {
    id: 'sec-1',
    chapter_id: 'ch-1',
    section_num: 1,
    header: 'Section One',
    verse_start: 1,
    verse_end: 5,
    panels: [
      { id: 1, section_id: 'sec-1', panel_type: 'heb', content_json: '{}' },
      { id: 2, section_id: 'sec-1', panel_type: 'hist', content_json: '{}' },
    ],
  },
  {
    id: 'sec-2',
    chapter_id: 'ch-1',
    section_num: 2,
    header: 'Section Two',
    verse_start: 6,
    verse_end: 10,
    panels: [
      { id: 3, section_id: 'sec-2', panel_type: 'cross', content_json: '{}' },
    ],
  },
];

function createOptions(overrides = {}) {
  return {
    chapterId: 'ch-1' as string | undefined,
    sections: mockSections as any,
    isPremium: false,
    bookId: 'genesis',
    chapterNum: 1,
    openPanel: null as { sectionNum?: number; panelType: string } | null,
    isLoading: false,
    scrollRef: createRef<ScrollView>(),
    ...overrides,
  };
}

describe('useChapterPanels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActivePanel = null;
  });

  it('starts with no active panel', () => {
    const { result } = renderHook(() => useChapterPanels(createOptions()));
    expect(result.current.activePanel).toBeNull();
    expect(result.current.activeSectionPanelType).toBeNull();
    expect(result.current.activeChapterPanelType).toBeNull();
  });

  it('handleSectionPanelToggle opens a section panel', () => {
    const { result } = renderHook(() => useChapterPanels(createOptions()));

    act(() => {
      result.current.handleSectionPanelToggle('sec-1', 'heb');
    });

    expect(mockSetActivePanel).toHaveBeenCalledWith('sec-1', 'heb');
    expect(mockRecordOpen).toHaveBeenCalledWith('sec-1', 'heb');
    expect(mockRecordEvent).toHaveBeenCalledWith('panel_open', {
      section_id: 'sec-1',
      panel_type: 'heb',
    });
  });

  it('handleSectionPanelToggle triggers LayoutAnimation', () => {
    const configSpy = jest.spyOn(LayoutAnimation, 'configureNext');
    const { result } = renderHook(() => useChapterPanels(createOptions()));

    act(() => {
      result.current.handleSectionPanelToggle('sec-1', 'heb');
    });

    expect(configSpy).toHaveBeenCalledWith(LayoutAnimation.Presets.easeInEaseOut);
    configSpy.mockRestore();
  });

  it('handleChapterPanelToggle opens a chapter-level panel', () => {
    const { result } = renderHook(() => useChapterPanels(createOptions()));

    act(() => {
      result.current.handleChapterPanelToggle('prayer');
    });

    expect(mockSetActivePanel).toHaveBeenCalledWith('__chapter__', 'prayer');
    expect(mockRecordEvent).toHaveBeenCalledWith('panel_open', {
      section_id: '__chapter__',
      panel_type: 'prayer',
    });
  });

  it('toggling same section panel records close event', () => {
    // Pre-set the active panel to simulate already open
    mockActivePanel = { sectionId: 'sec-1', panelType: 'heb' };

    const { result } = renderHook(() => useChapterPanels(createOptions()));

    act(() => {
      result.current.handleSectionPanelToggle('sec-1', 'heb');
    });

    expect(mockRecordEvent).toHaveBeenCalledWith('panel_close', {
      section_id: 'sec-1',
      panel_type: 'heb',
    });
  });

  it('exposes depthMap and recordOpen from useStudyDepth', () => {
    const { result } = renderHook(() => useChapterPanels(createOptions()));
    expect(result.current.depthMap).toBeDefined();
    expect(result.current.recordOpen).toBe(mockRecordOpen);
  });

  it('clearActivePanel is exposed', () => {
    const { result } = renderHook(() => useChapterPanels(createOptions()));
    expect(result.current.clearActivePanel).toBeDefined();
  });

  it('activeChapterPanelType reflects chapter panel state', () => {
    mockActivePanel = { sectionId: '__chapter__', panelType: 'prayer' };

    const { result } = renderHook(() => useChapterPanels(createOptions()));

    expect(result.current.activeChapterPanelType).toBe('prayer');
    expect(result.current.activeSectionPanelType).toBeNull();
  });

  it('activeSectionPanelType reflects section panel state', () => {
    mockActivePanel = { sectionId: 'sec-1', panelType: 'heb' };

    const { result } = renderHook(() => useChapterPanels(createOptions()));

    expect(result.current.activeSectionPanelType).toEqual({
      sectionId: 'sec-1',
      panelType: 'heb',
    });
    expect(result.current.activeChapterPanelType).toBeNull();
  });
});
