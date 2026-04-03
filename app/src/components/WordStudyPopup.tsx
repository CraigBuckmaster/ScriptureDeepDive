/**
 * WordStudyPopup — Bottom sheet showing lexicon entry for a Hebrew/Greek word.
 *
 * TRIGGER: Tapping a word entry INSIDE HebrewPanel (not from VHL verse tap).
 * Flow: VHL word tap → panel opens → tap word in panel → this popup.
 * Only shows if a matching word_studies entry exists in SQLite.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllWordStudies } from '../db/content';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { WordStudy } from '../types';
import { logger } from '../utils/logger';

interface Props {
  visible: boolean;
  onClose: () => void;
  word: string | null;
  onGoToFullStudy?: (wordId: string) => void;
}

export function WordStudyPopup({ visible, onClose, word, onGoToFullStudy }: Props) {
  const { base } = useTheme();
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
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close word study" />
      <SafeAreaView style={[styles.sheet, {
        backgroundColor: base.bgElevated, borderColor: base.border,
      }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: base.textMuted }]} />

          {study ? (
            <>
              <Text style={styles.original}>
                {study.original}
              </Text>
              <Text style={[styles.transliteration, { color: base.goldDim }]}>
                {study.transliteration}
              </Text>
              {study.strongs && (
                <Text style={[styles.strongs, { color: base.textMuted }]}>
                  Strong's: {study.strongs}
                </Text>
              )}

              {/* Glosses */}
              {study.glosses_json && (
                <View style={styles.sectionBlock}>
                  <Text style={[styles.sectionLabel, { color: base.gold }]}>
                    GLOSSES
                  </Text>
                  <Text style={[styles.glossText, { color: base.text }]}>
                    {(() => { try { return JSON.parse(study.glosses_json).join(', '); } catch (err) { return study.glosses_json; } })()}
                  </Text>
                </View>
              )}

              {study.semantic_range && (
                <View style={styles.sectionBlock}>
                  <Text style={[styles.sectionLabel, { color: base.gold }]}>
                    SEMANTIC RANGE
                  </Text>
                  <Text style={[styles.bodyText, { color: base.textDim }]}>
                    {study.semantic_range}
                  </Text>
                </View>
              )}

              {study.note && (
                <Text style={[styles.note, { color: base.textDim }]}>
                  {study.note}
                </Text>
              )}

              {onGoToFullStudy && (
                <TouchableOpacity onPress={() => { onGoToFullStudy(study.id); onClose(); }} style={styles.fullStudyLink} accessibilityRole="button" accessibilityLabel="See full word study">
                  <Text style={[styles.fullStudyText, { color: base.gold }]}>
                    See full study →
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: base.textMuted }]}>
                {word ? `No lexicon entry found for "${word}"` : 'No word selected'}
              </Text>
            </View>
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
    maxHeight: '70%',
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
  original: {
    color: '#e890b8',
    fontSize: 28,
    fontFamily: fontFamily.bodyMedium,
    textAlign: 'center',
  },
  transliteration: {
    fontSize: 14,
    fontFamily: fontFamily.bodyItalic,
    textAlign: 'center',
    marginTop: 4,
  },
  strongs: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionBlock: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  glossText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    marginTop: 4,
  },
  bodyText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 4,
  },
  note: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  fullStudyLink: {
    marginTop: spacing.md,
  },
  fullStudyText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
  },
});
