import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { DebateEntry } from '../../types';

interface Props {
  entries: DebateEntry[];
  onScholarPress?: (scholarId: string) => void;
  /** Enriched debate topic IDs for this chapter (from debate_topics table). */
  enrichedTopicIds?: string[];
  isPremium?: boolean;
  onDebateModePress?: (topicId: string) => void;
  onUpgradePress?: () => void;
}

export function DebatePanel({
  entries,
  onScholarPress,
  enrichedTopicIds,
  isPremium,
  onDebateModePress,
  onUpgradePress,
}: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('debate');
  if (!entries?.length) return null;

  return (
    <View style={styles.container}>
      {entries.map((d: DebateEntry & { title?: string }, i) => {
        const heading = d.topic ?? d.title ?? 'Debate';
        const positions: Array<Record<string, string>> = (d.positions as Array<Record<string, string>>) ?? [];

        return (
          <View key={i} style={styles.entryBlock}>
            <Text style={[styles.heading, { color: colors.accent }]}>
              {heading}
            </Text>
            {positions.map((p: Record<string, string>, j: number) => {
              const isLegacy = 'argument' in p;
              const label = isLegacy ? (p.name ?? 'Position') : (p.scholar ?? 'Scholar');
              const sublabel = isLegacy ? (p.proponents ?? '') : '';
              const body = isLegacy ? (p.argument ?? '') : (p.position ?? '');

              return (
                <View key={j} style={styles.positionBlock}>
                  <Text
                    style={[styles.scholarLabel, { color: base.gold }]}
                    onPress={() => !isLegacy && onScholarPress?.(label.toLowerCase())}
                  >
                    {label}
                  </Text>
                  {sublabel ? (
                    <Text style={[styles.sublabel, { color: base.textMuted }]}>
                      {sublabel}
                    </Text>
                  ) : null}
                  <Text style={[styles.body, { color: base.textDim }]}>
                    {body}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}

      {/* Debate Mode entry point */}
      {enrichedTopicIds && enrichedTopicIds.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            if (isPremium && onDebateModePress) {
              onDebateModePress(enrichedTopicIds[0]);
            } else if (onUpgradePress) {
              onUpgradePress();
            }
          }}
          activeOpacity={0.7}
          style={[
            styles.debateModeCard,
            { backgroundColor: base.gold + '10', borderColor: base.gold + '30' },
          ]}
        >
          <Text style={[styles.debateModeText, { color: base.gold }]}>
            {isPremium ? 'Explore in Debate Mode' : '\u2728 Unlock Debate Mode'}
          </Text>
          <Text style={[styles.debateModeHint, { color: base.textDim }]}>
            {enrichedTopicIds.length} topic{enrichedTopicIds.length > 1 ? 's' : ''} with in-depth scholarly analysis
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  entryBlock: {
    gap: spacing.sm,
  },
  heading: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  positionBlock: {
    gap: 4,
    paddingLeft: spacing.sm,
  },
  scholarLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  sublabel: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  debateModeCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  debateModeText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  debateModeHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 3,
  },
});
