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
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { InterlinearWord } from '../types';
import { LoadingSkeleton } from './LoadingSkeleton';
import { GrammarSheet } from './GrammarSheet';

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
  onLexiconPress?: (strongs: string, wordStudyId: string | null) => void;
  onGrammarArticlePress?: (articleId: string) => void;
}

export function InterlinearSheet({
  visible, bookId, chapter, verse, verseRef,
  onClose, onWordStudyPress, onConcordancePress, onLexiconPress, onGrammarArticlePress,
}: Props) {
  const { base } = useTheme();
  const [words, setWords] = useState<InterlinearWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [grammarCode, setGrammarCode] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
            <View style={[styles.sheet, { backgroundColor: base.bgElevated }]}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.label, { color: base.textMuted }]}>INTERLINEAR</Text>
                  <Text style={[styles.verseRef, { color: base.gold }]}>{verseRef}</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} accessibilityRole="button" accessibilityLabel="Close interlinear view">
                  <X size={20} color={base.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Word cards */}
              {loading ? (
                <View style={styles.loadingWrap}>
                  <LoadingSkeleton lines={3} />
                </View>
              ) : words.length === 0 ? (
                <Text style={[styles.emptyText, { color: base.textMuted }]}>
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
                      style={[styles.wordCard, { backgroundColor: base.bg, borderColor: base.border }]}
                      activeOpacity={w.strongs || w.word_study_id ? 0.7 : 1}
                      onPress={
                        w.strongs && onLexiconPress
                          ? () => onLexiconPress(w.strongs!, w.word_study_id ?? null)
                          : (w.word_study_id && onWordStudyPress
                            ? () => onWordStudyPress(w.word_study_id!)
                            : undefined)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`${w.original}, ${w.transliteration}${w.gloss ? `, ${w.gloss}` : ''}`}
                    >
                      {/* Original text (large) */}
                      <Text style={[styles.original, { color: base.text }, isOT && styles.originalHebrew]}>
                        {w.original}
                      </Text>

                      {/* Transliteration */}
                      <Text style={[styles.transliteration, { color: base.textDim }]}>{w.transliteration}</Text>

                      {/* Strong's number + concordance link */}
                      {w.strongs ? (
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel={`View all occurrences of ${w.strongs}`}
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
                            { color: base.textMuted },
                            onConcordancePress ? { color: base.gold } : null,
                          ]}>
                            {w.strongs}
                          </Text>
                          {onConcordancePress ? (
                            <Text style={[styles.concordanceLink, { color: base.gold }]}>All occurrences</Text>
                          ) : null}
                        </TouchableOpacity>
                      ) : null}

                      {/* Morphology (tappable — opens GrammarSheet) */}
                      {w.morphology ? (
                        <TouchableOpacity
                          onPress={() => setGrammarCode(w.morphology!)}
                          activeOpacity={0.6}
                          accessibilityRole="button"
                          accessibilityLabel={`View grammar for ${w.morphology}`}
                        >
                          <Text style={[styles.morphology, { color: base.gold }]}>{w.morphology}</Text>
                        </TouchableOpacity>
                      ) : null}

                      {/* Gloss */}
                      {w.gloss ? (
                        <Text style={[styles.gloss, { color: base.text }]} numberOfLines={2}>{w.gloss}</Text>
                      ) : null}

                      {/* Word study indicator */}
                      {w.word_study_id ? (
                        <View style={[styles.wsIndicator, { backgroundColor: base.gold }]} />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Grammar bottom sheet — opens over InterlinearSheet */}
      <GrammarSheet
        visible={grammarCode !== null}
        morphologyCode={grammarCode}
        onClose={() => setGrammarCode(null)}
        onArticlePress={onGrammarArticlePress}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // overlay-color: intentional
    justifyContent: 'flex-end',
  },
  sheet: {
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
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  verseRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginTop: 2,
  },
  loadingWrap: {
    padding: spacing.md,
  },
  emptyText: {
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
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm,
    width: 110,
    alignItems: 'center',
  },
  original: {
    fontFamily: fontFamily.body,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  originalHebrew: {
    fontSize: 22,
  },
  transliteration: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
  strongs: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginBottom: 2,
  },
  concordanceLink: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
    textAlign: 'center' as const,
    marginTop: 1,
  },
  morphology: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
    marginBottom: 4,
  },
  gloss: {
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
  },
});
