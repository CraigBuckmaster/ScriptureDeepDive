import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { LexiconDefinition } from '@/components/LexiconDefinition';
import type { DefinitionNode } from '@/types/lexicon';

describe('LexiconDefinition', () => {
  it('renders short definition', () => {
    const { getByText } = renderWithProviders(
      <LexiconDefinition shortDef="love, goodwill" fullDef={[]} />,
    );
    expect(getByText('love, goodwill')).toBeTruthy();
  });

  it('renders numbered definitions', () => {
    const fullDef: DefinitionNode[] = [
      { num: '1', text: 'affection, good-will' },
      { num: '2', text: 'love feasts' },
    ];
    const { getByText } = renderWithProviders(
      <LexiconDefinition shortDef="love" fullDef={fullDef} />,
    );
    expect(getByText(/affection/)).toBeTruthy();
    expect(getByText(/love feasts/)).toBeTruthy();
  });

  it('renders nested sub-definitions', () => {
    const fullDef: DefinitionNode[] = [
      {
        num: '1',
        text: 'of man',
        subs: [
          { letter: 'a', text: 'kindness towards men' },
          { letter: 'b', text: 'kindness of God' },
        ],
      },
    ];
    const { getByText } = renderWithProviders(
      <LexiconDefinition shortDef="kindness" fullDef={fullDef} />,
    );
    expect(getByText(/kindness towards men/)).toBeTruthy();
    expect(getByText(/kindness of God/)).toBeTruthy();
  });

  it('handles empty full definition', () => {
    const { getByText, toJSON } = renderWithProviders(
      <LexiconDefinition shortDef="test" fullDef={[]} />,
    );
    expect(getByText('test')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });
});
