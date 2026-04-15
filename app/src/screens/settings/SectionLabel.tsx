import React from 'react';
import { Text } from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import { sharedStyles } from './styles';

export function SectionLabel({ text, base }: { text: string; base: BaseColors }) {
  // Card #1364: gold Cinzel label (the shared style now carries the typography).
  return <Text style={[sharedStyles.sectionLabel, { color: base.gold }]}>{text}</Text>;
}
