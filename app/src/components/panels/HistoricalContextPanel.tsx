/**
 * HistoricalContextPanel — Historical background paragraph.
 * hist blue (#70b8e8).
 */

import React from 'react';
import { View } from 'react-native';
import { TappableReference } from '../TappableReference';
import { spacing } from '../../theme';
import type { ParsedRef } from '../../types';

interface Props {
  text: string;
  onRefPress?: (ref: ParsedRef) => void;
}

export function HistoricalContextPanel({ text, onRefPress }: Props) {
  return (
    <View style={{ paddingVertical: spacing.xs }}>
      <TappableReference text={text} onRefPress={onRefPress} />
    </View>
  );
}
