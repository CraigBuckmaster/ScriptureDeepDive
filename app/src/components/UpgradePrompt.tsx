/**
 * UpgradePrompt — Contextual bottom sheet modal for premium upsell.
 *
 * Shown when a user taps a gated feature. Variant prop controls the
 * headline and description. One tap dismisses — no guilt, no countdown.
 *
 * Variants:
 *   'feature'  — Interlinear, Concordance, Content Library, etc.
 *   'personal' — Sync, PDF export, premium TTS
 *   'explore'  — Prophecy chain detail, concept explorer depth, etc.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { TabParamList } from '../navigation/types';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { UpgradeVariant } from '../hooks/usePremium';

interface Props {
  visible: boolean;
  onClose: () => void;
  variant: UpgradeVariant;
  featureName: string;
}

const VARIANT_CONFIG: Record<UpgradeVariant, { icon: string; cta: string }> = {
  feature: { icon: '✦', cta: 'Unlock with Companion+' },
  personal: { icon: '✦', cta: 'Upgrade to Companion+' },
  explore: { icon: '✦', cta: 'Unlock with Companion+' },
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  'Interlinear Hebrew & Greek': 'Tap any verse to see the original language — morphology, parsing, lemma, and links to word studies.',
  'Concordance Search': 'Search by Strong\'s number across the entire Bible to find every occurrence.',
  'Content Library': 'Access all 269 articles — chiastic structures, discourse analysis, historical background, and more.',
  'Cross-Reference Threading': 'Follow 31 thematic threads with full passage context and step-by-step navigation.',
  'Word Study Depth': 'Full lexicon entries with semantic range, occurrence maps, and related studies.',
  'Prophecy Chain Detail': 'Detailed passage analysis per link with fulfillment notes and scholarly commentary.',
  'Concept Explorer Depth': 'Trace theme development from Genesis to Revelation with progressive revelation journey.',
  'Cross-Device Sync': 'Sync your notes, highlights, and reading progress across all your devices.',
  'Premium TTS': 'Natural-sounding voices with verse-level sync for a better listening experience.',
  'PDF Export': 'Export formatted study notes with scholar citations as a shareable PDF.',
  'Bible Periods': 'Explore all 12 eras of biblical history with key people, books, themes, and the redemptive thread connecting each period.',
  'The Story of the Bible': 'Trace the 8-act redemptive narrative from Creation to Restoration — see how every chapter fits into God\'s story.',
  'Person Journey': 'Follow key biblical figures across multiple books — see their full arc from calling to legacy.',
};

export function UpgradePrompt({ visible, onClose, variant, featureName }: Props) {
  const { base } = useTheme();
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const config = VARIANT_CONFIG[variant];
  const description = FEATURE_DESCRIPTIONS[featureName] ?? `Unlock ${featureName} and other premium study tools.`;

  const handleLearnMore = () => {
    onClose();
    navigation.navigate('MoreTab', { screen: 'Subscription' });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss upgrade prompt"
      />
      <SafeAreaView style={[styles.sheet, {
        backgroundColor: base.bgElevated, borderColor: base.border,
      }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.handle, { backgroundColor: base.textMuted }]} />

          <Text style={[styles.icon, { color: base.gold }]}>{config.icon}</Text>
          <Text style={[styles.title, { color: base.text }]}>{featureName}</Text>
          <Text style={[styles.description, { color: base.textDim }]}>{description}</Text>

          <TouchableOpacity
            onPress={handleLearnMore}
            style={[styles.ctaButton, { backgroundColor: base.gold }]}
            accessibilityRole="button"
            accessibilityLabel={config.cta}
          >
            <Text style={styles.ctaText}>{config.cta}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.dismissRow}>
            <Text style={[styles.dismissText, { color: base.textMuted }]}>Not Now</Text>
          </TouchableOpacity>
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
    maxHeight: '50%',
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaButton: {
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: {
    color: '#1a1a1a', // data-color: intentional (dark text on gold CTA button)
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 15,
  },
  dismissRow: {
    paddingVertical: spacing.md,
  },
  dismissText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
