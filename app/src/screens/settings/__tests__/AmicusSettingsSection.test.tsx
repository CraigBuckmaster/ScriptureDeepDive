import React from 'react';
import { Alert } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { AmicusSettingsSection } from '@/screens/settings/AmicusSettingsSection';
import { getMockUserDb, resetMockUserDb } from '../../../../__tests__/helpers/mockUserDb';

jest.mock('@/db/userDatabase', () =>
  require('../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

const base = {
  bg: '#000',
  bgElevated: '#111',
  bgSurface: '#222',
  bg3: '#333',
  text: '#fff',
  textDim: '#aaa',
  textMuted: '#888',
  gold: '#bfa050',
  goldDim: '#887030',
  goldBright: '#ffd780',
  border: '#444',
  borderLight: '#555',
  verseNum: '#999',
  navText: '#fff',
  danger: '#c00',
  success: '#0c0',
  redLetter: '#c33',
  tintWarm: '#333',
  tintEmber: '#333',
  tintParchment: '#333',
  tintDusk: '#333',
} as const;

beforeEach(() => {
  resetMockUserDb();
});

describe('AmicusSettingsSection', () => {
  it('fires setAmicusEnabled on toggle', () => {
    const setAmicusEnabled = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <AmicusSettingsSection
        base={base}
        amicusEnabled={true}
        setAmicusEnabled={setAmicusEnabled}
        onInspectProfile={() => undefined}
      />,
    );
    fireEvent(getByLabelText('Enable Amicus'), 'valueChange', false);
    expect(setAmicusEnabled).toHaveBeenCalledWith(false);
  });

  it('navigates to the profile inspector', () => {
    const onInspectProfile = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <AmicusSettingsSection
        base={base}
        amicusEnabled={true}
        setAmicusEnabled={() => undefined}
        onInspectProfile={onInspectProfile}
      />,
    );
    fireEvent.press(getByLabelText('Show My Amicus Profile'));
    expect(onInspectProfile).toHaveBeenCalledTimes(1);
  });

  it('shows confirmation when clearing history and calls DB on confirm', async () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _body, buttons) => {
        const destructive = buttons?.find((b) => b.style === 'destructive');
        destructive?.onPress?.();
      });

    const { getByLabelText } = renderWithProviders(
      <AmicusSettingsSection
        base={base}
        amicusEnabled={true}
        setAmicusEnabled={() => undefined}
        onInspectProfile={() => undefined}
      />,
    );
    fireEvent.press(getByLabelText('Clear Amicus History'));
    expect(alertSpy).toHaveBeenCalled();
    // Allow pending microtasks (the destructive onPress is async).
    await new Promise((r) => setTimeout(r, 0));
    const calls = getMockUserDb().runAsync.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(calls.some((s) => s.includes('DELETE FROM amicus_threads'))).toBe(true);
    alertSpy.mockRestore();
  });

  it('resets the privacy notice by writing empty string', async () => {
    const { getByLabelText } = renderWithProviders(
      <AmicusSettingsSection
        base={base}
        amicusEnabled={true}
        setAmicusEnabled={() => undefined}
        onInspectProfile={() => undefined}
      />,
    );
    fireEvent.press(getByLabelText('Reset Privacy Notice'));
    await new Promise((r) => setTimeout(r, 0));
    const calls = getMockUserDb().runAsync.mock.calls;
    const optInWrite = calls.find(
      (c: unknown[]) =>
        typeof c[0] === 'string' && c[0].includes('user_preferences'),
    );
    expect(optInWrite).toBeTruthy();
  });
});
