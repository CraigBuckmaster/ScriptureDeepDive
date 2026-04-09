/**
 * PanelInfoSheet — Bottom sheet showing panel info on long-press.
 *
 * Content panels: static label + description from panelDescriptions.
 * Scholar panels: name + tradition badge + first sentence of bio + "See full bio →".
 *
 * Triggered via long-press on PanelButton (#1050).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getScholar } from '../db/content';
import { isScholarPanel } from '../utils/panelLabels';
import { PANEL_DESCRIPTIONS } from '../utils/panelDescriptions';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { Scholar } from '../types';

interface Props {
  visible: boolean;
  panelType: string | null;
  onClose: () => void;
  onGoToFullBio?: (scholarId: string) => void;
}

function getFirstSentence(text: string): string {
  // Split on '. ' to get first sentence, handle edge cases
  const match = text.match(/^[^.]+\./);
  return match ? match[0] : text;
}

export function PanelInfoSheet({ visible, panelType, onClose, onGoToFullBio }: Props) {
  const { base, getScholarColor, getPanelColors } = useTheme();
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [scholarDesc, setScholarDesc] = useState<string | null>(null);

  const isScholar = panelType ? isScholarPanel(panelType) : false;
  const contentDesc = panelType ? PANEL_DESCRIPTIONS[panelType] : null;

  // Load scholar data when needed
  useEffect(() => {
    if (!panelType || !visible || !isScholar) {
      setScholar(null);
      setScholarDesc(null);
      return;
    }
    getScholar(panelType).then((s) => {
      setScholar(s);
      // Extract description from bio_json
      if (s?.bio_json) {
        try {
          const bio = JSON.parse(s.bio_json);
          const desc = bio.description || bio.sections?.[0]?.body || '';
          setScholarDesc(desc ? getFirstSentence(desc) : null);
        } catch { setScholarDesc(null); }
      }
    }).catch(() => { setScholar(null); setScholarDesc(null); });
  }, [panelType, visible, isScholar]);

  if (!visible || !panelType) return null;

  // Determine accent color
  const accentColor = isScholar
    ? getScholarColor(panelType)
    : (getPanelColors(panelType)?.accent ?? base.gold);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close panel info"
      />
      <SafeAreaView style={[styles.sheet, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
        <View style={styles.content}>
          <View style={[styles.handle, { backgroundColor: base.textMuted }]} />

          {/* Accent bar + label */}
          <View style={styles.headerRow}>
            <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
            <Text style={[styles.label, { color: accentColor }]}>
              {isScholar ? (scholar?.name ?? panelType) : (contentDesc?.label ?? panelType)}
            </Text>
          </View>

          {/* Scholar: tradition badge */}
          {isScholar && scholar?.tradition && (
            <View style={[styles.traditionBadge, { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }]}>
              <Text style={[styles.traditionText, { color: accentColor }]}>{scholar.tradition}</Text>
            </View>
          )}

          {/* Description */}
          <Text style={[styles.description, { color: base.textDim }]}>
            {isScholar
              ? (scholarDesc ?? 'Loading...')
              : (contentDesc?.description ?? 'Study panel')
            }
          </Text>

          {/* Action hint */}
          <View style={[styles.footer, { borderTopColor: base.border }]}>
            <Text style={[styles.hint, { color: base.textMuted }]}>
              Tap the button to {isScholar ? 'read commentary' : 'open this panel'}
            </Text>
            {isScholar && onGoToFullBio && (
              <TouchableOpacity
                onPress={() => { onGoToFullBio(panelType); onClose(); }}
                accessibilityRole="button"
                accessibilityLabel="View full biography"
              >
                <Text style={[styles.fullBioLink, { color: base.gold }]}>View Bio →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    maxHeight: '45%',
  },
  content: {
    padding: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  label: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
  },
  traditionBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: spacing.sm,
    marginLeft: 12,
  },
  traditionText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  hint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  fullBioLink: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
});
