import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react-native';
import {
  formatTrustStanceLabel,
  summarizeAmicusTrust,
} from '@/services/amicus/trust';
import type { AmicusCitation } from '@/types';
import { fontFamily, spacing, useTheme } from '@/theme';

export interface TrustFooterProps {
  citations: AmicusCitation[];
}

export default function TrustFooter({ citations }: TrustFooterProps): React.ReactElement | null {
  const { base } = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const trust = React.useMemo(
    () => summarizeAmicusTrust(citations),
    [citations],
  );

  if (!trust.hasTrustSignals) return null;

  const sourceLabel =
    trust.sourceCount === 1 ? '1 source' : `${trust.sourceCount} sources`;

  return (
    <View style={[styles.wrap, { borderTopColor: `${base.border}90` }]}>
      <Pressable
        accessibilityLabel="Show sources and stance"
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <ShieldCheck size={14} color={base.gold} />
          <Text style={[styles.headerText, { color: base.textMuted }]}>
            {sourceLabel}
          </Text>
          {trust.stance && (
            <View
              style={[
                styles.stanceBadge,
                { borderColor: `${base.gold}50`, backgroundColor: `${base.gold}18` },
              ]}
            >
              <Text style={[styles.stanceText, { color: base.gold }]}>
                {formatTrustStanceLabel(trust.stance)}
              </Text>
            </View>
          )}
        </View>
        {expanded ? (
          <ChevronUp size={14} color={base.textMuted} />
        ) : (
          <ChevronDown size={14} color={base.textMuted} />
        )}
      </Pressable>

      {expanded && (
        <View style={styles.details}>
          <Text style={[styles.detailLabel, { color: base.textMuted }]}>
            Sources
          </Text>
          <View style={styles.sourceList}>
            {trust.labels.map((label) => (
              <Text key={label} style={[styles.sourceItem, { color: base.textMuted }]}>
                {`\u2022 ${label}`}
              </Text>
            ))}
          </View>
          {trust.stance && (
            <>
              <Text style={[styles.detailLabel, { color: base.textMuted }]}>
                Stance
              </Text>
              <Text style={[styles.sourceItem, { color: base.textMuted }]}>
                This answer draws on a debated interpretation thread.
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  header: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flexShrink: 1,
  },
  headerText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyItalic,
  },
  stanceBadge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  stanceText: {
    fontSize: 10,
    fontFamily: fontFamily.uiMedium,
  },
  details: {
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: fontFamily.uiMedium,
    textTransform: 'uppercase',
  },
  sourceList: {
    gap: 2,
  },
  sourceItem: {
    fontSize: 12,
    lineHeight: 17,
  },
});
