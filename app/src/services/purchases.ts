/**
 * services/purchases.ts — RevenueCat SDK wrapper for Companion+ subscriptions.
 *
 * Products:
 *   companion_plus_monthly  — $4.99/mo auto-renewing
 *   companion_plus_annual   — $39.99/yr auto-renewing
 *   companion_plus_lifetime — $149.99 one-time
 *
 * RevenueCat handles receipt validation, cross-platform status, and analytics.
 * Free until $2.5K MRR, then 1%.
 *
 * NOTE: Until `react-native-purchases` is installed, all functions are
 * no-ops that log warnings. This lets the store/UI infrastructure be
 * built and tested before the native SDK is linked.
 */

import { usePremiumStore, type PurchaseType } from '../stores/premiumStore';
import { logger } from '../utils/logger';

// ── Product IDs ─────────────────────────────────────────────────────

export const PRODUCT_IDS = {
  monthly: 'companion_plus_monthly',
  annual: 'companion_plus_annual',
  lifetime: 'companion_plus_lifetime',
} as const;

export interface PlanInfo {
  id: PurchaseType;
  productId: string;
  label: string;
  price: string;
  detail: string;
}

export const PLANS: PlanInfo[] = [
  { id: 'monthly', productId: PRODUCT_IDS.monthly, label: 'Monthly', price: '$4.99', detail: '/month' },
  { id: 'annual', productId: PRODUCT_IDS.annual, label: 'Annual', price: '$39.99', detail: '/year · save 33%' },
  { id: 'lifetime', productId: PRODUCT_IDS.lifetime, label: 'Lifetime', price: '$149.99', detail: 'one-time' },
];

// ── SDK availability check ──────────────────────────────────────────

let Purchases: any = null;

function getSDK(): any {
  if (Purchases) return Purchases;
  try {
    Purchases = require('react-native-purchases').default;
    return Purchases;
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Initialize RevenueCat. Call once on app start (e.g. in App.tsx after fonts load).
 * Pass the RevenueCat API key from your dashboard.
 */
export async function initializePurchases(apiKey: string): Promise<void> {
  const sdk = getSDK();
  if (!sdk) {
    logger.warn('purchases', 'react-native-purchases not installed — running in stub mode');
    return;
  }
  try {
    await sdk.configure({ apiKey });
    logger.info('purchases', 'RevenueCat configured');
    await syncPremiumStatus();
  } catch (err) {
    logger.error('purchases', 'Failed to configure RevenueCat', err);
  }
}

/**
 * Purchase a plan. Returns true on success, false on cancel/error.
 */
export async function purchasePlan(plan: PlanInfo): Promise<boolean> {
  const sdk = getSDK();
  if (!sdk) {
    logger.warn('purchases', `Stub mode: would purchase ${plan.productId}`);
    // In dev/stub mode, simulate a successful purchase
    const store = usePremiumStore.getState();
    store.setPremiumStatus(true, plan.id, plan.id === 'lifetime' ? null : getFutureDate(plan.id));
    return true;
  }

  try {
    const offerings = await sdk.getOfferings();
    const pkg = offerings?.current?.availablePackages?.find(
      (p: any) => p.product?.identifier === plan.productId
    );
    if (!pkg) {
      logger.error('purchases', `Package not found: ${plan.productId}`);
      return false;
    }

    const { customerInfo } = await sdk.purchasePackage(pkg);
    return applyCustomerInfo(customerInfo);
  } catch (err: any) {
    if (err?.userCancelled) return false;
    logger.error('purchases', `Purchase failed: ${plan.productId}`, err);
    return false;
  }
}

/**
 * Restore previous purchases (required by App Store guidelines).
 */
export async function restorePurchases(): Promise<boolean> {
  const sdk = getSDK();
  if (!sdk) {
    logger.warn('purchases', 'Stub mode: restore purchases no-op');
    return false;
  }

  try {
    const customerInfo = await sdk.restorePurchases();
    return applyCustomerInfo(customerInfo);
  } catch (err) {
    logger.error('purchases', 'Restore failed', err);
    return false;
  }
}

/**
 * Sync premium status from RevenueCat → premiumStore.
 * Called on app start and after any purchase/restore.
 */
export async function syncPremiumStatus(): Promise<void> {
  const sdk = getSDK();
  if (!sdk) return;

  try {
    const customerInfo = await sdk.getCustomerInfo();
    applyCustomerInfo(customerInfo);
  } catch (err) {
    logger.error('purchases', 'Failed to sync premium status', err);
  }
}

// ── Internal helpers ────────────────────────────────────────────────

const ENTITLEMENT_ID = 'companion_plus';

function applyCustomerInfo(customerInfo: any): boolean {
  const entitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
  const store = usePremiumStore.getState();

  if (entitlement) {
    const productId = entitlement.productIdentifier ?? '';
    let purchaseType: PurchaseType = null;
    if (productId.includes('monthly')) purchaseType = 'monthly';
    else if (productId.includes('annual')) purchaseType = 'annual';
    else if (productId.includes('lifetime')) purchaseType = 'lifetime';

    const expiresAt = purchaseType === 'lifetime' ? null : (entitlement.expirationDate ?? null);
    store.setPremiumStatus(true, purchaseType, expiresAt);
    return true;
  } else {
    store.clearPremium();
    return false;
  }
}

function getFutureDate(plan: PurchaseType): string {
  const now = new Date();
  if (plan === 'monthly') now.setMonth(now.getMonth() + 1);
  else if (plan === 'annual') now.setFullYear(now.getFullYear() + 1);
  return now.toISOString();
}
