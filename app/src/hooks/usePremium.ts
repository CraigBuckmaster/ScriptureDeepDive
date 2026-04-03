/**
 * hooks/usePremium.ts — Convenience hook for premium gate checks.
 *
 * Usage:
 *   const { isPremium, showUpgrade } = usePremium();
 *   if (!isPremium) { showUpgrade('feature', 'Interlinear Hebrew & Greek'); return; }
 */

import { useState, useCallback } from 'react';
import { usePremiumStore } from '../stores/premiumStore';

export type UpgradeVariant = 'feature' | 'personal' | 'explore';

interface UpgradeRequest {
  variant: UpgradeVariant;
  featureName: string;
}

export function usePremium() {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [upgradeRequest, setUpgradeRequest] = useState<UpgradeRequest | null>(null);

  const showUpgrade = useCallback((variant: UpgradeVariant, featureName: string) => {
    setUpgradeRequest({ variant, featureName });
  }, []);

  const dismissUpgrade = useCallback(() => {
    setUpgradeRequest(null);
  }, []);

  return {
    isPremium,
    upgradeRequest,
    showUpgrade,
    dismissUpgrade,
  };
}
