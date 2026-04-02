/**
 * EchoesView — Renders echo/allusion entries for the Connections hub.
 *
 * Each entry shows: type badge, source→target refs, context, connection,
 * and significance.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { parseReference } from '../../utils/verseResolver';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { EchoEntry, EchoType, ParsedRef } from '../../types';

interface Props {
  entries: EchoEntry[];
  onRefPress?: (ref: ParsedRef) => void;
}

const TYPE_LABELS: Record<EchoType, string> = {
  direct_quote: 'Direct Quote',
  allusion: 'Allusion',
  echo: 'Echo',
  typological: 'Typological',
};

const TYPE_COLORS: Record<EchoType, string> = {
  direct_quote: '#64B5F6',
  allusion: '#81C784',
  echo: '#FFB74D',
  typological: '#BA68C8',
};

export function EchoesView({ entries, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('cross');

  const handleRefPress = (ref: string) => {
    const parsed = parseReference(ref);
    if (parsed && onRefPress) onRefPress(parsed);
  };

  return (
    <View style={styles.container}>
      {entries.map((entry, i) => {
        const typeColor = TYPE_COLORS[entry.type] ?? base.textMuted;
        const typeLabel = TYPE_LABELS[entry.type] ?? entry.type;

        return (
          <View key={i} style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
            {/* Type badge */}
            <View style={[styles.badge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.badgeText, { color: typeColor }]}>
                {typeLabel}
              </Text>
            </View>

            {/* Source → Target refs */}
            <View style={styles.refRow}>
              <TouchableOpacity
                onPress={() => handleRefPress(entry.source_ref)}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${entry.source_ref}`}
              >
                <Text style={[styles.refText, { color: colors.accent }]}>
                  {entry.source_ref}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.arrow, { color: base.textMuted }]}>→</Text>
              <TouchableOpacity
                onPress={() => handleRefPress(entry.target_ref)}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${entry.target_ref}`}
              >
                <Text style={[styles.refText, { color: colors.accent }]}>
                  {entry.target_ref}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Source context */}
            {entry.source_context ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: base.textMuted }]}>Source Context</Text>
                <TappableReference text={entry.source_context} onRefPress={onRefPress} />
              </View>
            ) : null}

            {/* Connection */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: base.textMuted }]}>Connection</Text>
              <TappableReference text={entry.connection} onRefPress={onRefPress} />
            </View>

            {/* Significance */}
            {entry.significance ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: base.textMuted }]}>Significance</Text>
                <TappableReference text={entry.significance} onRefPress={onRefPress} />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  refText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  arrow: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  section: {
    marginBottom: spacing.xs + 2,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
});
