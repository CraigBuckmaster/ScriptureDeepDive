import React from 'react';
import { Text } from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import { sharedStyles } from './styles';

export function SectionLabel({ text, base }: { text: string; base: BaseColors }) {
  return <Text style={[sharedStyles.sectionLabel, { color: base.textMuted }]}>{text}</Text>;
}
