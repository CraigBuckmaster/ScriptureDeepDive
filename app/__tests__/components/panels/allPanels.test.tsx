/**
 * allPanels.test.tsx — Parameterized rendering tests for all panel types.
 *
 * For each panel type that uses an entries/data array, tests:
 *   1. Renders without crash with sample data
 *   2. Renders without crash with empty data
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';

// Panel imports
import { HebrewPanel } from '@/components/panels/HebrewPanel';
import { CrossRefPanel } from '@/components/panels/CrossRefPanel';
import { PlacesPanel } from '@/components/panels/PlacesPanel';
import { TimelinePanel } from '@/components/panels/TimelinePanel';
import { SourcesPanel } from '@/components/panels/SourcesPanel';
import { ReceptionPanel } from '@/components/panels/ReceptionPanel';
import { ThreadingPanel } from '@/components/panels/ThreadingPanel';
import { PeoplePanel } from '@/components/panels/PeoplePanel';
import { HebrewReadingPanel } from '@/components/panels/HebrewReadingPanel';
import { TextualPanel } from '@/components/panels/TextualPanel';
import { DebatePanel } from '@/components/panels/DebatePanel';
import { DiscoursePanel } from '@/components/panels/DiscoursePanel';
import { CommentaryPanel } from '@/components/panels/CommentaryPanel';
import { LiteraryStructurePanel } from '@/components/panels/LiteraryStructurePanel';
import { ThemesRadarPanel } from '@/components/panels/ThemesRadarPanel';
import { TranslationPanel } from '@/components/panels/TranslationPanel';
import { PanelRenderer } from '@/components/panels/PanelRenderer';

// Mock dependencies used by TappableReference and other internals
jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

jest.mock('@/utils/verseResolver', () => ({
  parseReference: jest.fn(() => null),
  resolveVerseText: jest.fn().mockResolvedValue([]),
}));

// ── Sample data factories ──────────────────────────────────────────

const sampleData = {
  heb: [
    { word: '\u05D1\u05E8\u05D0\u05E9\u05D9\u05EA', tlit: 'bereshit', gloss: 'in the beginning', paragraph: 'Opening word of Torah.' },
  ],
  cross: [
    { ref: 'Gen 1:1', note: 'Creation account' },
    { ref: 'Ps 33:6', note: 'By the word of the LORD' },
  ],
  poi: [
    { name: 'Bethlehem', role: 'City of David', text: 'Southern Judah.' },
  ],
  tl: [
    { date: '1446 BC', name: 'Exodus', text: 'Israel leaves Egypt.', current: true },
  ],
  src: [
    { title: 'Enuma Elish', quote: 'When on high...', note: 'Babylonian creation epic.' },
  ],
  rec: [
    { title: 'Augustine', quote: 'In the beginning...', note: 'City of God, XI.6' },
  ],
  thread: [
    { anchor: 'Gen 1:1', target: 'John 1:1', direction: 'forward', type: 'echo', text: 'Creation language reused.' },
  ],
  ppl: [
    { name: 'Moses', role: 'Lawgiver', text: 'Led Israel out of Egypt.' },
  ],
  hebtext: [
    { word: '\u05D1\u05E8\u05D0', tlit: 'bara', gloss: 'created', note: 'Divine creative act.' },
  ],
  tx: [
    { ref: 'Gen 1:1', title: 'Variant', content: 'LXX reads differently.', note: 'Minor difference.' },
  ],
  debate: [
    { topic: 'Age of Earth', positions: [{ scholar: 'mac', position: 'Young earth' }, { scholar: 'calvin', position: 'Framework view' }] },
  ],
  discourse: {
    thesis: 'God is the creator of all things.',
    nodes: [
      { id: 'n1', type: 'premise' as const, verse_range: 'v.1', text: 'In the beginning God created.' },
    ],
  },
  commentary: [
    { ref: 'v. 1', note: 'This is the first verse of Scripture.' },
  ],
  lit: {
    rows: [
      { label: 'A', range: 'vv.1-5', text: 'Creation prologue', is_key: true },
    ],
    note: 'Chiastic structure',
  },
  themes: {
    scores: [
      { name: 'Creation', value: 9 },
      { name: 'Covenant', value: 3 },
      { name: 'Redemption', value: 5 },
    ],
    note: 'Strong creation emphasis.',
  },
  trans: {
    title: 'Genesis 1:1',
    rows: [
      { verse_ref: 'Gen 1:1', translations: [{ version: 'NIV', text: 'In the beginning...' }, { version: 'ESV', text: 'In the beginning...' }] },
    ],
  },
};

// ── Parameterized tests: array-based panels ────────────────────────

describe('Array-based panels render with sample data and empty data', () => {
  const arrayPanels: {
    name: string;
    Component: React.ComponentType<any>;
    sampleProps: Record<string, any>;
    emptyProps: Record<string, any>;
  }[] = [
    {
      name: 'HebrewPanel (heb)',
      Component: HebrewPanel,
      sampleProps: { entries: sampleData.heb },
      emptyProps: { entries: [] },
    },
    {
      name: 'CrossRefPanel (cross)',
      Component: CrossRefPanel,
      sampleProps: { entries: sampleData.cross },
      emptyProps: { entries: [] },
    },
    {
      name: 'PlacesPanel (poi/places)',
      Component: PlacesPanel,
      sampleProps: { entries: sampleData.poi },
      emptyProps: { entries: [] },
    },
    {
      name: 'TimelinePanel (tl)',
      Component: TimelinePanel,
      sampleProps: { events: sampleData.tl },
      emptyProps: { events: [] },
    },
    {
      name: 'SourcesPanel (src)',
      Component: SourcesPanel,
      sampleProps: { entries: sampleData.src },
      emptyProps: { entries: [] },
    },
    {
      name: 'ReceptionPanel (rec)',
      Component: ReceptionPanel,
      sampleProps: { entries: sampleData.rec },
      emptyProps: { entries: [] },
    },
    {
      name: 'ThreadingPanel (thread)',
      Component: ThreadingPanel,
      sampleProps: { entries: sampleData.thread },
      emptyProps: { entries: [] },
    },
    {
      name: 'PeoplePanel (ppl)',
      Component: PeoplePanel,
      sampleProps: { entries: sampleData.ppl },
      emptyProps: { entries: [] },
    },
    {
      name: 'HebrewReadingPanel (hebtext)',
      Component: HebrewReadingPanel,
      sampleProps: { entries: sampleData.hebtext },
      emptyProps: { entries: [] },
    },
    {
      name: 'TextualPanel (tx)',
      Component: TextualPanel,
      sampleProps: { entries: sampleData.tx },
      emptyProps: { entries: [] },
    },
    {
      name: 'DebatePanel (debate)',
      Component: DebatePanel,
      sampleProps: { entries: sampleData.debate },
      emptyProps: { entries: [] },
    },
  ];

  describe.each(arrayPanels)('$name', ({ Component, sampleProps, emptyProps }) => {
    it('renders with sample data without crashing', () => {
      const { toJSON } = renderWithProviders(<Component {...sampleProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with empty array without crashing', () => {
      // Should not throw — may return null or empty container
      expect(() => renderWithProviders(<Component {...emptyProps} />)).not.toThrow();
    });
  });
});

// ── Object-data panels ─────────────────────────────────────────────

describe('Object-data panels render with sample data', () => {
  it('DiscoursePanel renders with sample data', () => {
    const { getByText } = renderWithProviders(
      <DiscoursePanel data={sampleData.discourse} />,
    );
    expect(getByText('MAIN THESIS')).toBeTruthy();
    expect(getByText(/God is the creator/)).toBeTruthy();
  });

  it('DiscoursePanel handles missing data gracefully', () => {
    const { getByText } = renderWithProviders(
      <DiscoursePanel data={{ thesis: '', nodes: [] } as any} />,
    );
    // Empty nodes = still renders without crash
    expect(getByText).toBeDefined();
  });

  it('LiteraryStructurePanel renders with sample data', () => {
    const { getByText } = renderWithProviders(
      <LiteraryStructurePanel data={sampleData.lit} />,
    );
    expect(getByText(/Creation prologue/)).toBeTruthy();
  });

  it('ThemesRadarPanel renders with sample data', () => {
    const { toJSON } = renderWithProviders(
      <ThemesRadarPanel data={sampleData.themes} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('ThemesRadarPanel returns null with empty scores', () => {
    const { toJSON } = renderWithProviders(
      <ThemesRadarPanel data={{ scores: [], note: '' }} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('TranslationPanel renders with sample data', () => {
    const { toJSON } = renderWithProviders(
      <TranslationPanel data={sampleData.trans} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('CommentaryPanel renders as scholar panel', () => {
    const { getByText } = renderWithProviders(
      <CommentaryPanel notes={sampleData.commentary} scholarId="sarna" />,
    );
    expect(getByText('v. 1')).toBeTruthy();
    expect(getByText(/first verse of Scripture/)).toBeTruthy();
  });
});

// ── PanelRenderer integration tests ────────────────────────────────

describe('PanelRenderer dispatches to correct panel', () => {
  const panelRendererCases = [
    { type: 'heb', json: JSON.stringify(sampleData.heb) },
    { type: 'cross', json: JSON.stringify(sampleData.cross) },
    { type: 'poi', json: JSON.stringify(sampleData.poi) },
    { type: 'tl', json: JSON.stringify(sampleData.tl) },
    { type: 'src', json: JSON.stringify(sampleData.src) },
    { type: 'rec', json: JSON.stringify(sampleData.rec) },
    { type: 'thread', json: JSON.stringify(sampleData.thread) },
    { type: 'ppl', json: JSON.stringify(sampleData.ppl) },
    { type: 'hebtext', json: JSON.stringify(sampleData.hebtext) },
    { type: 'tx', json: JSON.stringify(sampleData.tx) },
    { type: 'debate', json: JSON.stringify(sampleData.debate) },
    { type: 'discourse', json: JSON.stringify(sampleData.discourse) },
  ];

  it.each(panelRendererCases)(
    'renders $type panel via PanelRenderer without crashing',
    ({ type, json }) => {
      expect(() =>
        renderWithProviders(<PanelRenderer panelType={type} contentJson={json} />),
      ).not.toThrow();
    },
  );

  it('PanelRenderer falls back to CommentaryPanel for scholar types', () => {
    const json = JSON.stringify({ notes: sampleData.commentary });
    const { getByText } = renderWithProviders(
      <PanelRenderer panelType="mac" contentJson={json} />,
    );
    expect(getByText('v. 1')).toBeTruthy();
  });

  it('PanelRenderer shows error message for invalid JSON', () => {
    const { getByText } = renderWithProviders(
      <PanelRenderer panelType="heb" contentJson="{bad json" />,
    );
    expect(getByText('Unable to load panel content.')).toBeTruthy();
  });
});
