/**
 * ExtraBiblicalDetailScreen.test.tsx — Detail view for one extrabiblical
 * entry (HWGTB-P2-03 / #1548).
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ExtraBiblicalDetailScreen from '@/screens/ExtraBiblicalDetailScreen';
import type { ExtrabiblicalEntry } from '@/types';

// ── Navigation mock ─────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: { id: '1_enoch' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  ArrowLeft: () => null,
  Search: () => null,
  X: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// ── Premium mock — mutable for per-test flip ─────────────────────
let mockIsPremium = true;
const mockShowUpgrade = jest.fn();
const mockDismissUpgrade = jest.fn();
let mockUpgradeRequest: { variant: string; featureName: string } | null = null;
jest.mock('@/hooks/usePremium', () => ({
  usePremium: () => ({
    isPremium: mockIsPremium,
    upgradeRequest: mockUpgradeRequest,
    showUpgrade: mockShowUpgrade,
    dismissUpgrade: mockDismissUpgrade,
  }),
}));

// ── Entry fixture ───────────────────────────────────────────────
const FIXTURE: ExtrabiblicalEntry = {
  id: '1_enoch',
  title: '1 Enoch (Ethiopic Enoch)',
  also_known_as: ['Book of Enoch', 'Ethiopic Enoch'],
  category: 'pseudepigrapha',
  estimated_date: '3rd c. BC – 1st c. AD',
  original_language: 'Aramaic / Hebrew, preserved in Ethiopic Geʽez',
  tradition_status: {
    protestant: 'not canonical',
    catholic: 'not canonical',
    eastern_orthodox: 'not canonical',
    ethiopian_tewahedo: 'canonical (81-book canon)',
  },
  brief_summary:
    '1 Enoch is a composite work of five distinct books.\n\nIt is preserved complete only in Ethiopic Geʽez.',
  full_summary: null,
  nt_citations: [
    { ref: 'Jude 14-15', cites: '1 Enoch 1:9', type: 'direct_quotation' },
  ],
  ot_allusions: [
    { ref: 'Genesis 6:1-4', connection: 'The Watchers expand Gen 6:1-4.' },
  ],
  scholar_voices: [
    {
      scholar_id: 'nickelsburg',
      position: "Hermeneia commentary on 1 Enoch.",
    },
  ],
  related_debate_ids: ['did-jude-affirm-enoch-as-scripture'],
  related_journey_ids: ['canon-formation'],
  related_difficult_passage_ids: ['jude-quotes-enoch'],
  tags: ['pseudepigrapha', 'hwgtb'],
  further_reading: [
    {
      title: '1 Enoch 1',
      author: 'Nickelsburg',
      note: 'Hermeneia (2001)',
    },
    {
      title: 'Online Aramaic fragments archive',
      url: 'https://example.org/1enoch-aramaic',
    },
  ],
};

let mockEntry: ExtrabiblicalEntry | null = FIXTURE;
let mockLoading = false;
jest.mock('@/hooks/useExtraBiblicalEntry', () => ({
  useExtraBiblicalEntry: () => ({ entry: mockEntry, loading: mockLoading }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPremium = true;
  mockUpgradeRequest = null;
  mockEntry = FIXTURE;
  mockLoading = false;
});

describe('ExtraBiblicalDetailScreen', () => {
  describe('render — premium tier', () => {
    it('renders hero title + aliases', () => {
      const { getAllByText, getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      // Title appears twice: screen header + hero card
      expect(getAllByText('1 Enoch (Ethiopic Enoch)').length).toBeGreaterThanOrEqual(1);
      expect(getByText(/Also known as:.*Book of Enoch.*Ethiopic Enoch/)).toBeTruthy();
    });

    it('renders tradition badges', () => {
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByLabelText(/^Protestant:/)).toBeTruthy();
      expect(getByLabelText(/^Ethiopian Tewahedo:/)).toBeTruthy();
    });

    it('renders full brief_summary (both paragraphs)', () => {
      const { getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(
        getByText(/1 Enoch is a composite work of five distinct books\./),
      ).toBeTruthy();
      expect(getByText(/It is preserved complete only in Ethiopic Geʽez\./)).toBeTruthy();
    });

    it('renders NT citations with ref + source + type', () => {
      const { getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByText('Jude 14-15')).toBeTruthy();
      expect(getByText(/→ 1 Enoch 1:9/)).toBeTruthy();
      expect(getByText('Direct quotation')).toBeTruthy();
    });

    it('renders OT allusions', () => {
      const { getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByText('Genesis 6:1-4')).toBeTruthy();
      expect(getByText(/The Watchers expand Gen 6:1-4/)).toBeTruthy();
    });

    it('renders scholar voices', () => {
      const { getAllByText, getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      // 'Nickelsburg' appears twice: scholar-voice name AND further-reading author
      expect(getAllByText('Nickelsburg').length).toBeGreaterThanOrEqual(1);
      expect(getByText(/Hermeneia commentary on 1 Enoch/)).toBeTruthy();
    });

    it('renders related-debate chip and section header', () => {
      const { getByLabelText, getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByText('RELATED DEBATES')).toBeTruthy();
      expect(
        getByLabelText('Open debate did-jude-affirm-enoch-as-scripture'),
      ).toBeTruthy();
    });

    it('renders related-difficult-passage and related-journey chips', () => {
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByLabelText('Open difficult jude-quotes-enoch')).toBeTruthy();
      expect(getByLabelText('Open journey canon-formation')).toBeTruthy();
    });

    it('renders further-reading items', () => {
      const { getAllByText, getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByText('1 Enoch 1')).toBeTruthy();
      expect(getAllByText('Nickelsburg').length).toBeGreaterThanOrEqual(1);
      expect(getByText('Online Aramaic fragments archive')).toBeTruthy();
    });

    it('renders "Coming soon" placeholder when full_summary is null', () => {
      const { getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByText(/Coming soon — expanded scholarly summary/)).toBeTruthy();
    });

    it('renders full_summary when it is present instead of placeholder', () => {
      mockEntry = { ...FIXTURE, full_summary: 'Expanded analysis goes here.' };
      const { getByText, queryByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByText('Expanded analysis goes here.')).toBeTruthy();
      expect(queryByText(/Coming soon/)).toBeNull();
    });
  });

  describe('deep-link navigation — premium tier', () => {
    it('tapping NT citation navigates to Chapter with parsed book/chapter/verse', () => {
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      fireEvent.press(getByLabelText('Open Jude 14-15'));
      expect(mockNavigate).toHaveBeenCalledWith(
        'Chapter',
        expect.objectContaining({ bookId: 'jude', chapterNum: 1 }),
      );
    });

    it('tapping OT allusion navigates to Chapter with bookId', () => {
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      fireEvent.press(getByLabelText('Open Genesis 6:1-4'));
      expect(mockNavigate).toHaveBeenCalledWith(
        'Chapter',
        expect.objectContaining({ bookId: 'genesis', chapterNum: 6 }),
      );
    });

    it('tapping scholar navigates to ScholarBio', () => {
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      fireEvent.press(getByLabelText('Scholar: nickelsburg'));
      expect(mockNavigate).toHaveBeenCalledWith('ScholarBio', {
        scholarId: 'nickelsburg',
      });
    });

    it('tapping debate chip navigates to DebateDetail', () => {
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      fireEvent.press(
        getByLabelText('Open debate did-jude-affirm-enoch-as-scripture'),
      );
      expect(mockNavigate).toHaveBeenCalledWith('DebateDetail', {
        topicId: 'did-jude-affirm-enoch-as-scripture',
      });
    });

    it('tapping difficult-passage chip navigates to DifficultPassageDetail', () => {
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      fireEvent.press(getByLabelText('Open difficult jude-quotes-enoch'));
      expect(mockNavigate).toHaveBeenCalledWith('DifficultPassageDetail', {
        passageId: 'jude-quotes-enoch',
      });
    });

    it('tapping journey chip navigates to JourneyDetail', () => {
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      fireEvent.press(getByLabelText('Open journey canon-formation'));
      expect(mockNavigate).toHaveBeenCalledWith('JourneyDetail', {
        journeyId: 'canon-formation',
      });
    });

    it('tapping further-reading with url calls Linking.openURL', () => {
      const openUrlSpy = jest
        .spyOn(Linking, 'openURL')
        .mockResolvedValue(undefined);
      const { getByLabelText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      fireEvent.press(getByLabelText('Open Online Aramaic fragments archive'));
      expect(openUrlSpy).toHaveBeenCalledWith('https://example.org/1enoch-aramaic');
      openUrlSpy.mockRestore();
    });
  });

  describe('free tier (premium gating)', () => {
    it('renders only first paragraph of brief_summary', () => {
      mockIsPremium = false;
      const { getByText, queryByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(
        getByText(/1 Enoch is a composite work of five distinct books\./),
      ).toBeTruthy();
      // Second paragraph is hidden
      expect(
        queryByText(/It is preserved complete only in Ethiopic Geʽez\./),
      ).toBeNull();
    });

    it('hides all gated sections (NT citations, scholars, debates, etc.)', () => {
      mockIsPremium = false;
      const { queryByText, queryByLabelText } = renderWithProviders(
        <ExtraBiblicalDetailScreen />,
      );
      expect(queryByText('NEW TESTAMENT CITATIONS')).toBeNull();
      expect(queryByText('SCHOLAR VOICES')).toBeNull();
      expect(queryByText('RELATED DEBATES')).toBeNull();
      expect(queryByText('FULL SUMMARY')).toBeNull();
      expect(queryByLabelText('Open Jude 14-15')).toBeNull();
      expect(queryByLabelText('Scholar: nickelsburg')).toBeNull();
    });

    it('shows unlock CTA and fires showUpgrade on tap', () => {
      mockIsPremium = false;
      const { getByLabelText, getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByText(/Unlock the full entry/)).toBeTruthy();
      fireEvent.press(getByLabelText('Unlock full entry'));
      expect(mockShowUpgrade).toHaveBeenCalledWith(
        'explore',
        'Extra-Biblical Literature',
      );
    });
  });

  describe('loading + not-found states', () => {
    it('shows loading indicator when loading=true', () => {
      mockLoading = true;
      mockEntry = null;
      const { toJSON } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(toJSON()).not.toBeNull();
    });

    it('shows "Entry not found" when entry=null after load', () => {
      mockLoading = false;
      mockEntry = null;
      const { getByText } = renderWithProviders(<ExtraBiblicalDetailScreen />);
      expect(getByText(/Entry not found\./)).toBeTruthy();
    });
  });
});
