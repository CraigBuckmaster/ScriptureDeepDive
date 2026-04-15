/**
 * ScholarInfoSheet — Bottom sheet with scholar quick bio.
 * Triggered by ScholarTag taps. Name, tradition, eyebrow, brief bio. "See full bio →".
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getScholar } from '../db/content';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { Scholar, ScholarBio } from '../types';

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
        try { setBio(JSON.parse(s.bio_json)); } catch { setBio(null); }
      }
    });
  }, [scholarId, visible]);

  const color = scholarId ? getScholarColor(scholarId) : base.gold;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close scholar info" />
      <SafeAreaView style={[styles.sheet, {
        backgroundColor: base.bgElevated, borderColor: base.border,
      }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.handle, { backgroundColor: base.textMuted }]} />

          {scholar ? (
            <>
              <Text style={[styles.name, { color }]}>
                {scholar.name}
              </Text>
              {bio?.eyebrow && (
                <Text style={[styles.eyebrow, { color: base.textDim }]}>
                  {bio.eyebrow}
                </Text>
              )}
              {scholar.tradition && (
                <Text style={[styles.tradition, { color: base.textMuted }]}>
                  {scholar.tradition}
                </Text>
              )}
              {bio?.sections?.[0]?.body && (
                <Text style={[styles.bioBody, { color: base.textDim }]} numberOfLines={6}>
                  {bio.sections[0].body}
                </Text>
              )}
              {onGoToFullBio && (
                <TouchableOpacity onPress={() => { onGoToFullBio(scholarId!); onClose(); }} style={styles.fullBioLink} accessibilityRole="button" accessibilityLabel="See full biography">
                  <Text style={[styles.fullBioText, { color: base.gold }]}>See full bio →</Text>
                </TouchableOpacity>
              )}

              <Text style={[styles.disclaimer, { color: base.textMuted }]}>
                Commentary reflects paraphrased summaries of positions found in published works, not direct quotations. For exact wording, consult the original sources cited.
              </Text>
            </>
          ) : (
            <Text style={[styles.loadingText, { color: base.textMuted }]}>Loading...</Text>
          )}
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
    maxHeight: '60%',
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
  name: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
  },
  eyebrow: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: 4,
  },
  tradition: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 2,
  },
  bioBody: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  fullBioLink: {
    marginTop: spacing.md,
  },
  fullBioText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  disclaimer: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: spacing.lg,
    lineHeight: 15,
    opacity: 0.7,
  },
  loadingText: {},
});
