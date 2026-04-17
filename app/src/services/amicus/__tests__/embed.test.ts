/**
 * Tests for embed.ts — proxy client for /ai/embed.
 */
import { embedQuery } from '../embed';
import { AmicusError } from '../types';

function fakeFetch(impl: (url: string, init: RequestInit) => Promise<Response>) {
  return jest.fn(async (url: RequestInfo | URL, init?: RequestInit) =>
    impl(String(url), init ?? {}),
  ) as unknown as typeof fetch;
}

describe('embedQuery', () => {
  it('returns the vector on success', async () => {
    const fetchImpl = fakeFetch(async () =>
      new Response(JSON.stringify({ vector: new Array(1536).fill(0.01) }), {
        status: 200,
      }),
    );
    const v = await embedQuery('hello', { authToken: 'tkn', fetchImpl });
    expect(v).toHaveLength(1536);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('throws EMBED_FAILED when query is empty', async () => {
    await expect(embedQuery('   ', { authToken: 'tkn' })).rejects.toMatchObject({
      code: 'EMBED_FAILED',
    });
  });

  it('throws EMBED_FAILED when vector shape is wrong', async () => {
    const fetchImpl = fakeFetch(async () =>
      new Response(JSON.stringify({ vector: [0, 0, 0] }), { status: 200 }),
    );
    await expect(
      embedQuery('hi', { authToken: 'tkn', fetchImpl }),
    ).rejects.toBeInstanceOf(AmicusError);
  });

  it('throws PROXY_UNAUTHORIZED on 401', async () => {
    const fetchImpl = fakeFetch(async () =>
      new Response('unauthorized', { status: 401 }),
    );
    await expect(
      embedQuery('hi', { authToken: 'tkn', fetchImpl }),
    ).rejects.toMatchObject({ code: 'PROXY_UNAUTHORIZED' });
  });

  it('throws PROXY_UNAUTHORIZED on 402 (no entitlement)', async () => {
    const fetchImpl = fakeFetch(async () =>
      new Response('payment required', { status: 402 }),
    );
    await expect(
      embedQuery('hi', { authToken: 'tkn', fetchImpl }),
    ).rejects.toMatchObject({ code: 'PROXY_UNAUTHORIZED' });
  });

  it('retries once on 5xx then gives up', async () => {
    const fetchImpl = fakeFetch(async () =>
      new Response('upstream dead', { status: 503 }),
    );
    await expect(
      embedQuery('hi', { authToken: 'tkn', fetchImpl }),
    ).rejects.toBeInstanceOf(AmicusError);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('bails early (no retry) on 4xx other than 401/402', async () => {
    const fetchImpl = fakeFetch(async () =>
      new Response('bad request', { status: 400 }),
    );
    await expect(
      embedQuery('hi', { authToken: 'tkn', fetchImpl }),
    ).rejects.toBeInstanceOf(AmicusError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('raises OFFLINE after retry when network throws', async () => {
    const fetchImpl = fakeFetch(async () => {
      throw new Error('network down');
    });
    await expect(
      embedQuery('hi', { authToken: 'tkn', fetchImpl }),
    ).rejects.toMatchObject({ code: 'OFFLINE' });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
