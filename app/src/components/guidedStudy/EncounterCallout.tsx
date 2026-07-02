/**
 * components/guidedStudy/EncounterCallout.tsx — Longitudinal study
 * memory on the Scene step (#1843): "This is your 4th encounter with
 * covenant — in Genesis 9 you wrote…". At most ONE callout per session
 * (highest total count wins); dismissible per-session; the excerpt is
 * always the user's own text.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Repeat, X } from 'lucide-react-native';
import type { ConceptEncounterHistoryRow } from '../../db/userQueries';
import { formatChapterRef } from '../../services/guidedStudy';
import { fontFamily, radii, spacing, useTheme } from '../../theme';

const EXCERPT_MAX_CHARS = 120;
const MIN_ENCOUNTERS = 2;

export interface EncounterCalloutData {
  conceptId: string;
  conceptLabel: string;
  totalEncounters: number;
  priorChapterId: string;
  /** ≤120 chars of the user's own prior words, or null. */
  excerpt: string | null;
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function excerptOf(text: string | null): string | null {
  const cleaned = text?.replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  if (cleaned.length <= EXCERPT_MAX_CHARS) return cleaned;
  return `${cleaned.slice(0, EXCERPT_MAX_CHARS - 1).trimEnd()}…`;
}

/**
 * Pick the single callout for a session — exported for tests.
 * Qualification: total encounters across chapters ≥ 2 AND at least one
 * PRIOR chapter (≠ the session's chapter) to point back to. Highest
 * total wins; ties break toward the most recently seen concept.
 */
export function selectEncounterCallout(
  rows: ConceptEncounterHistoryRow[],
  currentChapterId: string,
): EncounterCalloutData | null {
  const byConcept = new Map<string, ConceptEncounterHistoryRow[]>();
  for (const row of rows) {
    const bucket = byConcept.get(row.concept_id) ?? [];
    bucket.push(row);
    byConcept.set(row.concept_id, bucket);
  }

  let best: EncounterCalloutData | null = null;
  let bestLastSeen = '';
  for (const bucket of byConcept.values()) {
    const total = bucket.reduce((sum, row) => sum + row.encounter_count, 0);
    if (total < MIN_ENCOUNTERS) continue;

    const prior = bucket
      .filter((row) => row.chapter_id !== currentChapterId)
      .sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at))[0];
    if (!prior) continue;

    const lastSeen = bucket
      .map((row) => row.last_seen_at)
      .sort()
      .at(-1) ?? '';
    if (
      best == null ||
      total > best.totalEncounters ||
      (total === best.totalEncounters && lastSeen > bestLastSeen)
    ) {
      best = {
        conceptId: prior.concept_id,
        conceptLabel: prior.concept_label,
        totalEncounters: total,
        priorChapterId: prior.chapter_id,
        excerpt: excerptOf(prior.prior_response),
      };
      bestLastSeen = lastSeen;
    }
  }
  return best;
}

interface Props {
  callout: EncounterCalloutData;
  onOpenChapter: (chapterId: string) => void;
  onDismiss: () => void;
}

export function EncounterCallout({ callout, onOpenChapter, onDismiss }: Props) {
  const { base } = useTheme();
  const priorRef = formatChapterRef(callout.priorChapterId);

  return (
    <View
      style={[styles.card, { backgroundColor: `${base.gold}10`, borderColor: `${base.gold}30` }]}
    >
      <TouchableOpacity
        onPress={() => onOpenChapter(callout.priorChapterId)}
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityLabel={`Your ${ordinal(callout.totalEncounters)} encounter with ${callout.conceptLabel}. Open ${priorRef}`}
        style={styles.body}
      >
        <View style={styles.titleRow}>
          <Repeat size={13} color={base.gold} />
          <Text style={[styles.title, { color: base.text }]}>
            This is your {ordinal(callout.totalEncounters)} encounter with{' '}
            <Text style={[styles.concept, { color: base.gold }]}>{callout.conceptLabel}</Text>
          </Text>
        </View>
        <Text style={[styles.detail, { color: base.textDim }]}>
          {callout.excerpt
            ? `In ${priorRef} you wrote: “${callout.excerpt}”`
            : `You last met it in ${priorRef}.`}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss encounter note"
        style={styles.dismiss}
      >
        <X size={14} color={base.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  body: {
    flex: 1,
    padding: spacing.sm,
    paddingLeft: spacing.md,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  concept: {
    fontFamily: fontFamily.uiSemiBold,
  },
  detail: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    lineHeight: 19,
  },
  dismiss: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
