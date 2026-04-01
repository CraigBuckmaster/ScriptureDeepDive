/**
 * Tests for PanelRenderer array guards.
 *
 * Bug: PlacesPanel and other panels crashed with "entries.map is not
 * a function" when data was null/undefined.
 * Fix: Added Array.isArray() guards for all panel entries props.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Mock all panel sub-components to isolate PanelRenderer logic
jest.mock('@/components/panels/HebrewPanel', () => ({
  HebrewPanel: ({ entries }: any) => {
    // This will throw if entries is not iterable
    entries.forEach(() => {});
    return null;
  },
}));

jest.mock('@/components/panels/PlacesPanel', () => ({
  PlacesPanel: ({ entries }: any) => {
    entries.forEach(() => {});
    return null;
  },
}));

jest.mock('@/components/panels/CrossRefPanel', () => ({
  CrossRefPanel: ({ entries }: any) => {
    entries.forEach(() => {});
    return null;
  },
}));

jest.mock('@/components/panels/SourcesPanel', () => ({
  SourcesPanel: ({ entries }: any) => {
    entries.forEach(() => {});
    return null;
  },
}));

jest.mock('@/components/panels/ReceptionPanel', () => ({
  ReceptionPanel: ({ entries }: any) => {
    entries.forEach(() => {});
    return null;
  },
}));

jest.mock('@/components/panels/ThreadingPanel', () => ({
  ThreadingPanel: ({ entries }: any) => {
    entries.forEach(() => {});
    return null;
  },
}));

jest.mock('@/components/panels/PeoplePanel', () => ({
  PeoplePanel: ({ entries }: any) => {
    entries.forEach(() => {});
    return null;
  },
}));

jest.mock('@/components/panels/HebrewReadingPanel', () => ({
  HebrewReadingPanel: ({ entries }: any) => {
    entries.forEach(() => {});
    return null;
  },
}));

// Mock remaining panels that PanelRenderer imports
jest.mock('@/components/panels/CompositeContextPanel', () => ({ CompositeContextPanel: () => null }));
jest.mock('@/components/panels/CompositeConnectionsPanel', () => ({ CompositeConnectionsPanel: () => null }));
jest.mock('@/components/panels/TimelinePanel', () => ({ TimelinePanel: () => null }));
jest.mock('@/components/panels/LiteraryStructurePanel', () => ({ LiteraryStructurePanel: () => null }));
jest.mock('@/components/panels/ThemesRadarPanel', () => ({ ThemesRadarPanel: () => null }));
jest.mock('@/components/panels/TranslationPanel', () => ({ TranslationPanel: () => null }));
jest.mock('@/components/panels/CommentaryPanel', () => ({ CommentaryPanel: () => null }));
jest.mock('@/components/panels/TextualPanel', () => ({ TextualPanel: () => null }));
jest.mock('@/components/panels/EchoesView', () => ({ EchoesView: () => null }));
jest.mock('@/components/panels/ManuscriptStoriesView', () => ({ ManuscriptStoriesView: () => null }));
jest.mock('@/components/panels/DebatePanel', () => ({ DebatePanel: () => null }));
jest.mock('@/components/panels/ChiasmView', () => ({ ChiasmView: () => null }));

import { PanelRenderer } from '@/components/panels/PanelRenderer';

const panelTypesWithEntries = ['heb', 'places', 'cross', 'src', 'rec', 'thread', 'ppl', 'hebtext'];

describe('PanelRenderer array guards', () => {
  it.each(panelTypesWithEntries)(
    'does not crash when %s panel receives null data',
    (panelType) => {
      expect(() => {
        renderWithProviders(
          <PanelRenderer panelType={panelType} contentJson="null" scholarId="" />
        );
      }).not.toThrow();
    },
  );

  it.each(panelTypesWithEntries)(
    'does not crash when %s panel receives undefined (invalid JSON)',
    (panelType) => {
      expect(() => {
        renderWithProviders(
          <PanelRenderer panelType={panelType} contentJson="" scholarId="" />
        );
      }).not.toThrow();
    },
  );

  it.each(panelTypesWithEntries)(
    'does not crash when %s panel receives a non-array object',
    (panelType) => {
      expect(() => {
        renderWithProviders(
          <PanelRenderer panelType={panelType} contentJson='{"key": "value"}' scholarId="" />
        );
      }).not.toThrow();
    },
  );
});
