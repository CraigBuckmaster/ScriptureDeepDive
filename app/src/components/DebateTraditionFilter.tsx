/**
 * DebateTraditionFilter — Horizontal colored pills for tradition family filter.
 *
 * Shows "All" plus one pill per tradition family present in the topic.
 * Active pill has full background color, others have 15% opacity.
 */

import React from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { families } from '../theme/colors';

interface Props {
  traditions: string[];
  activeFilter: string;
  onSelect: (tradition: string) => void;
}

const TRADITION_LABELS: Record<string, string> = {
  evangelical: 'Evangelical',
  critical: 'Critical',
  jewish: 'Jewish',
  patristic: 'Patristic',
  reformed: 'Reformed',
  catholic: 'Catholic',
};

function DebateTraditionFilter({ traditions, activeFilter, onSelect }: Props) {
  const { base } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* "All" pill */}
      <TouchableOpacity
        onPress={() => onSelect('all')}
        style={[
          styles.pill,
          {
            backgroundColor: activeFilter === 'all' ? base.gold : base.gold + '15',
            borderColor: base.gold + '40',
          },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            { color: activeFilter === 'all' ? base.bg : base.gold },
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {traditions.map((t) => {
        const color = families[t as keyof typeof families] || base.textDim;
        const isActive = activeFilter === t;
        return (
          <TouchableOpacity
            key={t}
            onPress={() => onSelect(t)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? color : color + '20',
                borderColor: color + '40',
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: isActive ? '#fff' : color }, // data-color: intentional (white text on colored pill)
              ]}
            >
              {TRADITION_LABELS[t] || t}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const MemoizedDebateTraditionFilter = React.memo(DebateTraditionFilter);
export { MemoizedDebateTraditionFilter as DebateTraditionFilter };
export default MemoizedDebateTraditionFilter;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
  },
});
