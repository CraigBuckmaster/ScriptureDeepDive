/**
 * Tests for services/amicus/citationNav.ts.
 */
import {
  navigateToCitation,
  parseChapterPanelId,
  parseCrossRefThreadNoteId,
  parseJourneyStopId,
  parseSectionPanelId,
} from '../citationNav';
import { getMockDb, resetMockDb } from '../../../../__tests__/helpers/mockDb';

jest.mock('@/db/database', () =>
  require('../../../../__tests__/helpers/mockDb').mockDatabaseModule(),
);

interface FakeNav {
  navigate: jest.Mock;
  getParent: () => FakeNav | null;
}

function fakeNavigation(): FakeNav & { root: FakeNav } {
  const root: FakeNav = {
    navigate: jest.fn(),
    getParent: () => null,
  };
  const stack: FakeNav & { root: FakeNav } = {
    navigate: jest.fn(),
    getParent: () => root,
    root,
  };
  return stack;
}

describe('ID parsers', () => {
  it('parses section_panel ids', () => {
    expect(parseSectionPanelId('romans-9-s1-calvin')).toEqual({
      bookId: 'romans',
      chapterNum: 9,
      sectionNum: 1,
      panelType: 'calvin',
    });
    expect(parseSectionPanelId('1_samuel-17-s2-sarna')).toEqual({
      bookId: '1_samuel',
      chapterNum: 17,
      sectionNum: 2,
      panelType: 'sarna',
    });
    expect(parseSectionPanelId('bogus')).toBeNull();
  });

  it('parses chapter_panel ids', () => {
    expect(parseChapterPanelId('romans-9-lit')).toEqual({
      bookId: 'romans',
      chapterNum: 9,
      panelType: 'lit',
    });
  });

  it('parses journey_stop ids', () => {
    expect(parseJourneyStopId('thematic-christ-in-the-old-testament-3')).toEqual({
      journeyType: 'thematic',
      journeyId: 'christ-in-the-old-testament',
      stopOrder: 3,
    });
  });

  it('parses cross_ref_thread_note ids', () => {
    expect(parseCrossRefThreadNoteId('substitutionary-sacrifice-0')).toEqual({
      threadId: 'substitutionary-sacrifice',
      idx: 0,
    });
  });
});

describe('navigateToCitation', () => {
  beforeEach(() => {
    resetMockDb();
  });

  it('routes section_panel to Read → Chapter with openPanel', async () => {
    const nav = fakeNavigation();
    const outcome = await navigateToCitation(
      {
        chunk_id: 'section_panel:romans-9-s1-calvin',
        source_type: 'section_panel',
        source_id: 'romans-9-s1-calvin',
      },
      nav as never,
    );
    expect(outcome.kind).toBe('navigated');
    expect(nav.root.navigate).toHaveBeenCalledWith(
      'ReadTab',
      expect.objectContaining({
        screen: 'Chapter',
        params: expect.objectContaining({
          bookId: 'romans',
          chapterNum: 9,
          openPanel: { sectionNum: 1, panelType: 'calvin' },
        }),
      }),
    );
  });

  it('routes word_study to Explore → WordStudyDetail', async () => {
    const nav = fakeNavigation();
    await navigateToCitation(
      {
        chunk_id: 'word_study:hesed',
        source_type: 'word_study',
        source_id: 'hesed',
      },
      nav as never,
    );
    expect(nav.root.navigate).toHaveBeenCalledWith('ExploreTab', {
      screen: 'WordStudyDetail',
      params: { wordId: 'hesed' },
    });
  });

  it('routes lexicon_entry to Explore → DictionaryDetail', async () => {
    const nav = fakeNavigation();
    await navigateToCitation(
      {
        chunk_id: 'lexicon_entry:heb-H2617',
        source_type: 'lexicon_entry',
        source_id: 'heb-H2617',
      },
      nav as never,
    );
    expect(nav.root.navigate).toHaveBeenCalledWith('ExploreTab', {
      screen: 'DictionaryDetail',
      params: { entryId: 'heb-H2617' },
    });
  });

  it('routes debate_topic to Explore → DebateDetail', async () => {
    const nav = fakeNavigation();
    await navigateToCitation(
      {
        chunk_id: 'debate_topic:day-age',
        source_type: 'debate_topic',
        source_id: 'day-age',
      },
      nav as never,
    );
    expect(nav.root.navigate).toHaveBeenCalledWith('ExploreTab', {
      screen: 'DebateDetail',
      params: { topicId: 'day-age' },
    });
  });

  it('routes journey_stop to Explore → JourneyDetail', async () => {
    const nav = fakeNavigation();
    await navigateToCitation(
      {
        chunk_id: 'journey_stop:thematic-christ-in-the-old-testament-3',
        source_type: 'journey_stop',
        source_id: 'thematic-christ-in-the-old-testament-3',
      },
      nav as never,
    );
    expect(nav.root.navigate).toHaveBeenCalledWith('ExploreTab', {
      screen: 'JourneyDetail',
      params: { journeyId: 'christ-in-the-old-testament' },
    });
  });

  it('returns modal outcome for meta_faq with resolved article', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      chunk_id: 'meta_faq:septuagint-lxx',
      text: 'What Is the Septuagint?\nThe LXX is the Greek translation...',
    });

    const nav = fakeNavigation();
    const outcome = await navigateToCitation(
      {
        chunk_id: 'meta_faq:septuagint-lxx',
        source_type: 'meta_faq',
        source_id: 'septuagint-lxx',
      },
      nav as never,
    );
    expect(outcome.kind).toBe('modal');
    if (outcome.kind === 'modal') {
      expect(outcome.modal).toBe('meta_faq');
      expect(outcome.article.title).toContain('Septuagint');
    }
  });

  it('returns unresolved when meta_faq missing', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce(null);
    const outcome = await navigateToCitation(
      {
        chunk_id: 'meta_faq:missing',
        source_type: 'meta_faq',
        source_id: 'missing',
      },
      fakeNavigation() as never,
    );
    expect(outcome.kind).toBe('unresolved');
  });

  it('returns unresolved on malformed section_panel id', async () => {
    const nav = fakeNavigation();
    const outcome = await navigateToCitation(
      {
        chunk_id: 'section_panel:garbage',
        source_type: 'section_panel',
        source_id: 'garbage',
      },
      nav as never,
    );
    expect(outcome.kind).toBe('unresolved');
    expect(nav.root.navigate).not.toHaveBeenCalled();
  });

  it('returns unresolved on unknown source_type', async () => {
    const outcome = await navigateToCitation(
      {
        chunk_id: 'nonsense:1',
        source_type: 'nonsense',
        source_id: '1',
      },
      fakeNavigation() as never,
    );
    expect(outcome.kind).toBe('unresolved');
  });
});
