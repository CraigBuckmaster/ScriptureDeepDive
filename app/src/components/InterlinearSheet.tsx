/**
 * InterlinearSheet — Bottom sheet showing word-level Hebrew/Greek
 * interlinear data for a single verse.
 *
 * Shows verse reference at top, then a scrollable list of word cards.
 * Hebrew words display right-to-left, Greek left-to-right.
 */

import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity,
  TouchableWithoutFeedback, StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { getInterlinearWords } from '../db/content';
import { LoadingSkeleton } from './LoadingSkeleton';
import { base, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { InterlinearWord } from '../types';

interface ConcordanceParams {
  strongs: string;
  original: string;
  transliteration: string;
  gloss: string | null;
}

interface Props {
  visible: boolean;
  bookId: string;
  chapter: number;
  verse: number;
  verseRef: string;
  onClose: () => void;
  onWordStudyPress?: (wordStudyId: string) => void;
  onConcordancePress?: (params: ConcordanceParams) => void;
}

export function InterlinearSheet({
  visible, bookId, chapter, verse, verseRef,
  onClose, onWordStudyPress, onConcordancePress,
}: Props) {
  const [words, setWords] = useState<InterlinearWord[]>([]);
  const [loading, setLoading] = useState(true);

  // Detect OT vs NT for text direction
  const isOT = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1_samuel', '2_samuel', '1_kings', '2_kings',
    '1_chronicles', '2_chronicles', 'ezra', 'nehemiah', 'esther', 'job',
    'psalms', 'proverbs', 'ecclesiastes', 'song_of_solomon', 'isaiah',
    'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai',
    'zechariah', 'malachi',
  ].includes(bookId);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    getInterlinearWords(bookId, chapter, verse).then((w) => {
      setWords(w);
      setLoading(false);
    });
  }, [visible, bookId, chapter, verse]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.label}>INTERLINEAR</Text>
                  <Text style={styles.verseRef}>{verseRef}</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <X size={20} color={base.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Word cards */}
              {loading ? (
                <View style={styles.loadingWrap}>
                  <LoadingSkeleton lines={3} />
                </View>
              ) : words.length === 0 ? (
                <Text style={styles.emptyText}>
                  No interlinear data available for this verse.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.wordRow,
                    isOT && styles.wordRowRTL,
                  ]}
                >
                  {words.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={styles.wordCard}
                      activeOpacity={w.word_study_id ? 0.7 : 1}
                      onPress={w.word_study_id && onWordStudyPress
                        ? () => onWordStudyPress(w.word_study_id!)
                        : undefined}
                    >
                      {/* Original text (large) */}
                      <Text style={[styles.original, isOT && styles.originalHebrew]}>
                        {w.original}
                      </Text>

                      {/* Transliteration */}
                      <Text style={styles.transliteration}>{w.transliteration}</Text>

                      {/* Strong's number + concordance link */}
                      {w.strongs ? (
                        <TouchableOpacity
                          onPress={onConcordancePress
                            ? () => onConcordancePress({
                                strongs: w.strongs!,
                                original: w.original,
                                transliteration: w.transliteration,
                                gloss: w.gloss,
                              })
                            : undefined}
                          activeOpacity={onConcordancePress ? 0.6 : 1}
                        >
                          <Text style={[
                            styles.strongs,
                            onConcordancePress ? styles.strongsLinked : null,
                          ]}>
                            {w.strongs}
                          </Text>
                          {onConcordancePress ? (
                            <Text style={styles.concordanceLink}>All occurrences</Text>
                          ) : null}
                        </TouchableOpacity>
                      ) : null}

                      {/* Morphology */}
                      {w.morphology ? (
                        <Text style={styles.morphology}>{w.morphology}</Text>
                      ) : null}

                      {/* Gloss */}
                      {w.gloss ? (
                        <Text style={styles.gloss} numberOfLines={2}>{w.gloss}</Text>
                      ) : null}

                      {/* Word study indicator */}
                      {w.word_study_id ? (
                        <View style={styles.wsIndicator} />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: base.bgElevated,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '55%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  label: {
    color: base.textMuted,
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  verseRef: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginTop: 2,
  },
  loadingWrap: {
    padding: spacing.md,
  },
  emptyText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  wordRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  wordRowRTL: {
    flexDirection: 'row-reverse',
  },
  wordCard: {
    backgroundColor: base.bg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: base.border,
    padding: spacing.sm,
    width: 110,
    alignItems: 'center',
  },
  original: {
    color: base.text,
    fontFamily: fontFamily.body,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  originalHebrew: {
    fontSize: 22,
  },
  transliteration: {
    color: base.textDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
  strongs: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginBottom: 2,
  },
  strongsLinked: {
    color: base.gold,
  },
  concordanceLink: {
    color: base.gold,
    fontFamily: fontFamily.ui,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },
  morphology: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 9,
    marginBottom: 4,
  },
  gloss: {
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textAlign: 'center',
  },
  wsIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: base.gold,
  },
});
