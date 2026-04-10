import React from 'react';
import { View, Text } from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import { sharedStyles } from './styles';

export function SettingsRow({
  label,
  children,
  base,
}: {
  label: string;
  children: React.ReactNode;
  base: BaseColors;
}) {
  return (
    <View style={[sharedStyles.row, { borderBottomColor: base.border + '40' }]}>
      <Text style={[sharedStyles.rowLabel, { color: base.text }]}>{label}</Text>
      {children}
    </View>
  );
}
