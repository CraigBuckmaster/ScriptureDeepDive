/**
 * components/amicus/CitationPill.tsx — inline pill for a chunk citation.
 *
 * Rendered within assistant prose. Visual: compact gold pill. Tap handler
 * is wired in #1456 (citation navigation); here it accepts a generic
 * `onPress` so the parent can route via the future navigator.
 */
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme';

export interface CitationPillProps {
  chunkId: string;
  sourceType: string;
  displayLabel: string;
  scholarId?: string;
  onPress?: () => void;
}

export default function CitationPill(props: CitationPillProps): React.ReactElement {
  const { base } = useTheme();
  return (
    <Pressable
      accessibilityLabel={`Open source: ${props.displayLabel}`}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: pressed ? `${base.gold}40` : `${base.gold}20`,
          borderColor: base.gold,
        },
      ]}
    >
      <Text style={[styles.text, { color: base.gold }]} numberOfLines={1}>
        {props.displayLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    marginHorizontal: 2,
    marginVertical: 1,
  },
  text: { fontSize: 11, letterSpacing: 0.2 },
});
