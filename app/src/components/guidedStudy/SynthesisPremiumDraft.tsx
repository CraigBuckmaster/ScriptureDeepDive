import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, MessageSquare } from 'lucide-react-native';
import StreamingDot from '../amicus/StreamingDot';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { ReviewArtifact } from '../../services/guidedStudy/synthesis/strategy';

export interface SynthesisPremiumDraftProps {
  /** Mode-shaped card title — e.g. 'Your Quick Pass'. */
  title: string;
  /** Tokens accumulated so far. Empty before the first token arrives. */
  streamingText: string;
  /** True while streamChat is still emitting tokens. */
  isStreaming: boolean;
  /** Set once the response has been parsed. */
  artifact: ReviewArtifact | null;
  /** Last error from the stream, if any. */
  error?: Error | null;
  /** Tap to open the synthesis thread inside Amicus for follow-ups. */
  onOpenInAmicus?: () => void;
  /** Tap to navigate to My Study. */
  onViewMyStudy?: () => void;
}

export function SynthesisPremiumDraft({
  title,
  streamingText,
  isStreaming,
  artifact,
  error,
  onOpenInAmicus,
  onViewMyStudy,
}: SynthesisPremiumDraftProps) {
  const { base } = useTheme();
  const hasContent = streamingText.length > 0;
  const showSkeleton = isStreaming && !hasContent;

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: base.gold }]}>{title}</Text>
        {isStreaming ? <StreamingDot /> : null}
      </View>

      {showSkeleton ? (
        <View style={styles.skeletonRow}>
          <ActivityIndicator color={base.gold} />
          <Text style={[styles.skeletonText, { color: base.textDim }]}>
            Amicus is drafting from what you opened…
          </Text>
        </View>
      ) : null}

      {hasContent ? (
        <Text style={[styles.body, { color: base.text }]}>{streamingText}</Text>
      ) : null}

      {error ? (
        <Text style={[styles.errorText, { color: base.textMuted }]}>
          {error.message ||
            'Amicus could not draft this synthesis right now. Your captured input is still saved.'}
        </Text>
      ) : null}

      {!isStreaming && artifact ? (
        <View
          style={[
            styles.confirmation,
            { borderColor: `${base.gold}30`, backgroundColor: `${base.gold}10` },
          ]}
        >
          <Text style={[styles.confirmationText, { color: base.text }]}>
            Saved to your study — Amicus drafted this from what you opened.
          </Text>
        </View>
      ) : null}

      {!isStreaming && artifact ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onOpenInAmicus}
            accessibilityRole="button"
            accessibilityLabel="Open in Amicus to ask follow-ups"
            style={[styles.actionButton, { borderColor: base.border }]}
          >
            <MessageSquare size={14} color={base.text} />
            <Text style={[styles.actionLabel, { color: base.text }]}>Open in Amicus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onViewMyStudy}
            accessibilityRole="button"
            accessibilityLabel="View saved review in My Study"
            style={[styles.actionButton, { borderColor: base.border }]}
          >
            <Text style={[styles.actionLabel, { color: base.text }]}>View in My Study</Text>
            <ArrowRight size={14} color={base.text} />
          </TouchableOpacity>
        </View>
      ) : null}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skeletonText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  errorText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },
  confirmation: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  confirmationText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
});
