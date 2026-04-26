import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { ArrowRight, CheckCircle2, ChevronRight, Copy, Share2 } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { SynthesisOutputBlock } from '../../services/guidedStudy/synthesis/strategy';
import { logger } from '../../utils/logger';

export interface SynthesisFreeRecapProps {
  /** Card heading — e.g. 'Your Quick Pass'. Free path is mode-shaped. */
  title: string;
  /** Renderable descriptors from a SynthesisStrategy.run() result. */
  blocks: SynthesisOutputBlock[];
  /** Plain-text label for the source — included in clipboard/share output. */
  chapterTitle: string;
  /** Fired when a cta_button with action='upgrade' is tapped, OR when the
   *  flag-aware footer note is tapped. */
  onUpgradeNudgePress?: () => void;
  /** Fired when a cta_button with action='view_my_study' is tapped
   *  (premium_structured path, #1740). */
  onViewMyStudy?: () => void;
}

function buildPlainText(
  chapterTitle: string,
  title: string,
  recapSections: { label: string; content: string }[],
): string {
  const header = `${chapterTitle} — ${title}`;
  const body = recapSections.map((s) => `${s.label}:\n${s.content}`).join('\n\n');
  return `${header}\n\n${body}`;
}

export function SynthesisFreeRecap({
  title,
  blocks,
  chapterTitle,
  onUpgradeNudgePress,
  onViewMyStudy,
}: SynthesisFreeRecapProps) {
  const { base } = useTheme();
  const [copied, setCopied] = useState(false);

  const recapSections = useMemo(
    () =>
      blocks.flatMap((b) =>
        b.type === 'recap_section' ? [{ label: b.label, content: b.content }] : [],
      ),
    [blocks],
  );

  const plainText = useMemo(
    () => buildPlainText(chapterTitle, title, recapSections),
    [chapterTitle, title, recapSections],
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

  const handleAction = useCallback(
    (action: 'copy' | 'share' | 'upgrade' | 'view_my_study') => {
      if (action === 'copy') void onCopy();
      else if (action === 'share') void onShare();
      else if (action === 'view_my_study') onViewMyStudy?.();
      else onUpgradeNudgePress?.();
    },
    [onCopy, onShare, onUpgradeNudgePress, onViewMyStudy],
  );

  if (blocks.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}>
      <Text style={[styles.title, { color: base.gold }]}>{title}</Text>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'recap_section':
            return (
              <View key={`${block.label}-${idx}`} style={styles.section}>
                <Text style={[styles.label, { color: base.textMuted }]}>
                  {block.label.toUpperCase()}
                </Text>
                <Text style={[styles.body, { color: base.text }]}>{block.content}</Text>
              </View>
            );
          case 'cta_button': {
            const Icon =
              block.action === 'copy'
                ? Copy
                : block.action === 'share'
                  ? Share2
                  : block.action === 'view_my_study'
                    ? ArrowRight
                    : null;
            const label =
              block.action === 'copy' && copied ? 'Copied' : block.label;
            const a11yLabel =
              block.action === 'copy'
                ? copied
                  ? 'Copied to clipboard'
                  : 'Copy recap to clipboard'
                : block.action === 'share'
                  ? 'Share recap'
                  : block.action === 'view_my_study'
                    ? 'View saved review in My Study'
                    : 'Upgrade';
            return (
              <TouchableOpacity
                key={`${block.action}-${idx}`}
                onPress={() => handleAction(block.action)}
                accessibilityRole="button"
                accessibilityLabel={a11yLabel}
                style={[styles.actionButton, { borderColor: base.border }]}
              >
                {Icon ? <Icon size={14} color={base.text} /> : null}
                <Text style={[styles.actionLabel, { color: base.text }]}>{label}</Text>
              </TouchableOpacity>
            );
          }
          case 'confirmation':
            return (
              <View
                key={`confirmation-${idx}`}
                style={[
                  styles.confirmation,
                  { borderColor: `${base.gold}30`, backgroundColor: `${base.gold}10` },
                ]}
              >
                <CheckCircle2 size={14} color={base.gold} />
                <Text style={[styles.confirmationText, { color: base.text }]}>{block.text}</Text>
              </View>
            );
          case 'footer_note':
            return (
              <TouchableOpacity
                key={`footer-${idx}`}
                onPress={onUpgradeNudgePress}
                accessibilityRole="button"
                accessibilityLabel="Learn about Companion Study Partner"
                style={[styles.footer, { borderTopColor: `${base.gold}25` }]}
              >
                <Text style={[styles.footerText, { color: base.gold }]}>{block.text}</Text>
                <ChevronRight size={14} color={base.gold} />
              </TouchableOpacity>
            );
          case 'streaming_placeholder':
          case 'amicus_text':
            // Phase 4 (#1745) renders these. Skip in the structured paths.
            return null;
          default:
            return null;
        }
      })}
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  confirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  confirmationText: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
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
