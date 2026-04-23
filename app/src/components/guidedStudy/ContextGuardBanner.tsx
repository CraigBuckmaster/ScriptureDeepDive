import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, ChevronRight, X } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { ProofTextGuard } from '../../types';

interface Props {
  guard: ProofTextGuard | null;
  onReadContext: () => void;
}

export function ContextGuardBanner({ guard, onReadContext }: Props) {
  const { base } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (!guard || dismissed) return null;

  return (
    <View
      style={[styles.outer, { backgroundColor: `${base.gold}0F`, borderColor: `${base.gold}30` }]}
    >
      <View style={styles.headerRow}>
        <AlertCircle size={15} color={base.gold} />
        <Text style={[styles.label, { color: base.gold }]}>READ IN CONTEXT</Text>
        <TouchableOpacity
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss context note"
        >
          <X size={14} color={base.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.body, { color: base.textDim }]}>{guard.common_misreading}</Text>
      <TouchableOpacity onPress={onReadContext} style={styles.actionRow}>
        <Text style={[styles.action, { color: base.gold }]}>Open the surrounding chapter</Text>
        <ChevronRight size={14} color={base.gold} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  label: {
    flex: 1,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.xs,
  },
  action: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
