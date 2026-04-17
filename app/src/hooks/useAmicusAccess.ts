/**
 * hooks/useAmicusAccess.ts — Single-shot hook that combines entitlement,
 * settings toggle, monthly usage, and connectivity into one `canUse`
 * decision for every UI gate.
 */
import { useEffect, useState } from 'react';
import { getAmicusUsageThisMonth } from '../db/userQueries';
import { isConnected, onConnectivityChange } from '../services/connectivity';
import { useSettingsStore } from '../stores';
import { usePremiumStore } from '../stores/premiumStore';
import { logger } from '../utils/logger';

export type Entitlement = 'none' | 'premium' | 'partner_plus';

export type AmicusAccessReason =
  | 'ok'
  | 'not_premium'
  | 'monthly_cap_reached'
  | 'disabled_in_settings'
  | 'offline';

export interface AmicusAccessState {
  canUse: boolean;
  reason: AmicusAccessReason;
  entitlement: Entitlement;
  usage: {
    thisMonth: number;
    cap: number;
    remaining: number;
  };
}

export const AMICUS_CAPS: Record<Entitlement, number> = {
  none: 0,
  premium: 300,
  partner_plus: 1500,
};

export function useAmicusAccess(): AmicusAccessState {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const purchaseType = usePremiumStore((s) => s.purchaseType);
  const amicusEnabled = useSettingsStore((s) => s.amicusEnabled);

  const [usageThisMonth, setUsageThisMonth] = useState(0);
  const [online, setOnline] = useState(isConnected());

  // Derive entitlement. Partner+ is a tier introduced in #1472; for now,
  // treat any premium subscriber as `premium` (partner_plus is reserved
  // for a future `purchaseType === 'partner_plus'` sentinel).
  const entitlement: Entitlement = !isPremium
    ? 'none'
    : (purchaseType as unknown) === 'partner_plus'
      ? 'partner_plus'
      : 'premium';

  // Fetch monthly usage once per mount and refresh on entitlement changes.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const n = await getAmicusUsageThisMonth();
        if (!cancelled) setUsageThisMonth(n);
      } catch (err) {
        logger.warn('Amicus', 'usage fetch failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entitlement]);

  // Subscribe to connectivity changes.
  useEffect(() => {
    const unsub = onConnectivityChange((connected) => {
      setOnline(connected);
    });
    return unsub;
  }, []);

  const cap = AMICUS_CAPS[entitlement];
  const remaining = Math.max(0, cap - usageThisMonth);

  const reason = computeReason({
    entitlement,
    amicusEnabled,
    online,
    remaining,
  });

  return {
    canUse: reason === 'ok',
    reason,
    entitlement,
    usage: {
      thisMonth: usageThisMonth,
      cap,
      remaining,
    },
  };
}

interface ReasonArgs {
  entitlement: Entitlement;
  amicusEnabled: boolean;
  online: boolean;
  remaining: number;
}

export function computeReason(args: ReasonArgs): AmicusAccessReason {
  if (!args.amicusEnabled) return 'disabled_in_settings';
  if (args.entitlement === 'none') return 'not_premium';
  if (!args.online) return 'offline';
  if (args.remaining <= 0) return 'monthly_cap_reached';
  return 'ok';
}
