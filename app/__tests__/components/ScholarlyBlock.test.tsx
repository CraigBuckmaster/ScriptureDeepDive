import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ScholarlyBlock } from '@/components/ScholarlyBlock';
import type { ChapterPanel } from '@/types';

const makePanels = (...types: string[]): ChapterPanel[] =>
  types.map((t) => ({
    id: t,
    panel_type: t,
    content_json: '{}',
  }));

describe('ScholarlyBlock', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(
      <ScholarlyBlock
        chapterPanels={makePanels('heb')}
        activePanel={null}
        onToggle={jest.fn()}
      />,
    );
    expect(getByText('CHAPTER ANALYSIS')).toBeTruthy();
  });

  it('returns null when chapterPanels is empty', () => {
    const { toJSON } = renderWithProviders(
      <ScholarlyBlock
        chapterPanels={[]}
        activePanel={null}
        onToggle={jest.fn()}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders the CHAPTER ANALYSIS divider label', () => {
    const { getByText } = renderWithProviders(
      <ScholarlyBlock
        chapterPanels={makePanels('heb', 'cross')}
        activePanel={null}
        onToggle={jest.fn()}
      />,
    );
    expect(getByText('CHAPTER ANALYSIS')).toBeTruthy();
  });

  it('passes onToggle through to ButtonRow', () => {
    const onToggle = jest.fn();
    const { getByText } = renderWithProviders(
      <ScholarlyBlock
        chapterPanels={makePanels('heb')}
        activePanel={null}
        onToggle={onToggle}
      />,
    );
    fireEvent.press(getByText('Hebrew'));
    expect(onToggle).toHaveBeenCalledWith('heb');
  });
});
