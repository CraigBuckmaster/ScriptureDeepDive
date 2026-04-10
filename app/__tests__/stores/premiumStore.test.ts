const mockGetPreference = jest.fn();
const mockSetPreference = jest.fn();

jest.mock('@/db/user', () => ({
  getPreference: (...args: any[]) => mockGetPreference(...args),
  setPreference: (...args: any[]) => mockSetPreference(...args),
}));

import { usePremiumStore } from '@/stores/premiumStore';

describe('premiumStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePremiumStore.setState({
      isPremium: false,
      purchaseType: null,
      expiresAt: null,
      isHydrated: false,
    });
    mockGetPreference.mockResolvedValue(null);
    mockSetPreference.mockResolvedValue(undefined);
  });

  it('has correct initial state', () => {
    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(false);
    expect(state.purchaseType).toBeNull();
    expect(state.expiresAt).toBeNull();
    expect(state.isHydrated).toBe(false);
  });

  it('hydrate() loads preferences and sets isPremium true for valid subscription', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    mockGetPreference
      .mockResolvedValueOnce('1')          // premium_status
      .mockResolvedValueOnce('annual')     // premium_purchase_type
      .mockResolvedValueOnce(futureDate);  // premium_expires_at

    await usePremiumStore.getState().hydrate();

    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(true);
    expect(state.purchaseType).toBe('annual');
    expect(state.expiresAt).toBe(futureDate);
    expect(state.isHydrated).toBe(true);
  });

  it('hydrate() clears premium for expired subscription', async () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    mockGetPreference
      .mockResolvedValueOnce('1')          // premium_status
      .mockResolvedValueOnce('monthly')    // premium_purchase_type
      .mockResolvedValueOnce(pastDate);    // premium_expires_at

    await usePremiumStore.getState().hydrate();

    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(false);
    expect(state.purchaseType).toBeNull();
    expect(state.expiresAt).toBeNull();
    expect(state.isHydrated).toBe(true);
    expect(mockSetPreference).toHaveBeenCalledWith('premium_status', '0');
  });

  it('hydrate() sets isHydrated true even on error', async () => {
    mockGetPreference.mockRejectedValue(new Error('DB error'));

    await usePremiumStore.getState().hydrate();

    expect(usePremiumStore.getState().isHydrated).toBe(true);
  });

  it('hydrate() sets isPremium false when status is not "1"', async () => {
    mockGetPreference
      .mockResolvedValueOnce('0')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await usePremiumStore.getState().hydrate();

    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(false);
    expect(state.isHydrated).toBe(true);
  });

  it('setPremiumStatus() updates state and persists', () => {
    const expiresAt = new Date(Date.now() + 86400000).toISOString();
    usePremiumStore.getState().setPremiumStatus(true, 'annual', expiresAt);

    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(true);
    expect(state.purchaseType).toBe('annual');
    expect(state.expiresAt).toBe(expiresAt);
    expect(mockSetPreference).toHaveBeenCalledWith('premium_status', '1');
    expect(mockSetPreference).toHaveBeenCalledWith('premium_purchase_type', 'annual');
    expect(mockSetPreference).toHaveBeenCalledWith('premium_expires_at', expiresAt);
  });

  it('clearPremium() resets state', () => {
    usePremiumStore.setState({ isPremium: true, purchaseType: 'annual', expiresAt: '2030-01-01' });

    usePremiumStore.getState().clearPremium();

    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(false);
    expect(state.purchaseType).toBeNull();
    expect(state.expiresAt).toBeNull();
    expect(mockSetPreference).toHaveBeenCalledWith('premium_status', '0');
    expect(mockSetPreference).toHaveBeenCalledWith('premium_purchase_type', '');
    expect(mockSetPreference).toHaveBeenCalledWith('premium_expires_at', '');
  });

  it('lifetime subscriptions have null expiresAt', async () => {
    mockGetPreference
      .mockResolvedValueOnce('1')          // premium_status
      .mockResolvedValueOnce('lifetime')   // premium_purchase_type
      .mockResolvedValueOnce(null);        // premium_expires_at

    await usePremiumStore.getState().hydrate();

    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(true);
    expect(state.purchaseType).toBe('lifetime');
    expect(state.expiresAt).toBeNull();
  });

  it('lifetime subscriptions do not expire even with past expiresAt', async () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    mockGetPreference
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce('lifetime')
      .mockResolvedValueOnce(pastDate);

    await usePremiumStore.getState().hydrate();

    // lifetime should not be cleared even with past date
    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(true);
    expect(state.purchaseType).toBe('lifetime');
  });

  it('setPremiumStatus(false, null, null) clears premium via setter', () => {
    usePremiumStore.setState({ isPremium: true, purchaseType: 'monthly' });

    usePremiumStore.getState().setPremiumStatus(false, null, null);

    expect(usePremiumStore.getState().isPremium).toBe(false);
    expect(mockSetPreference).toHaveBeenCalledWith('premium_status', '0');
    expect(mockSetPreference).toHaveBeenCalledWith('premium_purchase_type', '');
    expect(mockSetPreference).toHaveBeenCalledWith('premium_expires_at', '');
  });

  it('hydrate() handles null preference values gracefully', async () => {
    mockGetPreference.mockResolvedValue(null);

    await usePremiumStore.getState().hydrate();

    const state = usePremiumStore.getState();
    expect(state.isPremium).toBe(false);
    expect(state.purchaseType).toBeNull();
    expect(state.expiresAt).toBeNull();
    expect(state.isHydrated).toBe(true);
  });
});
