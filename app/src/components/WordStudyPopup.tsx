/**
 * WordStudyPopup — Bottom sheet showing lexicon entry for a Hebrew/Greek word.
 *
 * TRIGGER: Tapping a word entry INSIDE HebrewPanel (not from VHL verse tap).
 * Flow: VHL word tap → panel opens → tap word in panel → this popup.
 * Only shows if a matching word_studies entry exists in SQLite.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { getAllWordStudies } from '../db/content';
import { base, spacing, radii } from '../theme';
import type { WordStudy } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  word: string | null;
  onGoToFullStudy?: (wordId: string) => void;
}

export function WordStudyPopup({ visible, onClose, word, onGoToFullStudy }: Props) {
  const [study, setStudy] = useState<WordStudy | null>(null);

  useEffect(() => {
    if (!word || !visible) return;
    getAllWordStudies().then((all) => {
      const match = all.find((ws) =>
        ws.original === word || ws.transliteration.toLowerCase() === word.toLowerCase() ||
        ws.id.toLowerCase() === word.toLowerCase()
      );
      setStudy(match ?? null);
    });
  }, [word, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={{
        backgroundColor: base.bgElevated, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg,
        borderTopWidth: 1, borderColor: base.border, maxHeight: '70%',
      }}>
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          {/* Handle bar */}
          <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: base.textMuted, borderRadius: 2, marginBottom: spacing.md }} />

          {study ? (
            <>
              <Text style={{ color: '#e890b8', fontSize: 28, fontFamily: 'EBGaramond_500Medium', textAlign: 'center' }}>
                {study.original}
              </Text>
              <Text style={{ color: base.goldDim, fontSize: 14, fontFamily: 'EBGaramond_400Regular_Italic', textAlign: 'center', marginTop: 4 }}>
                {study.transliteration}
              </Text>
              {study.strongs && (
                <Text style={{ color: base.textMuted, fontSize: 11, textAlign: 'center', marginTop: 2 }}>
                  Strong's: {study.strongs}
                </Text>
              )}

              {/* Glosses */}
              {study.glosses_json && (
                <View style={{ marginTop: spacing.md }}>
                  <Text style={{ color: base.gold, fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.4 }}>
                    GLOSSES
                  </Text>
                  <Text style={{ color: base.text, fontFamily: 'EBGaramond_400Regular', fontSize: 15, marginTop: 4 }}>
                    {(() => { try { return JSON.parse(study.glosses_json).join(', '); } catch { return study.glosses_json; } })()}
                  </Text>
                </View>
              )}

              {study.semantic_range && (
                <View style={{ marginTop: spacing.md }}>
                  <Text style={{ color: base.gold, fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.4 }}>
                    SEMANTIC RANGE
                  </Text>
                  <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, marginTop: 4 }}>
                    {study.semantic_range}
                  </Text>
                </View>
              )}

              {study.note && (
                <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, marginTop: spacing.md, lineHeight: 22 }}>
                  {study.note}
                </Text>
              )}

              {onGoToFullStudy && (
                <TouchableOpacity onPress={() => { onGoToFullStudy(study.id); onClose(); }} style={{ marginTop: spacing.md }}>
                  <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 13 }}>
                    See full study →
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 15 }}>
                {word ? `No lexicon entry found for "${word}"` : 'No word selected'}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
