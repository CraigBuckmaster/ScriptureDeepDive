/**
 * ProphecyChainCard — Chain card for the Themes & Connections section.
 *
 * Vertical-dot decoration on right edge signals chain-of-events.
 * No icons. Tinted parchment background.
 *
 * Part of Card #1263 (Explore redesign).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, radii, fontFamily, spacing } from '../../theme';
import type { ProphecyChain, ProphecyChainLink } from '../../types';

export const PROPHECY_CHAIN_CARD_WIDTH = 170;
const MAX_DOTS = 8;

export interface ProphecyChainCardProps {
  chain: ProphecyChain;
  onPress: () => void;
}

/** Parse links_json safely — returns [] on malformed JSON. */
export function parseChainLinks(json: string | null | undefined): ProphecyChainLink[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Format the range label using the first and last link refs. */
export function formatRange(links: ProphecyChainLink[]): string {
  if (links.length === 0) return '';
  const first = links[0];
  const last = links[links.length - 1];
  if (first === last) return first.verse_ref ?? '';
  return `${first.verse_ref ?? ''} → ${last.verse_ref ?? ''}`.trim();
}

export function ProphecyChainCard({ chain, onPress }: ProphecyChainCardProps) {
  const { base } = useTheme();
  const links = parseChainLinks(chain.links_json);
  const stopCount = links.length;
  const range = formatRange(links);
  const dotCount = Math.min(Math.max(stopCount, 2), MAX_DOTS);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: base.tintParchment || base.bgElevated,
          borderColor: base.gold + '12',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${chain.title} prophecy chain, ${stopCount} stops`}
    >
      <View style={styles.dotColumn} accessibilityElementsHidden>
        {Array.from({ length: dotCount }).map((_, i) => {
          const isEdge = i === 0 || i === dotCount - 1;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: base.gold,
                  opacity: isEdge ? 0.7 : 0.25,
                },
              ]}
            />
          );
        })}
      </View>
      <Text style={[styles.title, { color: base.text }]} numberOfLines={2}>
        {chain.title}
      </Text>
      {range ? (
        <Text style={[styles.range, { color: base.textMuted }]} numberOfLines={1}>
          {range}
        </Text>
      ) : null}
      <Text style={[styles.stopCount, { color: base.gold }]}>{stopCount} stops</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: PROPHECY_CHAIN_CARD_WIDTH,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    overflow: 'hidden',
  },
  dotColumn: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'column',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginRight: 24,
    marginBottom: 2,
  },
  range: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
    marginBottom: 2,
  },
  stopCount: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
  },
});
