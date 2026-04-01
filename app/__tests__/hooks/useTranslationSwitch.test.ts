import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockSetTranslation = jest.fn();

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) => sel({ setTranslation: mockSetTranslation }),
}));

jest.mock('@/db/translationRegistry', () => ({
  isBundled: jest.fn((id: string) => id === 'kjv' || id === 'asv'),
}));

jest.mock('@/db/translationManager', () => ({
  isTranslationInstalled: jest.fn().mockResolvedValue(false),
  downloadTranslation: jest.fn().mockResolvedValue(undefined),
}));

import { useTranslationSwitch } from '@/hooks/useTranslationSwitch';
const { isBundled } = require('@/db/translationRegistry');
const { isTranslationInstalled, downloadTranslation } = require('@/db/translationManager');

jest.spyOn(Alert, 'alert');

describe('useTranslationSwitch', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns switchTranslation and downloading state', () => {
    const { result } = renderHook(() => useTranslationSwitch());
    expect(result.current.switchTranslation).toBeInstanceOf(Function);
    expect(result.current.downloading).toBe(false);
  });

  it('switches bundled translation instantly without download', async () => {
    const { result } = renderHook(() => useTranslationSwitch());
    await act(async () => {
      await result.current.switchTranslation('kjv');
    });
    expect(mockSetTranslation).toHaveBeenCalledWith('kjv');
    expect(isTranslationInstalled).not.toHaveBeenCalled();
    expect(downloadTranslation).not.toHaveBeenCalled();
  });

  it('switches to already-installed non-bundled translation without download', async () => {
    isBundled.mockReturnValueOnce(false);
    isTranslationInstalled.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useTranslationSwitch());
    await act(async () => {
      await result.current.switchTranslation('esv');
    });
    expect(mockSetTranslation).toHaveBeenCalledWith('esv');
    expect(downloadTranslation).not.toHaveBeenCalled();
  });

  it('downloads then switches for uninstalled non-bundled translation', async () => {
    isBundled.mockReturnValueOnce(false);
    isTranslationInstalled.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useTranslationSwitch());
    await act(async () => {
      await result.current.switchTranslation('esv');
    });
    expect(downloadTranslation).toHaveBeenCalledWith('esv');
    expect(mockSetTranslation).toHaveBeenCalledWith('esv');
  });

  it('shows alert and does not switch on download failure', async () => {
    isBundled.mockReturnValueOnce(false);
    isTranslationInstalled.mockResolvedValueOnce(false);
    downloadTranslation.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useTranslationSwitch());
    await act(async () => {
      await result.current.switchTranslation('esv');
    });
    expect(Alert.alert).toHaveBeenCalledWith('Download Failed', expect.any(String));
    expect(mockSetTranslation).not.toHaveBeenCalled();
  });

  it('sets downloading to false after completion', async () => {
    isBundled.mockReturnValueOnce(false);
    isTranslationInstalled.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useTranslationSwitch());
    await act(async () => {
      await result.current.switchTranslation('esv');
    });
    expect(result.current.downloading).toBe(false);
  });
});
