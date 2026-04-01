/**
 * ScholarInfoSheet — Bottom sheet with scholar quick bio.
 * Triggered by ScholarTag taps. Name, tradition, eyebrow, brief bio. "See full bio →".
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getScholar } from '../db/content';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { Scholar, ScholarBio } from '../types';
import { logger } from '../utils/logger';

interface Props {
  visible: boolean;
  onClose: () => void;
  scholarId: string | null;
  onGoToFullBio?: (scholarId: string) => void;
}

export function ScholarInfoSheet({ visible, onClose, scholarId, onGoToFullBio }: Props) {
  const { base, getScholarColor } = useTheme();
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [bio, setBio] = useState<ScholarBio | null>(null);

  useEffect(() => {
    if (!scholarId || !visible) return;
    getScholar(scholarId).then((s) => {
      setScholar(s);
      if (s?.bio_json) {
        try { setBio(JSON.parse(s.bio_json)); } catch (err) { setBio(null); }
      }
    });
  }, [scholarId, visible]);

  const color = scholarId ? getScholarColor(scholarId) : base.gold;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={{
        backgroundColor: base.bgElevated, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg,
        borderTopWidth: 1, borderColor: base.border, maxHeight: '60%',
      }}>
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: base.textMuted, borderRadius: 2, marginBottom: spacing.md }} />

          {scholar ? (
            <>
              <Text style={{ color, fontFamily: fontFamily.displaySemiBold, fontSize: 18 }}>
                {scholar.name}
              </Text>
              {bio?.eyebrow && (
                <Text style={{ color: base.textDim, fontFamily: fontFamily.ui, fontSize: 13, marginTop: 4 }}>
                  {bio.eyebrow}
                </Text>
              )}
              {scholar.tradition && (
                <Text style={{ color: base.textMuted, fontFamily: fontFamily.ui, fontSize: 12, marginTop: 2 }}>
                  {scholar.tradition}
                </Text>
              )}
              {bio?.sections?.[0]?.body && (
                <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 22, marginTop: spacing.md }} numberOfLines={6}>
                  {bio.sections[0].body}
                </Text>
              )}
              {onGoToFullBio && (
                <TouchableOpacity onPress={() => { onGoToFullBio(scholarId!); onClose(); }} style={{ marginTop: spacing.md }}>
                  <Text style={{ color: base.gold, fontFamily: fontFamily.uiSemiBold, fontSize: 13 }}>See full bio →</Text>
                </TouchableOpacity>
              )}

              <Text style={{ color: base.textMuted, fontFamily: fontFamily.ui, fontSize: 10, marginTop: spacing.lg, lineHeight: 15, opacity: 0.7 }}>
                Commentary reflects paraphrased summaries of positions found in published works, not direct quotations. For exact wording, consult the original sources cited.
              </Text>
            </>
          ) : (
            <Text style={{ color: base.textMuted }}>Loading...</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
