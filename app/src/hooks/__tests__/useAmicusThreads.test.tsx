/**
 * Tests for useAmicusThreads hook — optimistic pin/unpin/rename/remove.
 */
import React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { getMockUserDb, resetMockUserDb } from '../../../__tests__/helpers/mockUserDb';

jest.mock('@/db/userDatabase', () =>
  require('../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

import { useAmicusThreads } from '@/hooks/useAmicusThreads';

function Harness({
  onReady,
}: {
  onReady: (api: ReturnType<typeof useAmicusThreads>) => void;
}) {
  const api = useAmicusThreads();
  React.useEffect(() => {
    if (!api.isLoading) onReady(api);
  }, [api, onReady]);
  return <Text>{api.threads.length} threads</Text>;
}

describe('useAmicusThreads', () => {
  beforeEach(() => resetMockUserDb());

  it('loads threads on mount and exposes them', async () => {
    getMockUserDb().getAllAsync.mockResolvedValueOnce([
      {
        thread_id: 't1',
        title: 'Thread',
        chapter_ref: null,
        pinned: 0,
        created_at: 'x',
        last_message_at: 'x',
      },
    ]);

    let api: ReturnType<typeof useAmicusThreads> | null = null;
    render(<Harness onReady={(a) => (api = a)} />);
    await act(async () => {});
    expect(api!.threads).toHaveLength(1);
    expect(api!.threads[0]!.thread_id).toBe('t1');
  });

  it('optimistically pins a thread and persists via toggleThreadPin', async () => {
    const mock = getMockUserDb();
    mock.getAllAsync.mockResolvedValueOnce([
      {
        thread_id: 't1',
        title: 'T',
        chapter_ref: null,
        pinned: 0,
        created_at: 'x',
        last_message_at: 'x',
      },
    ]);
    mock.getFirstAsync.mockResolvedValueOnce({ pinned: 0 });

    let api: ReturnType<typeof useAmicusThreads> | null = null;
    render(<Harness onReady={(a) => (api = a)} />);
    await act(async () => {});

    await act(async () => {
      await api!.actions.pin('t1');
    });
    const sqls = mock.runAsync.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(sqls.some((s) => s.includes('SET pinned'))).toBe(true);
  });

  it('optimistically removes a thread and persists via deleteAmicusThread', async () => {
    const mock = getMockUserDb();
    mock.getAllAsync.mockResolvedValueOnce([
      {
        thread_id: 't1',
        title: 'T',
        chapter_ref: null,
        pinned: 0,
        created_at: 'x',
        last_message_at: 'x',
      },
    ]);

    let api: ReturnType<typeof useAmicusThreads> | null = null;
    render(<Harness onReady={(a) => (api = a)} />);
    await act(async () => {});

    await act(async () => {
      await api!.actions.remove('t1');
    });
    const sqls = mock.runAsync.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(sqls.some((s) => s.includes('DELETE FROM amicus_threads'))).toBe(true);
  });

  it('renames a thread via updateThreadTitle', async () => {
    const mock = getMockUserDb();
    mock.getAllAsync.mockResolvedValueOnce([
      {
        thread_id: 't1',
        title: 'Old',
        chapter_ref: null,
        pinned: 0,
        created_at: 'x',
        last_message_at: 'x',
      },
    ]);
    let api: ReturnType<typeof useAmicusThreads> | null = null;
    render(<Harness onReady={(a) => (api = a)} />);
    await act(async () => {});

    await act(async () => {
      await api!.actions.rename('t1', 'New title');
    });
    const sqls = mock.runAsync.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(sqls.some((s) => s.includes('UPDATE amicus_threads SET title'))).toBe(true);
  });
});
