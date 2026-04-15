/**
 * hooks/useTrustLevel.ts — React hook for the current user's trust score.
 */

import { getUserTrustScore, TRUST_LABELS, type TrustScore } from '../services/trustLevel';
import { useAuthStore } from '../stores';
import { useAsyncData } from './useAsyncData';

const DEFAULT_TRUST: TrustScore = { level: 0, score: 0, label: TRUST_LABELS[0] };

export function useTrustLevel() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';

  const { data, loading, error, reload } = useAsyncData(
    () => (userId ? getUserTrustScore(userId) : Promise.resolve(DEFAULT_TRUST)),
    [userId],
    DEFAULT_TRUST,
  );

  return {
    trustScore: data,
    level: data.level,
    label: data.label,
    loading,
    error,
    reload,
  };
}
