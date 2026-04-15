/**
 * CrossRefPopup — Centered modal showing resolved verse text for a reference.
 * Triggered by TappableReference taps. Shows ref header, verse text, "Go to chapter".
 */

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { resolveVerseText, type ParsedRef } from '../utils/verseResolver';
import { useSettingsStore } from '../stores';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  reference: ParsedRef | null;
  onGoToChapter?: (bookId: string, ch: number) => void;
}

export function CrossRefPopup({ visible, onClose, reference, onGoToChapter }: Props) {
  const { base } = useTheme();
  const translation = useSettingsStore((s) => s.translation);
  const [verseTexts, setVerseTexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reference || !visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    resolveVerseText(reference, translation).then((texts) => {
      setVerseTexts(texts);
      setLoading(false);
    });
  }, [reference, visible, translation]);

  if (!reference) return null;

  const refLabel = `${reference.bookName} ${reference.chapter}${
    reference.verseStart ? `:${reference.verseStart}${reference.verseEnd && reference.verseEnd !== reference.verseStart ? `–${reference.verseEnd}` : ''}` : ''
  }`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close reference popup">
        <View style={[styles.card, {
          backgroundColor: base.bgElevated, borderColor: base.border,
        }]}>
          {/* Header */}
          <Text style={[styles.refLabel, { color: base.gold }]}>
            {refLabel}
          </Text>

          {/* Verse text */}
          <ScrollView style={styles.verseScroll}>
            {loading ? (
              <Text style={[styles.placeholder, { color: base.textMuted }]}>Loading...</Text>
            ) : verseTexts.length > 0 ? (
              verseTexts.map((t, i) => (
                <Text key={i} style={[styles.verseText, { color: base.text }]}>
                  {t}
                </Text>
              ))
            ) : (
              <Text style={[styles.placeholder, { color: base.textMuted }]}>
                Verse not available in current content.
              </Text>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {onGoToChapter && (
              <TouchableOpacity onPress={() => { onGoToChapter(reference.bookId, reference.chapter); onClose(); }} accessibilityRole="button" accessibilityLabel={`Go to ${refLabel} chapter`}>
                <Text style={[styles.goText, { color: base.gold }]}>
                  Go to chapter →
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={[styles.closeText, { color: base.textMuted }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088', // overlay-color: intentional
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    maxHeight: '60%',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  refLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  verseScroll: {
    maxHeight: 200,
  },
  placeholder: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
  },
  verseText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  goText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  closeText: {
    fontSize: 13,
  },
});
