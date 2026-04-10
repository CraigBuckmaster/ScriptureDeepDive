import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '../theme';

interface ImageCreditProps {
  credit?: string | null;
}

const DEFAULT_CREDIT = 'Public domain via Wikimedia Commons';

export function ImageCredit({ credit }: ImageCreditProps) {
  const { base } = useTheme();
  const displayText = credit || DEFAULT_CREDIT;

  return (
    <Text style={[styles.credit, { color: base.textMuted }]}>
      Image: {displayText}
    </Text>
  );
}

const styles = StyleSheet.create({
  credit: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
});
