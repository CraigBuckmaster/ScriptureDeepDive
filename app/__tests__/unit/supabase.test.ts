jest.unmock('@/lib/supabase');

import { isSupabaseAvailable, getSupabase } from '@/lib/supabase';

describe('supabase', () => {
  it('isSupabaseAvailable returns false when CONFIGURED is false', () => {
    expect(isSupabaseAvailable()).toBe(false);
  });

  it('getSupabase returns null when not configured', () => {
    expect(getSupabase()).toBeNull();
  });

  it('isSupabaseAvailable returns a boolean', () => {
    const result = isSupabaseAvailable();
    expect(typeof result).toBe('boolean');
  });

  it('getSupabase returns null on repeated calls when not configured', () => {
    expect(getSupabase()).toBeNull();
    expect(getSupabase()).toBeNull();
  });
});
