import React from 'react';
import { View, Text } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props { completed: number; total: number; }

export function PlanProgressBar({ completed, total }: Props) {
  const { base } = useTheme();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ height: 6, backgroundColor: base.bgSurface, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${pct}%`, backgroundColor: base.gold, borderRadius: 3 }} />
      </View>
      <Text style={{ color: base.textMuted, fontFamily: fontFamily.ui, fontSize: 11 }}>
        {pct}% · Day {completed} of {total}
      </Text>
    </View>
  );
}
