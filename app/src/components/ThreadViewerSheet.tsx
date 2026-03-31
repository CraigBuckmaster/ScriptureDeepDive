/**
 * ThreadViewerSheet — Bottom sheet showing cross-ref thread step-by-step.
 * Circle + connecting line + ref (tappable) + type badge + text.
 * Current chapter step highlighted gold.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCrossRefThread } from '../db/content';
import { BadgeChip } from './BadgeChip';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { CrossRefThread } from '../types';

interface CrossRefStep {
  ref: string;
  note?: string;
  text?: string;
}
import { logger } from '../utils/logger';

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
        try { setSteps(JSON.parse(t.steps_json)); } catch (err) { setSteps([]); }
      }
    });
  }, [threadId, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={{
        backgroundColor: base.bgElevated, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg,
        borderTopWidth: 1, borderColor: base.border, maxHeight: '85%',
      }}>
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: base.textMuted, borderRadius: 2, marginBottom: spacing.md }} />

          {thread ? (
            <>
              <Text style={{ color: '#9090e0', fontFamily: fontFamily.displayMedium, fontSize: 16, marginBottom: spacing.md }}>
                {thread.theme}
              </Text>

              {steps.map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                  {/* Step indicator */}
                  <View style={{ alignItems: 'center', width: 20 }}>
                    <View style={{
                      width: 12, height: 12, borderRadius: 6,
                      backgroundColor: base.gold + '40', borderWidth: 2, borderColor: base.gold,
                    }} />
                    {i < steps.length - 1 && (
                      <View style={{ width: 2, flex: 1, backgroundColor: base.border, marginTop: 2 }} />
                    )}
                  </View>
                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#9090e0', fontFamily: fontFamily.uiSemiBold, fontSize: 13 }}>
                      {step.ref}
                    </Text>
                    <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 22, marginTop: 2 }}>
                      {step.note || step.text || ''}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Text style={{ color: base.textMuted }}>Loading thread...</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
