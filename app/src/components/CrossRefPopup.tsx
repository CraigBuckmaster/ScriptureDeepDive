/**
 * CrossRefPopup — Centered modal showing resolved verse text for a reference.
 * Triggered by TappableReference taps. Shows ref header, verse text, "Go to chapter".
 */

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { resolveVerseText, type ParsedRef } from '../utils/verseResolver';
import { useSettingsStore } from '../stores';
import { base, spacing, radii } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  reference: ParsedRef | null;
  onGoToChapter?: (bookId: string, ch: number) => void;
}

export function CrossRefPopup({ visible, onClose, reference, onGoToChapter }: Props) {
  const translation = useSettingsStore((s) => s.translation);
  const [verseTexts, setVerseTexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reference || !visible) return;
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
      <TouchableOpacity style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={onClose}>
        <View style={{
          width: '85%', maxHeight: '60%', backgroundColor: base.bgElevated,
          borderRadius: radii.lg, borderWidth: 1, borderColor: base.border,
          padding: spacing.md,
        }}>
          {/* Header */}
          <Text style={{ color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 15, marginBottom: spacing.sm }}>
            {refLabel}
          </Text>

          {/* Verse text */}
          <ScrollView style={{ maxHeight: 200 }}>
            {loading ? (
              <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 14 }}>Loading...</Text>
            ) : verseTexts.length > 0 ? (
              verseTexts.map((t, i) => (
                <Text key={i} style={{ color: base.text, fontFamily: 'EBGaramond_400Regular', fontSize: 15, lineHeight: 24, marginBottom: 4 }}>
                  {t}
                </Text>
              ))
            ) : (
              <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 14 }}>
                Verse not available in current content.
              </Text>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
            {onGoToChapter && (
              <TouchableOpacity onPress={() => { onGoToChapter(reference.bookId, reference.chapter); onClose(); }}>
                <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 13 }}>
                  Go to chapter →
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: base.textMuted, fontSize: 13 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
