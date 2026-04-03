/**
 * TimelinePanel — Timeline event cards with date badges.
 * tl blue (#70b8e8). Tap → TimelineScreen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { BadgeChip } from '../BadgeChip';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { TimelineEventEntry, ParsedRef } from '../../types';

interface Props {
  events: TimelineEventEntry[];
  onEventPress?: (eventName: string) => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function TimelinePanel({ events, onEventPress, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('tl');

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      {events.map((event, i) => (
        <View
          key={i}
          style={[styles.eventCard, {
            backgroundColor: event.current ? colors.bg : 'transparent',
            borderWidth: event.current ? 1 : 0,
            borderColor: colors.border + '60',
            padding: spacing.sm,
          }]}
        >
          <View style={[styles.eventHeader, { gap: spacing.sm }]}>
            <BadgeChip label={event.date} color={colors.accent} />
            <TouchableOpacity
              onPress={() => onEventPress?.(event.name)}
              disabled={!onEventPress}
              accessibilityRole="button"
              accessibilityLabel={`View event: ${event.name}`}
              style={styles.eventNameButton}
            >
              <Text style={[styles.eventNameText, { color: colors.accent }]}>
                {event.name}
              </Text>
            </TouchableOpacity>
          </View>
          {event.text ? (
            <TappableReference
              text={event.text}
              style={[styles.eventBodyText, { color: base.textDim }]}
              onRefPress={onRefPress}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  eventCard: {
    borderRadius: radii.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventNameButton: {
    flex: 1,
  },
  eventNameText: {
    fontFamily: fontFamily.display,
    fontSize: 12,
  },
  eventBodyText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
});
