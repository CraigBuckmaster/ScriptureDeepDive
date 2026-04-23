/**
 * ExtraBiblicalHero — Header block for ExtraBiblicalDetailScreen
 * (HWGTB-P2-03 / #1548). Shows title, also-known-as aliases, dates /
 * language, and the 4-tradition status row.
 *
 * Kept as a standalone component per the issue's file layout so the
 * screen stays thin and the hero can be reused if a card-style preview
 * is ever needed elsewhere (e.g. CanonComparisonScreen).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type {
  ExtrabiblicalEntry,
  ExtrabiblicalTraditionStatus,
} from '../types';

interface Props {
  entry: ExtrabiblicalEntry;
}

const TRADITION_ROW: Array<{
  key: keyof ExtrabiblicalTraditionStatus;
  short: string;
  full: string;
}> = [
  { key: 'protestant', short: 'Prot', full: 'Protestant' },
  { key: 'catholic', short: 'Cath', full: 'Catholic' },
  { key: 'eastern_orthodox', short: 'EO', full: 'Eastern Orthodox' },
  { key: 'ethiopian_tewahedo', short: 'Eth', full: 'Ethiopian Tewahedo' },
];

type TraditionClass = 'in' | 'out' | 'partial';

function classifyStatus(value: string): TraditionClass {
  const v = value.toLowerCase();
  if (
    /canonical|included|accepted|scripture|deuterocanon/.test(v) &&
    !/not\s/.test(v)
  ) {
    return 'in';
  }
  if (/not\s|excluded|reject|apocryph|outside|noncanonical|non-canonical/.test(v)) {
    return 'out';
  }
  return 'partial';
}

function statusSymbol(cls: TraditionClass): string {
  switch (cls) {
    case 'in':
      return '✓';
    case 'out':
      return '✗';
    case 'partial':
      return '~';
  }
}

export function ExtraBiblicalHero({ entry }: Props) {
  const { base } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: base.bgElevated }]}>
      <Text style={[styles.title, { color: base.text }]}>{entry.title}</Text>
      {entry.also_known_as.length > 0 ? (
        <Text style={[styles.aliases, { color: base.textDim }]} numberOfLines={2}>
          {'Also known as: ' + entry.also_known_as.join(' · ')}
        </Text>
      ) : null}

      {(entry.estimated_date || entry.original_language) ? (
        <View style={styles.metaRow}>
          {entry.estimated_date ? (
            <View style={[styles.metaChip, { borderColor: base.gold + '40' }]}>
              <Text style={[styles.metaLabel, { color: base.textMuted }]}>DATE</Text>
              <Text style={[styles.metaValue, { color: base.text }]}>
                {entry.estimated_date}
              </Text>
            </View>
          ) : null}
          {entry.original_language ? (
            <View style={[styles.metaChip, { borderColor: base.gold + '40' }]}>
              <Text style={[styles.metaLabel, { color: base.textMuted }]}>LANGUAGE</Text>
              <Text style={[styles.metaValue, { color: base.text }]}>
                {entry.original_language}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.traditionRow}>
        {TRADITION_ROW.map((t) => {
          const raw = entry.tradition_status[t.key] ?? '';
          const cls = classifyStatus(raw);
          const color =
            cls === 'in' ? base.gold : cls === 'out' ? base.textMuted : base.textDim;
          return (
            <View
              key={t.key}
              accessibilityLabel={`${t.full}: ${raw || 'unspecified'}`}
              style={[styles.traditionBadge, { borderColor: color + '55' }]}
            >
              <Text style={[styles.traditionLabel, { color }]}>
                {t.short} {statusSymbol(cls)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  aliases: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaChip: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  metaLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  metaValue: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    marginTop: 1,
  },
  traditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  traditionBadge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  traditionLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
  },
});
