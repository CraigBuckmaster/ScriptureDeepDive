/**
 * hooks/useMySubmissions.ts — Current user's submissions.
 */

import { useAsyncData } from './useAsyncData';
import { useAuthStore } from '../stores';
import { getSupabase } from '../lib/supabase';
import type { Submission } from '../types';

async function fetchMySubmissions(userId: string): Promise<Submission[]> {
  const supabase = getSupabase();
  if (!supabase || !userId) return [];

  try {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    return (data ?? []) as Submission[];
  } catch {
    return [];
  }
}

export function useMySubmissions() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';

  const { data: submissions, loading, error, reload } = useAsyncData(
    () => fetchMySubmissions(userId),
    [userId],
    [] as Submission[],
  );

  return { submissions, loading, error, reload };
}
