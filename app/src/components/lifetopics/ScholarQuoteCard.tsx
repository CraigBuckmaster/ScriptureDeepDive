/**
 * ScholarQuoteCard — Scholar quote with name and tradition.
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
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border + '40' }]}>
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
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  quote: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
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
