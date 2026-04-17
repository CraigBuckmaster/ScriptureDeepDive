/**
 * components/amicus/AmicusPeekSheet.tsx — bottom sheet that expands on FAB tap.
 *
 * Renders chips + free-text input. Chip activation or send will wire into
 * the mini-conversation in #1463; for now the peek just surfaces chips and
 * a non-functional input (to keep #1462 focused on the shell).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { ArrowUp } from 'lucide-react-native';
import { useNavigationState } from '@react-navigation/native';
import { fontFamily, spacing, useTheme } from '../../theme';
import { useAmicusChips, type ChipContext } from '../../hooks/useAmicusChips';

export interface AmicusPeekSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional override for tests. */
  contextOverride?: ChipContext;
  /** Fired when the user taps a chip. #1463 takes this from here. */
  onChipTap?: (seedQuery: string) => void;
  /** Fired when the user submits free-text. */
  onSend?: (text: string) => void;
}

export default function AmicusPeekSheet(
  props: AmicusPeekSheetProps,
): React.ReactElement | null {
  const { base } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const ctx = useNavigationContext(props.contextOverride);
  const { chips } = useAmicusChips(ctx);
  const [text, setText] = useState('');

  // Open / close programmatically.
  useEffect(() => {
    if (props.isOpen) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
  }, [props.isOpen]);

  // Android hardware-back closes the sheet (not the app).
  useEffect(() => {
    if (!props.isOpen) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      props.onClose();
      return true;
    });
    return () => sub.remove();
  }, [props.isOpen, props]);

  const handleChip = useCallback(
    (seedQuery: string) => {
      props.onChipTap?.(seedQuery);
    },
    [props],
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    props.onSend?.(trimmed);
  }, [text, props]);

  if (!props.isOpen) return null;

  const subtitle = contextSubtitle(ctx);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={props.onClose}
      backdropComponent={(bdProps) => (
        <BottomSheetBackdrop
          {...bdProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
      backgroundStyle={[styles.bg, { backgroundColor: base.bg, borderColor: base.border }]}
      handleIndicatorStyle={[styles.handle, { backgroundColor: base.gold }]}
    >
      <BottomSheetView style={styles.content} accessibilityLabel="Amicus peek">
        <View style={styles.header}>
          <Text style={[styles.title, { color: base.text, fontFamily: fontFamily.display }]}>
            Amicus
          </Text>
          {subtitle && (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: base.textMuted, fontFamily: fontFamily.bodyItalic }]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.chipArea}>
          {chips.length === 0 ? (
            <Text style={[styles.emptyChips, { color: base.textMuted }]}>
              Ask anything about your current reading.
            </Text>
          ) : (
            chips.map((chip) => (
              <Pressable
                key={chip.label}
                accessibilityLabel={`Ask: ${chip.label}`}
                onPress={() => handleChip(chip.seed_query)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: base.gold,
                    backgroundColor: pressed ? `${base.gold}20` : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[styles.chipText, { color: base.gold, fontFamily: fontFamily.body }]}
                  numberOfLines={2}
                >
                  {chip.label}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={[styles.inputBar, { borderTopColor: base.border }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message Amicus…"
            placeholderTextColor={base.textMuted}
            style={[
              styles.input,
              {
                color: base.text,
                backgroundColor: base.bgSurface,
                borderColor: base.border,
              },
            ]}
            accessibilityLabel="Message Amicus from peek"
            multiline
          />
          <Pressable
            accessibilityLabel="Send"
            onPress={handleSend}
            disabled={text.trim().length === 0}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: text.trim().length > 0 ? base.gold : base.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <ArrowUp size={18} color={base.bg} />
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

/** Extract chapter/entity context from the active route for chip selection. */
function useNavigationContext(override?: ChipContext): ChipContext {
  const state = useNavigationState((s) => s);
  return useMemo(() => {
    if (override) return override;
    if (!state) return { kind: 'none' };
    const route = findDeepestRoute(state);
    if (!route) return { kind: 'none' };
    const params = (route.params ?? {}) as Record<string, unknown>;
    switch (route.name) {
      case 'Chapter': {
        const bookId = typeof params.bookId === 'string' ? params.bookId : undefined;
        const chapterNum =
          typeof params.chapterNum === 'number' ? params.chapterNum : undefined;
        if (bookId && chapterNum) {
          return { kind: 'chapter', bookId, chapterNum };
        }
        return { kind: 'none' };
      }
      case 'PersonDetail':
        if (typeof params.personId === 'string') {
          return { kind: 'person', personId: params.personId };
        }
        return { kind: 'none' };
      case 'DebateDetail':
        if (typeof params.topicId === 'string') {
          return { kind: 'debate_topic', topicId: params.topicId };
        }
        return { kind: 'none' };
      default:
        return { kind: 'none' };
    }
  }, [state, override]);
}

interface MinimalRoute {
  name: string;
  params?: unknown;
  state?: { routes?: MinimalRoute[]; index?: number };
}

function findDeepestRoute(state: unknown): MinimalRoute | null {
  const s = state as {
    routes?: MinimalRoute[];
    index?: number;
  } | null;
  if (!s || !Array.isArray(s.routes)) return null;
  const idx = typeof s.index === 'number' ? s.index : s.routes.length - 1;
  const route = s.routes[idx];
  if (!route) return null;
  if (route.state) return findDeepestRoute(route.state) ?? route;
  return route;
}

function contextSubtitle(ctx: ChipContext): string {
  switch (ctx.kind) {
    case 'chapter':
      return `Reading ${prettyBook(ctx.bookId)} ${ctx.chapterNum}`;
    case 'person':
      return `Person · ${ctx.personId}`;
    case 'place':
      return `Place · ${ctx.placeId}`;
    case 'debate_topic':
      return 'Browsing a debate';
    case 'none':
      return 'Ready to help';
  }
}

function prettyBook(bookId: string): string {
  return bookId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bg: { borderWidth: StyleSheet.hairlineWidth },
  handle: { width: 40, height: 4, borderRadius: 2 },
  content: { flex: 1, padding: spacing.md, gap: spacing.sm },
  header: { marginBottom: spacing.xs },
  title: { fontSize: 20 },
  subtitle: { fontSize: 13, marginTop: 2 },
  chipArea: { gap: 8 },
  emptyChips: { fontSize: 13, fontStyle: 'italic' },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  chipText: { fontSize: 14 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: 'auto',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
