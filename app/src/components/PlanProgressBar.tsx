import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '../theme';

interface Props { completed: number; total: number; }

function PlanProgressBar({ completed, total }: Props) {
  const { base } = useTheme();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <View style={styles.container}>
      <View style={[styles.trackBar, { backgroundColor: base.bgSurface }]}>
        <View style={[styles.fillBar, { width: `${pct}%`, backgroundColor: base.gold }]} />
      </View>
      <Text style={[styles.progressText, { color: base.textMuted }]}>
        {pct}% · Day {completed} of {total}
      </Text>
    </View>
  );
}

const MemoizedPlanProgressBar = React.memo(PlanProgressBar);
export { MemoizedPlanProgressBar as PlanProgressBar };
export default MemoizedPlanProgressBar;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  trackBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fillBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
