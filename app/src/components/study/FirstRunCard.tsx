/**
 * components/study/FirstRunCard.tsx — Study hub first-run state
 * (#1837). Shown only when the user has never had a plan and nothing
 * is due for review: invites rather than presenting an empty gold
 * rectangle. One tap on the primary action reaches a live session.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';

interface Props {
  /** Display name of the starter book the primary action studies. */
  starterBookName: string;
  onStudyStarter: () => void;
  onChooseSomethingElse: () => void;
}

export function FirstRunCard({ starterBookName, onStudyStarter, onChooseSomethingElse }: Props) {
  const { base } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}
    >
      <Text style={[styles.title, { color: base.text }]} accessibilityRole="header">
        Begin your first study
      </Text>
      <Text style={[styles.body, { color: base.textDim }]}>
        A guided session walks you through one chapter — context, close reading, and a takeaway
        you keep.
      </Text>

      <TouchableOpacity
        onPress={onStudyStarter}
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityLabel={`Study ${starterBookName} — begin your first guided session`}
        style={[styles.primary, { backgroundColor: base.gold }]}
      >
        <Text style={[styles.primaryLabel, { color: base.bg }]}>Study {starterBookName}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onChooseSomethingElse}
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityLabel="Choose something else to study"
        style={[styles.secondary, { borderColor: base.border }]}
      >
        <Text style={[styles.secondaryLabel, { color: base.textMuted }]}>
          Choose something else
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 20,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
  },
  primary: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  primaryLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  secondary: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  secondaryLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
