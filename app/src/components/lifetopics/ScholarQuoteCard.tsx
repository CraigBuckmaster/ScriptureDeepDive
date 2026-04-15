/**
 * ScholarQuoteCard — Scholar quote with name and tradition.
 *
 * Card #1360 (UI polish phase 3):
 *   - 3px gold left border accent (rest of the card border is transparent)
 *   - Parchment-tinted background (base.tintWarm) for a warmer look than
 *     the previous bgElevated fill.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

interface Props {
  quote: string;
  scholarName: string;
  tradition?: string;
}

function ScholarQuoteCard({ quote, scholarName, tradition }: Props) {
  const { base } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: base.tintWarm,
          borderLeftColor: base.gold,
        },
      ]}
    >
      <Text style={[styles.quote, { color: base.text }]}>{`\u201C${quote}\u201D`}</Text>
      <View style={styles.attribution}>
        <Text style={[styles.name, { color: base.gold }]}>{scholarName}</Text>
        {tradition ? (
          <Text style={[styles.tradition, { color: base.textMuted }]}>{` \u00B7 ${tradition}`}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default React.memo(ScholarQuoteCard);

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  quote: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  attribution: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  name: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  tradition: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
