/**
 * GrammarArticleScreen — Full grammar article display.
 *
 * Shows title, summary, body, examples, and related articles.
 * Full article content is premium-gated.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { usePremium } from '../hooks/usePremium';
import { getGrammarArticle } from '../db/content/grammar';
import type { GrammarArticle } from '../types';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';

type Nav = ScreenNavProp<'Explore', 'GrammarArticle'>;
type Route = ScreenRouteProp<'Explore', 'GrammarArticle'>;

function GrammarArticleScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { articleId } = route.params;
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const [article, setArticle] = useState<GrammarArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getGrammarArticle(articleId).then((a) => {
      setArticle(a);
      setLoading(false);
    });
  }, [articleId]);

  const examples = useMemo(() => {
    if (!article?.examples_json) return [];
    try { return JSON.parse(article.examples_json) as { ref: string; text: string }[]; }
    catch { return []; }
  }, [article?.examples_json]);

  const relatedArticles = useMemo(() => {
    if (!article?.related_articles_json) return [];
    try { return JSON.parse(article.related_articles_json) as { id: string; title: string }[]; }
    catch { return []; }
  }, [article?.related_articles_json]);

  const accentColor = article?.language === 'hebrew' ? '#e890b8' : '#70b8e8';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.topSection}>
        <ScreenHeader
          title="Grammar Article"
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <LoadingSkeleton lines={8} />
        ) : !article ? (
          <Text style={[styles.emptyText, { color: base.textDim }]}>
            Article not found.
          </Text>
        ) : (
          <>
            <Text style={[styles.title, { color: base.text }]}>{article.title}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}>
                <Text style={[styles.badgeText, { color: accentColor }]}>
                  {article.language === 'hebrew' ? 'Hebrew' : 'Greek'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: base.border }]}>
                <Text style={[styles.badgeText, { color: base.textMuted }]}>
                  {article.category}
                </Text>
              </View>
            </View>

            <Text style={[styles.summary, { color: base.textDim }]}>{article.summary}</Text>

            {/* Full body — premium gated */}
            {isPremium ? (
              <>
                <Text style={[styles.sectionLabel, { color: base.gold }]}>FULL ARTICLE</Text>
                <Text style={[styles.body, { color: base.text }]}>{article.body}</Text>

                {examples.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: base.gold }]}>EXAMPLES</Text>
                    {examples.map((ex, i) => (
                      <View key={i} style={[styles.exampleCard, { borderColor: base.border }]}>
                        <Text style={[styles.exampleRef, { color: base.gold }]}>{ex.ref}</Text>
                        <Text style={[styles.exampleText, { color: base.textDim }]}>{ex.text}</Text>
                      </View>
                    ))}
                  </>
                )}

                {relatedArticles.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: base.gold }]}>RELATED</Text>
                    {relatedArticles.map((rel) => (
                      <TouchableOpacity
                        key={rel.id}
                        onPress={() => (navigation as any).push('GrammarArticle', { articleId: rel.id })}
                        style={[styles.relatedBtn, { borderColor: base.border }]}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.relatedText, { color: base.gold }]}>{rel.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </>
            ) : (
              <TouchableOpacity
                onPress={() => showUpgrade('feature', 'Grammar Reference')}
                style={[styles.upgradeBtn, { borderColor: base.gold + '40', backgroundColor: base.gold + '08' }]}
                accessibilityRole="button"
              >
                <Text style={[styles.upgradeBtnText, { color: base.gold }]}>
                  Unlock full article with Companion+
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {upgradeRequest && (
        <UpgradePrompt
          visible
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
          onClose={dismissUpgrade}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
    marginBottom: spacing.xs,
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
  summary: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  exampleCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  exampleRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    marginBottom: 2,
  },
  exampleText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  relatedBtn: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  relatedText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  upgradeBtn: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  upgradeBtnText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

export default withErrorBoundary(GrammarArticleScreen);
