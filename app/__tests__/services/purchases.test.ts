/**
 * __tests__/services/purchases.test.ts
 *
 * Tests for the RevenueCat purchases service: initialization,
 * purchasing plans, restoring purchases, and premium status sync.
 */

// Mock the SDK before importing the service (dynamic require inside getSDK)
const mockSDK = {
  configure: jest.fn().mockResolvedValue(undefined),
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  getCustomerInfo: jest.fn(),
};
jest.mock('react-native-purchases', () => ({ default: mockSDK }), { virtual: true });

// Mock premium store
const mockSetPremiumStatus = jest.fn();
const mockClearPremium = jest.fn();
jest.mock('@/stores/premiumStore', () => ({
  usePremiumStore: {
    getState: () => ({
      setPremiumStatus: mockSetPremiumStatus,
      clearPremium: mockClearPremium,
    }),
  },
}));

import {
  initializePurchases,
  purchasePlan,
  restorePurchases,
  syncPremiumStatus,
  PLANS,
} from '@/services/purchases';

describe('purchases service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-enable the SDK mock (tests that need stub mode will override)
    jest.mock('react-native-purchases', () => ({ default: mockSDK }), { virtual: true });
  });

  // ── initializePurchases ────────────────────────────────────────

  describe('initializePurchases', () => {
    it('configures SDK and syncs status', async () => {
      mockSDK.getCustomerInfo.mockResolvedValue({
        entitlements: { active: {} },
      });
      await initializePurchases('rc_api_key');
      expect(mockSDK.configure).toHaveBeenCalledWith({ apiKey: 'rc_api_key' });
      // syncPremiumStatus is called after configure
      expect(mockSDK.getCustomerInfo).toHaveBeenCalled();
    });

    it('logs warning when SDK unavailable', async () => {
      // Temporarily make getSDK return null by having require throw
      jest.resetModules();
      jest.doMock('react-native-purchases', () => {
        throw new Error('not installed');
      });
      jest.doMock('@/stores/premiumStore', () => ({
        usePremiumStore: {
          getState: () => ({
            setPremiumStatus: mockSetPremiumStatus,
            clearPremium: mockClearPremium,
          }),
        },
      }));

      const { initializePurchases: initFresh } = require('@/services/purchases');
      await initFresh('key');
      // Should not throw, just log and return
      expect(mockSDK.configure).not.toHaveBeenCalled();
    });
  });

  // ── purchasePlan ───────────────────────────────────────────────

  describe('purchasePlan', () => {
    const monthlyPlan = PLANS[0]; // monthly
    const lifetimePlan = PLANS[2]; // lifetime

    it('returns true on success and sets premium status', async () => {
      const mockPkg = { product: { identifier: 'companion_plus_monthly' } };
      mockSDK.getOfferings.mockResolvedValue({
        current: { availablePackages: [mockPkg] },
      });
      mockSDK.purchasePackage.mockResolvedValue({
        customerInfo: {
          entitlements: {
            active: {
              companion_plus: {
                productIdentifier: 'companion_plus_monthly',
                expirationDate: '2026-05-10T00:00:00Z',
              },
            },
          },
        },
      });

      const result = await purchasePlan(monthlyPlan);
      expect(result).toBe(true);
      expect(mockSetPremiumStatus).toHaveBeenCalledWith(
        true,
        'monthly',
        '2026-05-10T00:00:00Z',
      );
    });

    it('returns false when package not found', async () => {
      mockSDK.getOfferings.mockResolvedValue({
        current: { availablePackages: [] },
      });
      const result = await purchasePlan(monthlyPlan);
      expect(result).toBe(false);
    });

    it('returns false when user cancels', async () => {
      const mockPkg = { product: { identifier: 'companion_plus_monthly' } };
      mockSDK.getOfferings.mockResolvedValue({
        current: { availablePackages: [mockPkg] },
      });
      mockSDK.purchasePackage.mockRejectedValue({ userCancelled: true });

      const result = await purchasePlan(monthlyPlan);
      expect(result).toBe(false);
    });

    it('simulates purchase in stub mode (no SDK)', async () => {
      jest.resetModules();
      jest.doMock('react-native-purchases', () => {
        throw new Error('not installed');
      });
      const mockSetStatus = jest.fn();
      jest.doMock('@/stores/premiumStore', () => ({
        usePremiumStore: {
          getState: () => ({
            setPremiumStatus: mockSetStatus,
            clearPremium: jest.fn(),
          }),
        },
      }));

      const { purchasePlan: purchaseFresh, PLANS: plans } = require('@/services/purchases');
      const result = await purchaseFresh(plans[0]);
      expect(result).toBe(true);
      expect(mockSetStatus).toHaveBeenCalledWith(true, 'monthly', expect.any(String));
    });

    it('sets lifetime with null expiresAt via applyCustomerInfo', async () => {
      const mockPkg = { product: { identifier: 'companion_plus_lifetime' } };
      mockSDK.getOfferings.mockResolvedValue({
        current: { availablePackages: [mockPkg] },
      });
      mockSDK.purchasePackage.mockResolvedValue({
        customerInfo: {
          entitlements: {
            active: {
              companion_plus: {
                productIdentifier: 'companion_plus_lifetime',
              },
            },
          },
        },
      });

      const result = await purchasePlan(lifetimePlan);
      expect(result).toBe(true);
      expect(mockSetPremiumStatus).toHaveBeenCalledWith(true, 'lifetime', null);
    });
  });

  // ── restorePurchases ───────────────────────────────────────────

  describe('restorePurchases', () => {
    it('returns true when entitlement is active', async () => {
      mockSDK.restorePurchases.mockResolvedValue({
        entitlements: {
          active: {
            companion_plus: {
              productIdentifier: 'companion_plus_annual',
              expirationDate: '2027-01-01T00:00:00Z',
            },
          },
        },
      });

      const result = await restorePurchases();
      expect(result).toBe(true);
      expect(mockSetPremiumStatus).toHaveBeenCalledWith(true, 'annual', '2027-01-01T00:00:00Z');
    });

    it('returns false when no active entitlement', async () => {
      mockSDK.restorePurchases.mockResolvedValue({
        entitlements: { active: {} },
      });

      const result = await restorePurchases();
      expect(result).toBe(false);
      expect(mockClearPremium).toHaveBeenCalled();
    });

    it('returns false on error', async () => {
      mockSDK.restorePurchases.mockRejectedValue(new Error('network fail'));
      const result = await restorePurchases();
      expect(result).toBe(false);
    });
  });

  // ── syncPremiumStatus ──────────────────────────────────────────

  describe('syncPremiumStatus', () => {
    it('does nothing when no SDK available', async () => {
      jest.resetModules();
      jest.doMock('react-native-purchases', () => {
        throw new Error('not installed');
      });
      jest.doMock('@/stores/premiumStore', () => ({
        usePremiumStore: {
          getState: () => ({
            setPremiumStatus: jest.fn(),
            clearPremium: jest.fn(),
          }),
        },
      }));

      const { syncPremiumStatus: syncFresh } = require('@/services/purchases');
      await syncFresh();
      expect(mockSDK.getCustomerInfo).not.toHaveBeenCalled();
    });

    it('syncs customer info when SDK is available', async () => {
      mockSDK.getCustomerInfo.mockResolvedValue({
        entitlements: {
          active: {
            companion_plus: {
              productIdentifier: 'companion_plus_monthly',
              expirationDate: '2026-06-01T00:00:00Z',
            },
          },
        },
      });

      await syncPremiumStatus();
      expect(mockSDK.getCustomerInfo).toHaveBeenCalled();
      expect(mockSetPremiumStatus).toHaveBeenCalled();
    });
  });
});
