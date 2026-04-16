/**
 * SubscriptionScreen — Full-screen plan selection for Companion+.
 *
 * Accessible from: Settings → "Companion+" row, any UpgradePrompt CTA.
 * Shows plan cards, feature list, purchase button, restore link.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../components/ScreenHeader';
import { usePremiumStore } from '../stores/premiumStore';
import { PLANS, purchasePlan, restorePurchases, type PlanInfo } from '../services/purchases';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

const GOLD_BUTTON_DARK = '#1a1a1a'; // data-color: intentional (dark text/elements on gold CTA button)

const FEATURES = [
  'Interlinear Hebrew & Greek',
  'Concordance search',
  'Content library (269 articles)',
  'Cross-reference threading',
  'Word study depth + lexicon',
  'Prophecy chain detail',
  'Concept explorer depth',
  'Chiasm visualization',
  'Discourse analysis',
  'All 10 reading plans',
  'Cross-device sync',
  'Premium TTS voices',
  'PDF study export',
];

function SubscriptionScreen() {
  const { base } = useTheme();
  const navigation = useNavigation();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const purchaseType = usePremiumStore((s) => s.purchaseType);
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo>(PLANS[1]); // Default to annual
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

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
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title=""
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroIcon, { color: base.gold }]}>✦</Text>
          <Text style={[styles.heroTitle, { color: base.gold }]}>Companion+</Text>
          <Text style={[styles.heroSubtitle, { color: base.textDim }]}>
            Every Perspective. Every Tool.
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

        {/* Feature list */}
        <View style={styles.featureSection}>
          <Text style={[styles.featureSectionLabel, { color: base.gold }]}>
            INCLUDED WITH COMPANION+
          </Text>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={[styles.featureCheck, { color: base.gold }]}>✓</Text>
              <Text style={[styles.featureText, { color: base.text }]}>{f}</Text>
            </View>
          ))}
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
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
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
    color: '#1a1a1a', // data-color: intentional — dark text on gold badge
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
    color: '#1a1a1a', // data-color: intentional (dark text on gold button)
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
  finePrint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default withErrorBoundary(SubscriptionScreen);
