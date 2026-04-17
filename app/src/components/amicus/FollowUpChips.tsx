/**
 * components/amicus/FollowUpChips.tsx — 3 tappable follow-up suggestions.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontFamily, spacing, useTheme } from '../../theme';

export interface FollowUpChipsProps {
  followUps: string[];
  onSelect: (text: string) => void;
}

export default function FollowUpChips(props: FollowUpChipsProps): React.ReactElement | null {
  const { base } = useTheme();
  if (props.followUps.length === 0) return null;
  return (
    <View style={styles.row}>
      {props.followUps.slice(0, 3).map((text) => (
        <Pressable
          key={text}
          accessibilityLabel={`Ask: ${text}`}
          onPress={() => props.onSelect(text)}
          style={({ pressed }) => [
            styles.chip,
            {
              borderColor: base.gold,
              backgroundColor: pressed ? `${base.gold}20` : 'transparent',
            },
          ]}
        >
          <Text
            style={[styles.chipText, { color: base.gold, fontFamily: fontFamily.body }]}
            numberOfLines={2}
          >
            {text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: '100%',
  },
  chipText: { fontSize: 12 },
});
