import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { ChevronRight, Copy, Share2 } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { CapturedInputs } from '../../services/guidedStudy/capturedInputs';
import type { CapturedTextRef } from '../../services/guidedStudy/stepBindings';
import { getCapturedText } from '../../services/guidedStudy/stepBindings';
import type { GuidedStudyMode } from '../../services/guidedStudy/types';
import { logger } from '../../utils/logger';

// Phase 3.1 (#1738) replaces this inline constant with an import from a
// dedicated feature-flags module. Until then the flag stays off so the
// premium-nudge footer copy reflects the structured (non-Amicus) path.
const GUIDED_STUDY_AMICUS_SYNTHESIS = false;

interface RecapSection {
  label: string;
  ref: CapturedTextRef;
}

interface RecapConfig {
  title: string;
  sections: RecapSection[];
}

const RECAP_BY_MODE: Record<GuidedStudyMode, RecapConfig> = {
  quick: {
    title: 'Your Quick Pass',
    sections: [
      { label: 'Takeaway', ref: { step: 'synthesize', key: 'takeaway' } },
      { label: 'Verse to remember', ref: { step: 'synthesize', key: 'key_connection' } },
    ],
  },
  deep: {
    title: 'Your Deep Study',
    sections: [
      { label: 'Claim', ref: { step: 'synthesize', key: 'takeaway' } },
      { label: 'Evidence', ref: { step: 'synthesize', key: 'key_connection' } },
      { label: 'Tension still unresolved', ref: { step: 'synthesize', key: 'open_question' } },
    ],
  },
  teaching: {
    title: 'Your Teaching Outline',
    sections: [
      { label: 'Audience', ref: { step: 'scene', key: 'audience' } },
      { label: 'Setting', ref: { step: 'scene', key: 'setting' } },
      { label: 'Main point', ref: { step: 'observe', key: 'main_point' } },
      { label: 'Clarification', ref: { step: 'observe', key: 'clarification' } },
      { label: 'Outline', ref: { step: 'synthesize', key: 'takeaway' } },
      { label: 'Discussion question', ref: { step: 'synthesize', key: 'open_question' } },
    ],
  },
  devotional: {
    title: 'Your Devotional',
    sections: [
      { label: 'What met you', ref: { step: 'observe', key: 'primary' } },
      { label: 'Your prayer', ref: { step: 'synthesize', key: 'takeaway' } },
      { label: 'Carrying forward', ref: { step: 'synthesize', key: 'key_connection' } },
    ],
  },
};

interface PopulatedSection {
  label: string;
  content: string;
}

function populatedSections(
  mode: GuidedStudyMode,
  captured: CapturedInputs,
): { title: string; sections: PopulatedSection[] } {
  const cfg = RECAP_BY_MODE[mode];
  const sections: PopulatedSection[] = [];
  for (const section of cfg.sections) {
    const content = getCapturedText(captured, section.ref).trim();
    if (!content) continue;
    sections.push({ label: section.label, content });
  }
  return { title: cfg.title, sections };
}

function buildPlainText(
  chapterTitle: string,
  modeTitle: string,
  sections: PopulatedSection[],
): string {
  const header = `${chapterTitle} — ${modeTitle}`;
  const body = sections.map((s) => `${s.label}:\n${s.content}`).join('\n\n');
  return `${header}\n\n${body}`;
}

const PREMIUM_FOOTER_AMICUS_ON =
  'Companion+ drafts this for you and saves it for spaced review.';
const PREMIUM_FOOTER_AMICUS_OFF =
  'Companion+ saves this for spaced review and brings it back when it matters.';

export interface SynthesisFreeRecapProps {
  mode: GuidedStudyMode;
  chapterTitle: string;
  capturedInputs: CapturedInputs;
  onUpgradeNudgePress?: () => void;
}

export function SynthesisFreeRecap({
  mode,
  chapterTitle,
  capturedInputs,
  onUpgradeNudgePress,
}: SynthesisFreeRecapProps) {
  const { base } = useTheme();
  const [copied, setCopied] = useState(false);

  const { title, sections } = useMemo(
    () => populatedSections(mode, capturedInputs),
    [mode, capturedInputs],
  );

  const plainText = useMemo(
    () => buildPlainText(chapterTitle, title, sections),
    [chapterTitle, title, sections],
  );

  const onCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      logger.warn('SynthesisFreeRecap', 'clipboard copy failed', err);
    }
  }, [plainText]);

  const onShare = useCallback(async () => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        await Clipboard.setStringAsync(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
      }
      const tmp = `${FileSystem.cacheDirectory ?? ''}guided-study-recap.txt`;
      await FileSystem.writeAsStringAsync(tmp, plainText);
      await Sharing.shareAsync(tmp, { mimeType: 'text/plain', dialogTitle: 'Share recap' });
    } catch (err) {
      logger.warn('SynthesisFreeRecap', 'share failed', err);
    }
  }, [plainText]);

  if (sections.length === 0) return null;

  const footerCopy = GUIDED_STUDY_AMICUS_SYNTHESIS
    ? PREMIUM_FOOTER_AMICUS_ON
    : PREMIUM_FOOTER_AMICUS_OFF;

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}>
      <Text style={[styles.title, { color: base.gold }]}>{title}</Text>
      {sections.map((s) => (
        <View key={s.label} style={styles.section}>
          <Text style={[styles.label, { color: base.textMuted }]}>{s.label.toUpperCase()}</Text>
          <Text style={[styles.body, { color: base.text }]}>{s.content}</Text>
        </View>
      ))}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onCopy}
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Copied to clipboard' : 'Copy recap to clipboard'}
          style={[styles.actionButton, { borderColor: base.border }]}
        >
          <Copy size={14} color={base.text} />
          <Text style={[styles.actionLabel, { color: base.text }]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share recap"
          style={[styles.actionButton, { borderColor: base.border }]}
        >
          <Share2 size={14} color={base.text} />
          <Text style={[styles.actionLabel, { color: base.text }]}>Share</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={onUpgradeNudgePress}
        accessibilityRole="button"
        accessibilityLabel="Learn about Companion Study Partner"
        style={[styles.footer, { borderTopColor: `${base.gold}25` }]}
      >
        <Text style={[styles.footerText, { color: base.gold }]}>{footerCopy}</Text>
        <ChevronRight size={14} color={base.gold} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
  },
  section: {
    gap: 2,
  },
  label: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  actionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  footerText: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
