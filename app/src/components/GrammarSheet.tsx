/**
 * GrammarSheet — Bottom sheet showing decoded morphology and linked grammar article.
 *
 * Opens when a morphology code is tapped in InterlinearSheet. Shows human-readable
 * breakdown of the code, and links to a full grammar article if available.
 * Decoded summary is free; full article requires premium.
 */

import React, { useMemo } from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity,
  TouchableWithoutFeedback, StyleSheet,
} from 'react-native';
import { X, BookOpen } from 'lucide-react-native';
import { useMorphologyDecode, useGrammarArticle } from '../hooks/useGrammar';
import { useTheme, spacing, radii, fontFamily, panels } from '../theme';
import { LoadingSkeleton } from './LoadingSkeleton';

interface Props {
  visible: boolean;
  morphologyCode: string | null;
  onClose: () => void;
  onArticlePress?: (articleId: string) => void;
}

export function GrammarSheet({ visible, morphologyCode, onClose, onArticlePress }: Props) {
  const { base } = useTheme();
  const decoded = useMorphologyDecode(morphologyCode);
  const { article, loading: articleLoading } = useGrammarArticle(decoded?.articleId ?? null);

  const accentColor = useMemo(() => {
    if (!decoded) return base.gold;
    return decoded.language === 'hebrew' ? panels.heb.accent : panels.hist.accent;
  }, [decoded, base.gold]);

  if (!visible || !morphologyCode) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: base.bgElevated }]}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.headerLabel, { color: base.textMuted }]}>GRAMMAR</Text>
                  {decoded && (
                    <Text style={[styles.headerSummary, { color: base.text }]} numberOfLines={2}>
                      {decoded.summary}
                    </Text>
                  )}
                  <Text style={[styles.codeText, { color: base.textMuted }]}>{morphologyCode}</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  accessibilityLabel="Close grammar view"
                  accessibilityRole="button"
                >
                  <X size={20} color={base.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {decoded && decoded.parts.length > 0 ? (
                  <>
                    {/* Language badge */}
                    <View style={styles.badges}>
                      <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}>
                        <Text style={[styles.badgeText, { color: accentColor }]}>
                          {decoded.language === 'hebrew' ? 'Hebrew' : 'Greek'}
                        </Text>
                      </View>
                    </View>

                    {/* Parts breakdown */}
                    <Text style={[styles.sectionLabel, { color: base.gold }]}>MORPHOLOGY BREAKDOWN</Text>
                    <View style={[styles.partsTable, { borderColor: base.border }]}>
                      {decoded.parts.map((part, i) => (
                        <View
                          key={`${part.label}-${i}`}
                          style={[
                            styles.partRow,
                            i < decoded.parts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: base.border },
                          ]}
                        >
                          <Text style={[styles.partLabel, { color: base.textMuted }]}>{part.label}</Text>
                          <Text style={[styles.partValue, { color: base.text }]}>{part.value}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Linked grammar article */}
                    {decoded.articleId && (
                      articleLoading ? (
                        <View style={styles.articleWrap}>
                          <LoadingSkeleton lines={2} />
                        </View>
                      ) : article ? (
                        <>
                          <Text style={[styles.sectionLabel, { color: base.gold }]}>GRAMMAR ARTICLE</Text>
                          <View style={[styles.articleCard, { backgroundColor: base.bg, borderColor: base.border }]}>
                            <Text style={[styles.articleTitle, { color: base.text }]}>{article.title}</Text>
                            <Text style={[styles.articleSummary, { color: base.textDim }]} numberOfLines={3}>
                              {article.summary}
                            </Text>
                            {onArticlePress && (
                              <TouchableOpacity
                                onPress={() => onArticlePress(article.id)}
                                style={[styles.readMoreBtn, { borderColor: base.gold + '40' }]}
                                accessibilityLabel="Read full grammar article"
                                accessibilityRole="button"
                              >
                                <BookOpen size={14} color={base.gold} />
                                <Text style={[styles.readMoreText, { color: base.gold }]}>Read Full Article</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </>
                      ) : null
                    )}
                  </>
                ) : (
                  <Text style={[styles.emptyText, { color: base.textMuted }]}>
                    Unable to decode morphology code.
                  </Text>
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
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: 0,
  },
  headerLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  headerSummary: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginTop: 2,
    maxWidth: 280,
  },
  codeText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  badges: {
    flexDirection: 'row',
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
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  partsTable: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  partRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  partLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  partValue: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  articleWrap: {
    marginTop: spacing.md,
  },
  articleCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  articleTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: 4,
  },
  articleSummary: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 18,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderRadius: radii.pill,
  },
  readMoreText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
