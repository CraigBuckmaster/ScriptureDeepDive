/**
 * AuthorshipSheet — Bottom sheet with static methodology/attribution content.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AuthorshipSheet({ visible, onClose }: Props) {
  const { base } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close about content" />
      <SafeAreaView style={[styles.sheet, {
        backgroundColor: base.bgElevated, borderColor: base.border,
      }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.handle, { backgroundColor: base.textMuted }]} />

          <Text style={[styles.title, { color: base.gold }]}>
            About This Content
          </Text>

          <Text style={[styles.bodyText, { color: base.textDim }]}>
            Companion Study presents the Bible text alongside scholarly commentary from multiple traditions —
            evangelical, reformed, Jewish, critical, and patristic. Each chapter features Hebrew/Greek word studies,
            historical context, cross-references, and curated notes from recognized scholars.
          </Text>

          <Text style={[styles.bodyText, styles.bodyGap, { color: base.textDim }]}>
            Verse text is from the NIV and ESV translations. Scholarly notes are curated summaries of published
            commentaries, not direct quotations. The theological themes radar chart uses keyword frequency analysis
            to visualize emphasis patterns.
          </Text>

          <Text style={[styles.copyright, { color: base.textMuted }]}>
            © Companion Study. All rights reserved.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: 1,
    maxHeight: '50%',
  },
  scrollContent: {
    padding: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  bodyText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 24,
  },
  bodyGap: {
    marginTop: spacing.md,
  },
  copyright: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: spacing.md,
  },
});
