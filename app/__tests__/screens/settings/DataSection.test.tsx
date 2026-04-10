import React from 'react';
import { Alert } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { DataSection } from '@/screens/settings/DataSection';
import { buildPalette } from '@/theme/palettes';

jest.mock('@/db/userDatabase', () => require('../../helpers/mockUserDb').mockUserDatabaseModule());

jest.mock('@/db/userMutations', () => ({
  resetToNewUser: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/utils/exportData', () => ({
  exportStudyData: jest.fn().mockResolvedValue(undefined),
  ExportError: class ExportError extends Error {},
}));

// Mock SectionLabel
jest.mock('@/screens/settings/SectionLabel', () => ({
  SectionLabel: ({ text }: { text: string }) => {
    const RN = require('react-native');
    return <RN.Text>{text}</RN.Text>;
  },
}));

// Mock styles
jest.mock('@/screens/settings/styles', () => ({
  sharedStyles: {
    section: {},
    rowLabel: {},
    translationHint: {},
  },
}));

const base = buildPalette('dark').base;

describe('DataSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<DataSection base={base} />);
    }).not.toThrow();
  });

  it('shows DATA section label', () => {
    const { getByText } = renderWithProviders(<DataSection base={base} />);
    expect(getByText('DATA')).toBeTruthy();
  });

  it('shows export button', () => {
    const { getByText } = renderWithProviders(<DataSection base={base} />);
    expect(getByText('Export Study Data')).toBeTruthy();
  });

  it('shows export hint', () => {
    const { getByText } = renderWithProviders(<DataSection base={base} />);
    expect(getByText(/Notes, bookmarks, and highlights/)).toBeTruthy();
  });

  it('shows destructive action buttons', () => {
    const { getByText } = renderWithProviders(<DataSection base={base} />);
    expect(getByText('Clear Reading History')).toBeTruthy();
    expect(getByText('Clear All Notes')).toBeTruthy();
    expect(getByText('Clear All Bookmarks')).toBeTruthy();
    expect(getByText('Reset to New User (Dev)')).toBeTruthy();
  });

  it('calls exportStudyData on export press', async () => {
    const { exportStudyData } = require('@/utils/exportData');
    const { getByText } = renderWithProviders(<DataSection base={base} />);

    fireEvent.press(getByText('Export Study Data'));

    // Wait for async export
    await new Promise((r) => setTimeout(r, 10));
    expect(exportStudyData).toHaveBeenCalled();
  });

  it('shows Alert when Clear Reading History is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = renderWithProviders(<DataSection base={base} />);

    fireEvent.press(getByText('Clear Reading History'));
    expect(alertSpy).toHaveBeenCalledWith('Clear Reading History', expect.any(String), expect.any(Array));
    alertSpy.mockRestore();
  });

  it('shows Alert when Clear All Notes is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = renderWithProviders(<DataSection base={base} />);

    fireEvent.press(getByText('Clear All Notes'));
    expect(alertSpy).toHaveBeenCalledWith('Clear All Notes', expect.any(String), expect.any(Array));
    alertSpy.mockRestore();
  });

  it('shows Alert when Reset to New User is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = renderWithProviders(<DataSection base={base} />);

    fireEvent.press(getByText('Reset to New User (Dev)'));
    expect(alertSpy).toHaveBeenCalledWith('Reset to New User?', expect.any(String), expect.any(Array));
    alertSpy.mockRestore();
  });
});
