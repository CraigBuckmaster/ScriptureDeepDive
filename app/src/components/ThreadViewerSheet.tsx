/**
 * ThreadViewerSheet — Bottom sheet showing cross-ref thread step-by-step.
 * Circle + connecting line + ref (tappable) + type badge + text.
 * Current chapter step highlighted gold.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCrossRefThread } from '../db/content';
import { safeParse } from '../utils/logger';
import { useTheme, spacing, radii, fontFamily, panels } from '../theme';
import type { CrossRefThread } from '../types';

interface CrossRefStep {
  ref: string;
  note?: string;
  text?: string;
}
interface Props {
  visible: boolean;
  onClose: () => void;
  threadId: string | null;
  currentBookId?: string;
  currentChapter?: number;
  onGoToRef?: (bookId: string, ch: number) => void;
}

export function ThreadViewerSheet({ visible, onClose, threadId, currentBookId, currentChapter, onGoToRef }: Props) {
  const { base } = useTheme();
  const [thread, setThread] = useState<CrossRefThread | null>(null);
  const [steps, setSteps] = useState<CrossRefStep[]>([]);

  useEffect(() => {
    if (!threadId || !visible) return;
    getCrossRefThread(threadId).then((t) => {
      setThread(t);
      if (t?.steps_json) {
        setSteps(safeParse<CrossRefStep[]>(t.steps_json, []));
      }
    });
  }, [threadId, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={[styles.sheet, {
        backgroundColor: base.bgElevated, borderColor: base.border,
      }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.handle, { backgroundColor: base.textMuted }]} />

          {thread ? (
            <>
              <Text style={styles.theme}>
                {thread.theme}
              </Text>

              {steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  {/* Step indicator */}
                  <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, {
                      backgroundColor: base.gold + '40', borderColor: base.gold,
                    }]} />
                    {i < steps.length - 1 && (
                      <View style={[styles.stepLine, { backgroundColor: base.border }]} />
                    )}
                  </View>
                  {/* Content */}
                  <View style={styles.stepContent}>
                    <Text style={styles.stepRef}>
                      {step.ref}
                    </Text>
                    <Text style={[styles.stepNote, { color: base.textDim }]}>
                      {step.note || step.text || ''}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Text style={[styles.loadingText, { color: base.textMuted }]}>Loading thread...</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: 1,
    maxHeight: '85%',
  },
  scrollContent: {
    padding: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  theme: {
    color: panels.thread.accent,
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 20,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepRef: {
    color: panels.thread.accent,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  stepNote: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
  loadingText: {},
});
