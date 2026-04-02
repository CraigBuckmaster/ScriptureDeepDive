/**
 * AuthorshipSheet — Bottom sheet with static methodology/attribution content.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
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
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close about content" />
      <SafeAreaView style={{
        backgroundColor: base.bgElevated, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg,
        borderTopWidth: 1, borderColor: base.border, maxHeight: '50%',
      }}>
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: base.textMuted, borderRadius: 2, marginBottom: spacing.md }} />

          <Text style={{ color: base.gold, fontFamily: fontFamily.displayMedium, fontSize: 16, marginBottom: spacing.md }}>
            About This Content
          </Text>

          <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 24 }}>
            Companion Study presents the Bible text alongside scholarly commentary from multiple traditions —
            evangelical, reformed, Jewish, critical, and patristic. Each chapter features Hebrew/Greek word studies,
            historical context, cross-references, and curated notes from recognized scholars.
          </Text>

          <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 24, marginTop: spacing.md }}>
            Verse text is from the NIV and ESV translations. Scholarly notes are curated summaries of published
            commentaries, not direct quotations. The theological themes radar chart uses keyword frequency analysis
            to visualize emphasis patterns.
          </Text>

          <Text style={{ color: base.textMuted, fontFamily: fontFamily.ui, fontSize: 12, marginTop: spacing.md }}>
            © Companion Study. All rights reserved.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
