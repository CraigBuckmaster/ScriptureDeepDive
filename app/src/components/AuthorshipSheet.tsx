/**
 * AuthorshipSheet — Bottom sheet with static methodology/attribution content.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { base, spacing, radii } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AuthorshipSheet({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={{
        backgroundColor: base.bgElevated, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg,
        borderTopWidth: 1, borderColor: base.border, maxHeight: '50%',
      }}>
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: base.textMuted, borderRadius: 2, marginBottom: spacing.md }} />

          <Text style={{ color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 16, marginBottom: spacing.md }}>
            About This Content
          </Text>

          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, lineHeight: 24 }}>
            Scripture Deep Dive presents the Bible text alongside scholarly commentary from multiple traditions —
            evangelical, reformed, Jewish, critical, and patristic. Each chapter features Hebrew/Greek word studies,
            historical context, cross-references, and curated notes from recognized scholars.
          </Text>

          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, lineHeight: 24, marginTop: spacing.md }}>
            Verse text is from the NIV and ESV translations. Scholarly notes are curated summaries of published
            commentaries, not direct quotations. The theological themes radar chart uses keyword frequency analysis
            to visualize emphasis patterns.
          </Text>

          <Text style={{ color: base.textMuted, fontFamily: 'SourceSans3_400Regular', fontSize: 12, marginTop: spacing.md }}>
            © Scripture Deep Dive. All rights reserved.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
