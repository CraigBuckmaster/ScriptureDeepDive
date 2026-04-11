/**
 * Test helper — chainable Supabase client mock.
 *
 * Usage in tests:
 *   import { createMockSupabaseClient } from '../helpers/mockSupabaseClient';
 *   const mockClient = createMockSupabaseClient();
 *   jest.mock('@/lib/supabase', () => ({
 *     getSupabase: () => mockClient,
 *     isSupabaseAvailable: jest.fn().mockReturnValue(true),
 *   }));
 */

export interface MockSupabaseQuery {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  neq: jest.Mock;
  gt: jest.Mock;
  gte: jest.Mock;
  lt: jest.Mock;
  lte: jest.Mock;
  in: jest.Mock;
  is: jest.Mock;
  like: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
  range: jest.Mock;
  then: undefined;
  _resolveWith: (data: unknown, error?: unknown) => void;
}

export function createMockQuery(): MockSupabaseQuery {
  let resolvedData: unknown = null;
  let resolvedError: unknown = null;

  const query: Partial<MockSupabaseQuery> = {};

  // All chainable methods return the query itself
  const chainable = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'is', 'like',
    'order', 'limit', 'range',
  ];

  for (const method of chainable) {
    (query as any)[method] = jest.fn().mockReturnValue(query);
  }

  // Terminal methods return { data, error }
  query.single = jest.fn().mockImplementation(() =>
    Promise.resolve({ data: resolvedData, error: resolvedError })
  );
  query.maybeSingle = jest.fn().mockImplementation(() =>
    Promise.resolve({ data: resolvedData, error: resolvedError })
  );

  // Make the query itself thenable for await
  query.then = undefined;
  Object.defineProperty(query, 'then', {
    get() {
      return (resolve: any) =>
        resolve({ data: resolvedData, error: resolvedError });
    },
    configurable: true,
  });

  query._resolveWith = (data: unknown, error?: unknown) => {
    resolvedData = data;
    resolvedError = error ?? null;
  };

  return query as MockSupabaseQuery;
}

export function createMockSupabaseClient() {
  const query = createMockQuery();

  return {
    from: jest.fn().mockReturnValue(query),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithOtp: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithOAuth: jest.fn().mockResolvedValue({ data: { url: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ data: {}, error: null }),
      exchangeCodeForSession: jest.fn().mockResolvedValue({ data: {}, error: null }),
    },
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
    _query: query,
  };
}
