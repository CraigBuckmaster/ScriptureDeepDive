/**
 * LexiconSheet — Full lexicon entry bottom sheet with in-sheet navigation.
 *
 * Shows definition hierarchy, etymology, related words (tappable → recursive),
 * concordance link, and curated word study banner when available.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity,
  TouchableWithoutFeedback, StyleSheet,
} from 'react-native';
import { ArrowLeft, X, BookOpen, Search } from 'lucide-react-native';
import { useLexicon } from '../hooks/useLexicon';
import { LexiconDefinition } from './LexiconDefinition';
import { RelatedWordCard } from './RelatedWordCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET, panels } from '../theme';
import type { DefinitionJSON } from '../types/lexicon';

interface ConcordanceParams {
  strongs?: string;
  original?: string;
  transliteration?: string;
  gloss?: string;
}

interface Props {
  visible: boolean;
  strongs: string | null;
  onClose: () => void;
  onWordStudyPress?: (wordStudyId: string) => void;
  onConcordancePress?: (params: ConcordanceParams) => void;
  wordStudyId?: string | null;
}

const MAX_STACK = 10;

export function LexiconSheet({
  visible, strongs: initialStrongs, onClose,
  onWordStudyPress, onConcordancePress, wordStudyId,
}: Props) {
  const { base } = useTheme();
  const [strongsStack, setStrongsStack] = useState<string[]>([]);

  // Sync stack with prop changes
  useEffect(() => {
    if (initialStrongs && visible) {
      setStrongsStack([initialStrongs]);
    } else if (!visible) {
      setStrongsStack([]);
    }
  }, [initialStrongs, visible]);

  const currentStrongs = strongsStack[strongsStack.length - 1] ?? null;
  const { entry, related, loading } = useLexicon(currentStrongs);

  const handleRelatedPress = (s: string) => {
    if (strongsStack.length < MAX_STACK) {
      setStrongsStack(prev => [...prev, s]);
    }
  };

  const handleBack = () => {
    setStrongsStack(prev => prev.slice(0, -1));
  };

  const canGoBack = strongsStack.length > 1;

  // Parse definition JSON
  const definition = useMemo<DefinitionJSON | null>(() => {
    if (!entry?.definition_json) return null;
    try {
      return JSON.parse(entry.definition_json);
    } catch { return null; }
  }, [entry?.definition_json]);

  // Parse related strongs for gloss display
  const relatedGlosses = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of related) {
      try {
        const def: DefinitionJSON = JSON.parse(r.definition_json);
        map.set(r.strongs, def.short);
      } catch {
        map.set(r.strongs, '');
      }
    }
    return map;
  }, [related]);

  const isHebrew = entry?.language === 'hebrew';
  const accentColor = isHebrew ? panels.heb.accent : panels.hist.accent;

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: base.bgElevated }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  {canGoBack && (
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}
                      accessibilityLabel="Back to previous word" accessibilityRole="button">
                      <ArrowLeft size={18} color={base.gold} />
                    </TouchableOpacity>
                  )}
                  <Text style={[styles.headerLabel, { color: base.textMuted }]}>LEXICON</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  accessibilityLabel="Close lexicon" accessibilityRole="button">
                  <X size={20} color={base.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {loading ? (
                  <LoadingSkeleton lines={6} />
                ) : !entry ? (
                  <Text style={[styles.emptyText, { color: base.textMuted }]}>
                    No lexicon entry for {currentStrongs}
                  </Text>
                ) : (
                  <>
                    {/* Word display */}
                    <Text style={[styles.lemma, { color: base.text }]}>{entry.lemma}</Text>
                    <Text style={[styles.translit, { color: base.textDim }]}>{entry.transliteration}</Text>
                    <View style={styles.badges}>
                      <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}>
                        <Text style={[styles.badgeText, { color: accentColor }]}>{entry.strongs}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: base.border }]}>
                        <Text style={[styles.badgeText, { color: base.textMuted }]}>
                          {entry.language === 'hebrew' ? 'Hebrew' : 'Greek'}
                        </Text>
                      </View>
                      {entry.pos && (
                        <View style={[styles.badge, { backgroundColor: base.border }]}>
                          <Text style={[styles.badgeText, { color: base.textMuted }]}>{entry.pos}</Text>
                        </View>
                      )}
                    </View>

                    {/* Curated study banner */}
                    {wordStudyId && strongsStack.length === 1 && onWordStudyPress && (
                      <TouchableOpacity
                        onPress={() => onWordStudyPress(wordStudyId)}
                        style={[styles.studyBanner, { borderColor: base.gold + '40', backgroundColor: base.gold + '08' }]}
                        accessibilityLabel="See the curated word study" accessibilityRole="button"
                      >
                        <BookOpen size={14} color={base.gold} />
                        <Text style={[styles.studyBannerText, { color: base.gold }]}>
                          Curated Study Available
                        </Text>
                        <Text style={[styles.studyBannerArrow, { color: base.gold }]}>→</Text>
                      </TouchableOpacity>
                    )}

                    {/* Definition */}
                    <Text style={[styles.sectionLabel, { color: base.gold }]}>DEFINITION</Text>
                    {definition ? (
                      <LexiconDefinition shortDef={definition.short} fullDef={definition.full} />
                    ) : (
                      <Text style={[styles.emptyText, { color: base.textMuted }]}>No definition available</Text>
                    )}

                    {/* Etymology */}
                    {entry.etymology && (
                      <>
                        <Text style={[styles.sectionLabel, { color: base.gold }]}>ETYMOLOGY</Text>
                        <Text style={[styles.etymology, { color: base.textDim }]}>{entry.etymology}</Text>
                      </>
                    )}

                    {/* Related words */}
                    {related.length > 0 && (
                      <>
                        <Text style={[styles.sectionLabel, { color: base.gold }]}>RELATED WORDS</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.relatedRow}>
                          {related.map((r) => (
                            <RelatedWordCard
                              key={r.strongs}
                              lemma={r.lemma}
                              transliteration={r.transliteration}
                              gloss={relatedGlosses.get(r.strongs) ?? ''}
                              onPress={() => handleRelatedPress(r.strongs)}
                            />
                          ))}
                        </ScrollView>
                      </>
                    )}

                    {/* Concordance link */}
                    {onConcordancePress && (
                      <TouchableOpacity
                        onPress={() => onConcordancePress({
                          strongs: entry.strongs,
                          original: entry.lemma,
                          transliteration: entry.transliteration,
                          gloss: definition?.short,
                        })}
                        style={[styles.concordanceBtn, { borderColor: base.border }]}
                        accessibilityLabel="See all occurrences" accessibilityRole="button"
                      >
                        <Search size={14} color={base.gold} />
                        <Text style={[styles.concordanceBtnText, { color: base.gold }]}>
                          See all occurrences
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.6)', // overlay-color: intentional
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  backBtn: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  lemma: {
    fontFamily: fontFamily.body,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 2,
  },
  translit: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },
  studyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  studyBannerText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    flex: 1,
  },
  studyBannerArrow: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  etymology: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  relatedRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  concordanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.pill,
  },
  concordanceBtnText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
});
