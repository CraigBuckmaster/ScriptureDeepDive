/**
 * TimelinePanel — Timeline event cards with date badges.
 * tl blue (#70b8e8). Tap → TimelineScreen.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TappableReference } from '../TappableReference';
import { BadgeChip } from '../BadgeChip';
import { getPanelColors, base, spacing, radii } from '../../theme';
import type { TimelineEventEntry, ParsedRef } from '../../types';

interface Props {
  events: TimelineEventEntry[];
  onEventPress?: (eventName: string) => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function TimelinePanel({ events, onEventPress, onRefPress }: Props) {
  const colors = getPanelColors('tl');

  return (
    <View style={{ gap: spacing.sm }}>
      {events.map((event, i) => (
        <View
          key={i}
          style={{
            backgroundColor: event.current ? colors.bg : 'transparent',
            borderWidth: event.current ? 1 : 0,
            borderColor: colors.border + '60',
            borderRadius: radii.md,
            padding: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <BadgeChip label={event.date} color={colors.accent} />
            <TouchableOpacity
              onPress={() => onEventPress?.(event.name)}
              disabled={!onEventPress}
              style={{ flex: 1 }}
            >
              <Text style={{
                color: colors.accent,
                fontFamily: 'Cinzel_400Regular',
                fontSize: 12,
              }}>
                {event.name}
              </Text>
            </TouchableOpacity>
          </View>
          {event.text ? (
            <TappableReference
              text={event.text}
              style={{ color: base.textDim, fontSize: 13, lineHeight: 20, marginTop: 4 }}
              onRefPress={onRefPress}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
