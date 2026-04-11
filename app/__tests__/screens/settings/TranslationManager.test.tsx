import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { TranslationManager } from '@/screens/settings/TranslationManager';
import { buildPalette } from '@/theme/palettes';

jest.mock('@/db/translationRegistry', () => ({
  DOWNLOADABLE_TRANSLATIONS: [
    { id: 'esv', label: 'ESV', fullName: 'English Standard Version', sizeBytes: 5_000_000 },
    { id: 'asv', label: 'ASV', fullName: 'American Standard Version', sizeBytes: 3_000_000 },
  ],
}));

jest.mock('@/db/translationManager', () => ({
  isTranslationInstalled: jest.fn().mockResolvedValue(false),
  downloadTranslation: jest.fn().mockResolvedValue(undefined),
  deleteTranslation: jest.fn().mockResolvedValue(undefined),
  getInstalledSize: jest.fn().mockResolvedValue(5_000_000),
}));

jest.mock('@/screens/settings/SectionLabel', () => ({
  SectionLabel: ({ text }: { text: string }) => {
    const RN = require('react-native');
    return <RN.Text>{text}</RN.Text>;
  },
}));

jest.mock('@/screens/settings/styles', () => ({
  sharedStyles: {
    section: {},
    rowLabel: {},
    translationHint: {},
  },
}));

const base = buildPalette('dark').base;

describe('TranslationManager', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<TranslationManager base={base} />);
    }).not.toThrow();
  });

  it('shows TRANSLATIONS section label', () => {
    const { getByText } = renderWithProviders(<TranslationManager base={base} />);
    expect(getByText('TRANSLATIONS')).toBeTruthy();
  });

  it('shows hint text', () => {
    const { getByText } = renderWithProviders(<TranslationManager base={base} />);
    expect(getByText(/NIV and KJV are built in/)).toBeTruthy();
  });

  it('shows translation names', () => {
    const { getByText } = renderWithProviders(<TranslationManager base={base} />);
    expect(getByText('ESV')).toBeTruthy();
    expect(getByText('ASV')).toBeTruthy();
  });

  it('shows full names', () => {
    const { getByText } = renderWithProviders(<TranslationManager base={base} />);
    expect(getByText(/English Standard Version/)).toBeTruthy();
    expect(getByText(/American Standard Version/)).toBeTruthy();
  });
});
