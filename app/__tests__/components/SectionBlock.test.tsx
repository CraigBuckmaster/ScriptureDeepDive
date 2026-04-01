/**
 * SectionBlock.test.tsx — Tests for the section block component.
 */

import React from 'react';
import { Text } from 'react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { SectionBlock } from '@/components/SectionBlock';
import type { Section, SectionPanel, Verse } from '@/types';

const section: Section = {
  id: 'sec-1',
  chapter_id: 'ch-1',
  section_num: 1,
  header: 'The Beginning',
  verse_start: 1,
  verse_end: 5,
};

const verses: Verse[] = [
  { id: 1, book_id: 'gen', chapter_num: 1, verse_num: 1, translation: 'esv', text: 'In the beginning God created.' },
  { id: 2, book_id: 'gen', chapter_num: 1, verse_num: 2, translation: 'esv', text: 'The earth was formless.' },
  { id: 3, book_id: 'gen', chapter_num: 1, verse_num: 6, translation: 'esv', text: 'Let there be an expanse.' },
];

const panels: SectionPanel[] = [
  { id: 1, section_id: 'sec-1', panel_type: 'heb', content_json: '[]' },
];

const baseProps = {
  section,
  panels,
  verses,
  vhlGroups: [],
  notedVerses: new Set<number>(),
  activePanel: null,
  onPanelToggle: jest.fn(),
};

describe('SectionBlock', () => {
  it('renders the section header text', () => {
    const { getByText } = renderWithProviders(<SectionBlock {...baseProps} />);
    expect(getByText('The Beginning')).toBeTruthy();
  });

  it('filters verses to the section range (verse_start to verse_end)', () => {
    const { getByText, queryByText } = renderWithProviders(<SectionBlock {...baseProps} />);
    // Verses 1 and 2 are in range [1,5]
    expect(getByText(/In the beginning/)).toBeTruthy();
    expect(getByText(/formless/)).toBeTruthy();
    // Verse 6 is outside range
    expect(queryByText(/expanse/)).toBeNull();
  });

  it('renders button row via render prop', () => {
    const renderButtonRow = jest.fn(() => <Text>BUTTON_ROW</Text>);
    const { getByText } = renderWithProviders(
      <SectionBlock {...baseProps} renderButtonRow={renderButtonRow} />,
    );
    expect(getByText('BUTTON_ROW')).toBeTruthy();
    expect(renderButtonRow).toHaveBeenCalledWith(panels, 'sec-1');
  });

  it('renders active panel via render prop when panel is active', () => {
    const renderPanel = jest.fn(() => <Text>ACTIVE_PANEL</Text>);
    const active = { sectionId: 'sec-1', panelType: 'heb' };
    const { getByText } = renderWithProviders(
      <SectionBlock {...baseProps} activePanel={active} renderPanel={renderPanel} />,
    );
    expect(getByText('ACTIVE_PANEL')).toBeTruthy();
  });

  it('does not render panel content when no panel is active', () => {
    const renderPanel = jest.fn(() => <Text>ACTIVE_PANEL</Text>);
    const { queryByText } = renderWithProviders(
      <SectionBlock {...baseProps} activePanel={null} renderPanel={renderPanel} />,
    );
    expect(queryByText('ACTIVE_PANEL')).toBeNull();
    expect(renderPanel).not.toHaveBeenCalled();
  });

  it('does not render panel for a different section', () => {
    const renderPanel = jest.fn(() => <Text>ACTIVE_PANEL</Text>);
    const active = { sectionId: 'sec-OTHER', panelType: 'heb' };
    const { queryByText } = renderWithProviders(
      <SectionBlock {...baseProps} activePanel={active} renderPanel={renderPanel} />,
    );
    expect(queryByText('ACTIVE_PANEL')).toBeNull();
  });
});
