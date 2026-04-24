import { useMemo } from 'react';
import { useAmicusChipContext } from './useAmicusChipContext';
import type { ChipContext } from '@/hooks/useAmicusChips';
import {
  buildAmicusContextEnvelope,
  type AmicusContextEnvelope,
  type AmicusEntryPoint,
  type AmicusGuidedStudyContext,
} from '@/services/amicus/context';
import type { AmicusSeedChapterRef } from '@/services/amicus/deepLink';

export interface UseAmicusContextOptions {
  entryPoint: AmicusEntryPoint;
  chipContextOverride?: ChipContext | null;
  chapterRefOverride?: AmicusSeedChapterRef | string | null;
  guidedStudyContext?: AmicusGuidedStudyContext | null;
}

export function useAmicusContext(options: UseAmicusContextOptions): AmicusContextEnvelope {
  const routeChipContext = useAmicusChipContext();

  return useMemo(
    () =>
      buildAmicusContextEnvelope({
        entryPoint: options.entryPoint,
        chipContext: options.chipContextOverride ?? routeChipContext,
        chapterRef: options.chapterRefOverride,
        guidedStudyContext: options.guidedStudyContext,
      }),
    [
      options.entryPoint,
      options.chipContextOverride,
      options.chapterRefOverride,
      options.guidedStudyContext,
      routeChipContext,
    ],
  );
}
