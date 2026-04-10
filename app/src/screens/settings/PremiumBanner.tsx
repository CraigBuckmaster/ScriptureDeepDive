import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import type { PurchaseType } from '../../stores/premiumStore';
import { spacing, radii, fontFamily } from '../../theme';

interface PremiumBannerProps {
  base: BaseColors;
  isPremium: boolean;
  purchaseType: PurchaseType;
  onPress: () => void;
}

export function PremiumBanner({ base, isPremium, purchaseType, onPress }: PremiumBannerProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[localStyles.premiumRow, { borderColor: base.gold + '30' }]}
      accessibilityRole="button"
      accessibilityLabel={isPremium ? 'Companion+ active' : 'Subscribe to Companion+'}
    >
      <View>
        <Text style={[localStyles.premiumLabel, { color: base.gold }]}>{'\u2726'} Companion+</Text>
        <Text style={[localStyles.premiumHint, { color: base.textDim }]}>
          {isPremium
            ? `Active — ${purchaseType === 'lifetime' ? 'Lifetime' : purchaseType === 'annual' ? 'Annual' : 'Monthly'}`
            : 'Unlock all premium study tools'}
        </Text>
      </View>
      <Text style={[localStyles.premiumArrow, { color: base.gold }]}>{'\u203A'}</Text>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  premiumLabel: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
  },
  premiumHint: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 2,
  },
  premiumArrow: {
    fontSize: 24,
    fontFamily: fontFamily.ui,
  },
});
