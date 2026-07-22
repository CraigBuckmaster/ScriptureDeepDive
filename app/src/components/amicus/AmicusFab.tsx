/**
 * components/amicus/AmicusFab.tsx — always-on Amicus surface.
 *
 * 56×56 circular FAB, bottom-right, gold. Tap opens the peek sheet.
 * Composes:
 *   - `useAmicusFab()` visibility context (for per-screen suppression)
 *   - `useAmicusAccess()` entitlement/usage gate (from #1460)
 */
import React, { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Lock, MessageSquare } from 'lucide-react-native';
import { useTheme, overlay } from '../../theme';
import { useAmicusFab } from '../../contexts/AmicusFabContext';
import { useAmicusChapterStudyThread } from '../../hooks/useAmicusChapterStudyThread';
import { useAmicusAccess } from '../../hooks/useAmicusAccess';
import { useAmicusChipContext } from '../../hooks/useAmicusChipContext';
import { useAmicusGuidedRouteContext } from '../../hooks/useAmicusGuidedRouteContext';
import { chapterRefFromChipContext, formatAmicusContextLabel } from '../../services/amicus/context';
import { promotePeekToThread, type PromotePeekResult } from '../../services/amicus';
import type { AmicusDraftMessage } from '../../types';
import { logger } from '../../utils/logger';
import AmicusPeekSheet from './AmicusPeekSheet';

const FAB_SIZE = 56;
const TAB_BAR_HEIGHT = 56; // matches React Navigation bottom-tab default
const BOTTOM_MARGIN = 16;
const RIGHT_MARGIN = 16;

export interface AmicusFabProps {
  /**
   * Optional callback invoked after peek messages have been promoted to a
   * thread (#1464). Receives a navigation-agnostic `PromotePeekResult` and
   * is responsible for performing the actual `navigate(...)` call. When
   * provided, replaces the FAB's internal navigation entirely.
   *
   * Typically wired in `App.tsx` against `navigationRef`, so the FAB is
   * decoupled from React Navigation's tab/tree shape. When absent, the
   * FAB falls back to its own `useNavigation()` for backward compatibility.
   */
  onContinueInTab?: (result: PromotePeekResult) => void;
}

export default function AmicusFab(props: AmicusFabProps = {}): React.ReactElement | null {
  const { base } = useTheme();
  const insets = useSafeAreaInsets();
  // Defensive: useNavigation throws synchronously if no NavigationContainer
  // ancestor exists. In Release mode that throw becomes a fatal NSException
  // via RCTFatal and aborts the app on first launch. The hook is still called
  // on every render (its internal useContext runs before the throw), so hook
  // order is stable — the try/catch only suppresses the error.
  let navigation: NavigationProp<ParamListBase> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigation = useNavigation<NavigationProp<ParamListBase>>();
  } catch (e) {
    logger.warn('AmicusFab', 'mounted outside NavigationContainer; rendering null', e);
  }
  const { isVisible } = useAmicusFab();
  const access = useAmicusAccess();
  // Resolve the Amicus chip context from nav state here so the hook's
  // try/catch guard lives next to the `useNavigation()` guard above.
  // Passed to AmicusPeekSheet as a prop, keeping that component free
  // of navigation-state hooks.
  const chipContext = useAmicusChipContext();
  const guidedRouteContext = useAmicusGuidedRouteContext();
  const chapterRef = chapterRefFromChipContext(chipContext);
  const chapterRefString = chapterRef ? `${chapterRef.book_id}/${chapterRef.chapter_num}` : null;
  const existingStudyThreadId = useAmicusChapterStudyThread(chapterRefString);
  const [peekOpen, setPeekOpen] = useState(false);
  const [handoffInProgress, setHandoffInProgress] = useState(false);

  // Hide when any screen has requested suppression OR the user turned the
  // feature off in settings. (Non-premium users still see the FAB but with
  // a lock overlay — tap opens the paywall.)
  const shouldRender = isVisible && access.reason !== 'disabled_in_settings';

  const bottomOffset = useMemo<ViewStyle>(
    () => ({
      bottom: insets.bottom + TAB_BAR_HEIGHT + BOTTOM_MARGIN,
      right: RIGHT_MARGIN + insets.right,
    }),
    [insets.bottom, insets.right],
  );

  const handlePress = useCallback(() => {
    if (access.reason === 'not_premium') {
      // Non-premium → paywall screen in the Amicus tab.
      const parent = navigation?.getParent<NavigationProp<ParamListBase>>();
      parent?.navigate('AmicusTab', { screen: 'Paywall' });
      return;
    }
    setPeekOpen(true);
  }, [access.reason, navigation]);

  const handleContinueInTab = useCallback(
    async (snapshot: AmicusDraftMessage[]) => {
      setHandoffInProgress(true);
      try {
        const result = await promotePeekToThread({
          messages: snapshot,
          chapterRef,
          guidedContext: guidedRouteContext,
        });

        // Prefer the parent-provided callback (the new pattern from #1464).
        // It owns the navigation tree shape — service stays navigation-agnostic.
        if (props.onContinueInTab) {
          props.onContinueInTab(result);
          setPeekOpen(false);
          return;
        }

        // Fallback: the FAB navigates itself. Kept so the component remains
        // usable even when a parent forgets to wire the callback (e.g. tests
        // that mount AmicusFab directly without App.tsx).
        if (!navigation) return;
        const parent = navigation.getParent<NavigationProp<ParamListBase>>();
        if (!parent) {
          logger.warn('AmicusFab', 'no parent navigator for peek promotion fallback');
          return;
        }
        if (result.kind === 'existing') {
          parent.navigate('AmicusTab', {
            screen: 'Thread',
            params: {
              threadId: result.threadId,
              seedChapterRef: result.seedChapterRef,
              seedGuidedContext: result.seedGuidedContext,
            },
          });
        } else {
          parent.navigate('AmicusTab', {
            screen: 'NewThread',
            params: {
              seedChapterRef: result.seedChapterRef,
              promotedMessages: result.promotedMessages,
              seedGuidedContext: result.seedGuidedContext,
            },
          });
        }
        setPeekOpen(false);
      } finally {
        setHandoffInProgress(false);
      }
    },
    [chapterRef, guidedRouteContext, navigation, props],
  );

  const handleOpenExistingThread = useCallback(() => {
    if (!navigation || !existingStudyThreadId) return;
    const parent = navigation.getParent<NavigationProp<ParamListBase>>();
    parent?.navigate('AmicusTab', {
      screen: 'Thread',
      params: {
        threadId: existingStudyThreadId,
        seedChapterRef: chapterRefString ?? undefined,
      },
    });
    setPeekOpen(false);
  }, [chapterRefString, existingStudyThreadId, navigation]);

  if (!navigation) return null;
  if (!shouldRender) return null;

  const isLocked = access.reason === 'not_premium';

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable
        accessibilityLabel={isLocked ? 'Unlock Amicus' : 'Open Amicus'}
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.fab,
          bottomOffset,
          {
            backgroundColor: base.gold,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <MessageSquare size={24} color={base.bg} />
        {isLocked && (
          <View style={[styles.lockBadge, { backgroundColor: base.bg }]}>
            <Lock size={10} color={base.gold} />
          </View>
        )}
      </Pressable>

      {peekOpen && (
        <AmicusPeekSheet
          isOpen={peekOpen}
          onClose={() => setPeekOpen(false)}
          context={chipContext}
          onContinueInTab={handleContinueInTab}
          handoffInProgress={handoffInProgress}
          existingStudyThreadLabel={
            existingStudyThreadId && chapterRef
              ? `Open your ${formatAmicusContextLabel(chapterRef) ?? 'current chapter'} study thread`
              : null
          }
          onOpenExistingThread={existingStudyThreadId ? handleOpenExistingThread : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: overlay.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  lockBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
