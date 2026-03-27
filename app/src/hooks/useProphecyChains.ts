/**
 * useProphecyChains — Hooks for fetching prophecy chain data.
 */

import { useState, useEffect } from 'react';
import { getAllProphecyChains, getProphecyChain } from '../db/content';
import type { ProphecyChain } from '../types';

export function useProphecyChains() {
  const [chains, setChains] = useState<ProphecyChain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllProphecyChains()
      .then(setChains)
      .finally(() => setIsLoading(false));
  }, []);

  return { chains, isLoading };
}

export function useProphecyChainDetail(chainId: string) {
  const [chain, setChain] = useState<ProphecyChain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (chainId) {
      getProphecyChain(chainId)
        .then(setChain)
        .finally(() => setIsLoading(false));
    }
  }, [chainId]);

  return { chain, isLoading };
}
