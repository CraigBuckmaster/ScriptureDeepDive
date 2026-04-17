/**
 * components/amicus/CapExceededBanner.tsx — monthly-cap banner shown on
 * AmicusThreadScreen when the user has used their quota for the month.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontFamily, spacing, useTheme } from '../../theme';
import type { Entitlement } from '../../hooks/useAmicusAccess';

export interface CapExceededBannerProps {
  entitlement: Entitlement;
  /** Invoked when user taps the upgrade CTA (premium → partner_plus). */
  onUpgrade?: () => void;
}

/** Last-day-of-next-month formatter without Intl typing fuss. */
function nextResetDate(now: Date = new Date()): string {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CapExceededBanner(
  props: CapExceededBannerProps,
): React.ReactElement {
  const { base } = useTheme();
  const reset = nextResetDate();

  if (props.entitlement === 'premium') {
    return (
      <View
        style={[
          styles.banner,
          { backgroundColor: `${base.gold}20`, borderColor: base.gold },
        ]}
        accessibilityLabel="Monthly cap reached"
      >
        <Text style={[styles.text, { color: base.text, fontFamily: fontFamily.body }]}>
          Amicus is resting — you&rsquo;ve used all 300 queries this month.
        </Text>
        <Pressable
          accessibilityLabel="Upgrade to Amicus+"
          onPress={props.onUpgrade}
          style={[styles.ctaButton, { backgroundColor: base.gold }]}
        >
          <Text style={[styles.ctaText, { color: base.bg }]}>
            Upgrade to Amicus+ for 1,500/mo →
          </Text>
        </Pressable>
        <Text style={[styles.note, { color: base.textMuted }]}>
          Your cap resets on {reset}.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: `${base.gold}20`, borderColor: base.gold },
      ]}
      accessibilityLabel="Monthly cap reached"
    >
      <Text style={[styles.text, { color: base.text, fontFamily: fontFamily.body }]}>
        You&rsquo;ve used all 1,500 queries this month.
      </Text>
      <Text style={[styles.note, { color: base.textMuted }]}>
        Your cap resets on {reset}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: spacing.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  text: { fontSize: 14 },
  note: { fontSize: 11 },
  ctaButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  ctaText: { fontSize: 13, fontWeight: '600' },
});
