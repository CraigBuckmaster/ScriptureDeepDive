/**
 * SubscriptionScreen — Full-screen plan selection for Companion+.
 *
 * Accessible from: Settings → "Companion+" row, any UpgradePrompt CTA.
 * Shows plan cards, feature list, purchase button, restore link.
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  BookOpen,
  Languages,
  Library,
  Network,
  RefreshCw,
  Repeat,
  Sparkles,
} from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { isFlagEnabled } from '../config/featureFlags';
import { usePremiumStore } from '../stores/premiumStore';
import {
  PARTNER_PLUS_PLANS,
  PLANS,
  purchasePlan,
  restorePurchases,
  type PlanInfo,
} from '../services/purchases';
import { useTheme, spacing, radii, fontFamily, overlay } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

const GOLD_BUTTON_DARK = overlay.onGold; // dark text/elements on gold CTA button

interface PartnerCapability {
  Icon: typeof BookOpen;
  title: string;
  subtitle: string;
}

function buildPartnerCapabilities(amicusFlagOn: boolean): PartnerCapability[] {
  return [
    {
      Icon: BookOpen,
      title: 'Helps you study more deeply',
      subtitle:
        'Four guided study modes — Quick, Deep, Teaching, Devotional — with steps that build on each other.',
    },
    {
      Icon: Sparkles,
      title: amicusFlagOn ? 'Drafts what you discovered' : 'Captures what you discovered',
      subtitle: amicusFlagOn
        ? 'Amicus turns your study into a takeaway, an outline, or a prayer — in your voice, citing what you opened.'
        : 'Saves your synthesis in mode-specific shape — takeaway, outline, or prayer.',
    },
    {
      Icon: Repeat,
      title: 'Remembers what you have learned',
      subtitle: 'Spaced review brings your insights back when they matter most.',
    },
    {
      Icon: Languages,
      title: 'Reads the original languages with you',
      subtitle: 'Hebrew and Greek interlinear, lexicon depth, and word study journeys.',
    },
    {
      Icon: Network,
      title: 'Traces ideas across Scripture',
      subtitle:
        'Cross-references, thread navigation, and concordance across the whole canon.',
    },
    {
      Icon: Library,
      title: 'Brings 269 study articles',
      subtitle: 'Discourse analysis, manuscript history, chiastic structure, and more.',
    },
    {
      Icon: RefreshCw,
      title: 'Syncs across your devices',
      subtitle: 'Notes, highlights, progress — wherever you study next.',
    },
  ];
}

const TRUST_FOOTER_TEXT =
  "Every claim cited. Every scholar named. No hallucinations — we will tell you when we don't know.";

function SubscriptionScreen() {
  const { base } = useTheme();
  const navigation = useNavigation();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const purchaseType = usePremiumStore((s) => s.purchaseType);
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo>(PLANS[1]); // Default to annual
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const partnerCapabilities = useMemo(
    () => buildPartnerCapabilities(isFlagEnabled('GUIDED_STUDY_AMICUS_SYNTHESIS')),
    [],
  );

  const handlePurchase = async () => {
    setPurchasing(true);
    const success = await purchasePlan(selectedPlan);
    setPurchasing(false);
    if (success) {
      Alert.alert('Welcome to Companion+', 'All premium features are now unlocked.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const success = await restorePurchases();
    setRestoring(false);
    if (success) {
      Alert.alert('Restored', 'Your Companion+ subscription has been restored.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('No Purchases Found', 'We couldn\'t find any previous Companion+ purchases for this account.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={[styles.stickyHeader, { backgroundColor: base.bg }]}>
        <ScreenHeader
          title=""
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroIcon, { color: base.gold }]}>✦</Text>
          <Text style={[styles.heroTitle, { color: base.gold }]}>Companion+</Text>
          <Text style={[styles.heroSubtitle, { color: base.textDim }]}>
            From reading to understanding.
          </Text>
        </View>

        {isPremium ? (
          <View style={[styles.activeCard, { backgroundColor: base.gold + '15', borderColor: base.gold + '40' }]}>
            <Text style={[styles.activeLabel, { color: base.gold }]}>
              Active — {purchaseType === 'lifetime' ? 'Lifetime' : purchaseType === 'annual' ? 'Annual' : 'Monthly'}
            </Text>
            <Text style={[styles.activeHint, { color: base.textDim }]}>
              All premium features are unlocked.
            </Text>
          </View>
        ) : (
          <>
            {/* Plan cards */}
            <View style={styles.planRow}>
              {PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                // Annual is highlighted as recommended (best value — save 33%).
                const isRecommended = plan.id === 'annual';
                return (
                  <View key={plan.id} style={styles.planCardWrap}>
                    {isRecommended && (
                      <View style={[styles.recommendedBadge, { backgroundColor: base.gold }]}>
                        <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setSelectedPlan(plan)}
                      style={[
                        styles.planCard,
                        {
                          borderColor: isSelected
                            ? base.gold
                            : isRecommended
                              ? base.gold + '55'
                              : base.border,
                          backgroundColor: isSelected
                            ? base.gold + '10'
                            : isRecommended
                              ? base.tintWarm
                              : 'transparent',
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${plan.label} plan${isRecommended ? ', recommended' : ''}: ${plan.price} ${plan.detail}`}
                    >
                      <Text style={[styles.planLabel, { color: isSelected ? base.gold : base.text }]}>
                        {plan.label}
                      </Text>
                      <Text style={[styles.planPrice, { color: isSelected ? base.gold : base.text }]}>
                        {plan.price}
                      </Text>
                      <Text style={[styles.planDetail, { color: base.textMuted }]}>
                        {plan.detail}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Purchase button */}
            <TouchableOpacity
              onPress={handlePurchase}
              disabled={purchasing}
              style={[styles.purchaseBtn, { backgroundColor: base.gold }]}
              accessibilityRole="button"
              accessibilityLabel={`Subscribe to ${selectedPlan.label} plan`}
            >
              {/* data-color: intentional — dark spinner on gold button */}
              {purchasing ? (
                <ActivityIndicator size="small" color={GOLD_BUTTON_DARK} />
              ) : (
                <Text style={styles.purchaseBtnText}>Subscribe Now</Text>
              )}
            </TouchableOpacity>

            {/* Restore */}
            <TouchableOpacity
              onPress={handleRestore}
              disabled={restoring}
              style={styles.restoreBtn}
              accessibilityRole="button"
              accessibilityLabel="Restore previous purchase"
            >
              {restoring ? (
                <ActivityIndicator size="small" color={base.textMuted} />
              ) : (
                <Text style={[styles.restoreText, { color: base.textMuted }]}>
                  Restore Purchase
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Partner-led capability rows (#1746) — replaces the old flat
            13-feature list. Verb-led, mode-aware copy on the second row
            switches between "Captures" (flag off) and "Drafts" (flag on,
            via #1749 in production). */}
        <View style={styles.featureSection}>
          <Text style={[styles.featureSectionLabel, { color: base.gold }]}>
            WHAT YOU GET
          </Text>
          {partnerCapabilities.map((cap) => (
            <View key={cap.title} style={styles.partnerRow}>
              <cap.Icon size={24} color={base.gold} style={styles.partnerRowIcon} />
              <View style={styles.partnerRowText}>
                <Text style={[styles.partnerRowTitle, { color: base.text }]}>{cap.title}</Text>
                <Text style={[styles.partnerRowSubtitle, { color: base.textDim }]}>
                  {cap.subtitle}
                </Text>
              </View>
            </View>
          ))}
          <Text
            style={[styles.trustFooter, { color: base.textMuted }]}
            accessibilityLabel="Trust statement"
          >
            {TRUST_FOOTER_TEXT}
          </Text>
        </View>

        {/* Partner+ tier (#1472) — compact upsell card for AI-heavy users. */}
        <View
          style={[
            styles.partnerPlusCard,
            { borderColor: `${base.gold}55`, backgroundColor: `${base.gold}10` },
          ]}
        >
          <View style={styles.partnerPlusHeader}>
            <Text style={[styles.partnerPlusEyebrow, { color: base.gold }]}>
              FOR SERIOUS STUDY
            </Text>
            <Text
              style={[
                styles.partnerPlusTitle,
                { color: base.text, fontFamily: fontFamily.displaySemiBold },
              ]}
            >
              Partner+
            </Text>
            <Text
              style={[
                styles.partnerPlusSubtitle,
                { color: base.textMuted, fontFamily: fontFamily.bodyItalic },
              ]}
            >
              Everything in Companion+, plus an AI study partner tuned for depth.
            </Text>
          </View>

          <View style={styles.partnerPlusFeatures}>
            <Text style={[styles.partnerPlusFeature, { color: base.text }]}>
              ✦ 1,500 Amicus queries / month (5× the Companion+ cap)
            </Text>
            <Text style={[styles.partnerPlusFeature, { color: base.text }]}>
              ✦ Sonnet-tier answers on every question
            </Text>
            <Text style={[styles.partnerPlusFeature, { color: base.text }]}>
              ✦ Priority during peak load
            </Text>
            <Text style={[styles.partnerPlusFeature, { color: base.text }]}>
              ✦ Export any conversation to Markdown
            </Text>
          </View>

          <View style={styles.partnerPlusPriceRow}>
            {PARTNER_PLUS_PLANS.map((plan) => (
              <View
                key={plan.productId}
                style={[styles.partnerPlusPriceCell, { borderColor: `${base.gold}40` }]}
              >
                <Text style={[styles.partnerPlusPriceLabel, { color: base.textMuted }]}>
                  {plan.label}
                </Text>
                <Text style={[styles.partnerPlusPrice, { color: base.gold }]}>
                  {plan.price}
                </Text>
                <Text style={[styles.partnerPlusPriceDetail, { color: base.textMuted }]}>
                  {plan.detail}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fine print */}
        <Text style={[styles.finePrint, { color: base.textMuted }]}>
          Cancel anytime. Your study data is always yours, even if you cancel.
        </Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  stickyHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 28,
  },
  heroSubtitle: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    marginTop: 4,
  },
  activeCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  activeLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 15,
  },
  activeHint: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    marginTop: 4,
  },
  planRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  planCardWrap: {
    flex: 1,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    zIndex: 1,
    alignSelf: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  recommendedBadgeText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    letterSpacing: 0.8,
    color: overlay.onGold,
  },
  planCard: {
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  planLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planPrice: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
    marginTop: 4,
  },
  planDetail: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
  purchaseBtn: {
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  purchaseBtnText: {
    color: overlay.onGold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 16,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  restoreText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  featureSection: {
    marginBottom: spacing.lg,
  },
  featureSectionLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    letterSpacing: 0.9,
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  featureCheck: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
    width: 20,
  },
  featureText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    flex: 1,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  partnerRowIcon: {
    marginTop: 2,
  },
  partnerRowText: {
    flex: 1,
    gap: 2,
  },
  partnerRowTitle: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  partnerRowSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },
  trustFooter: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  finePrint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  partnerPlusCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  partnerPlusHeader: { gap: 4 },
  partnerPlusEyebrow: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  partnerPlusTitle: { fontSize: 22 },
  partnerPlusSubtitle: { fontSize: 13 },
  partnerPlusFeatures: { gap: 4, marginTop: spacing.xs },
  partnerPlusFeature: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  partnerPlusPriceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  partnerPlusPriceCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  partnerPlusPriceLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  partnerPlusPrice: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginTop: 2,
  },
  partnerPlusPriceDetail: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
});

export default withErrorBoundary(SubscriptionScreen);
