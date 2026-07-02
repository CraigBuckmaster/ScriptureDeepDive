/**
 * components/guidedStudy/EvidencePanelSheet.tsx — In-place evidence
 * viewer for guided sessions (#1835). Kills the pogo stick: tapping an
 * evidence-trail row opens the panel's content in a pageSheet modal
 * instead of ejecting to ChapterScreen. Reuses the same PanelRenderer
 * ChapterScreen uses, so panel rendering is not forked. A footer link
 * preserves today's "open the full chapter" behavior.
 */
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ExternalLink, X } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import { PanelRenderer } from '../panels';

export interface EvidenceSheetItem {
  key: string;
  title: string;
  subtitle: string;
  panelType: string;
  sectionNum?: number;
}

interface Props {
  visible: boolean;
  item: EvidenceSheetItem | null;
  /** Panel content_json for the item, or null when it can't be located. */
  contentJson: string | null;
  onClose: () => void;
  /** Secondary escape hatch — today's navigate('Chapter', {openPanel}). */
  onOpenFullChapter: () => void;
}

export function EvidencePanelSheet({
  visible,
  item,
  contentJson,
  onClose,
  onOpenFullChapter,
}: Props) {
  const { base } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.container, { backgroundColor: base.bg }]}
        accessibilityViewIsModal
      >
        <View style={[styles.header, { borderBottomColor: base.border }]}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: base.text }]} accessibilityRole="header">
              {item?.title ?? ''}
            </Text>
            {item?.subtitle ? (
              <Text style={[styles.subtitle, { color: base.textMuted }]}>{item.subtitle}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close panel"
            style={styles.closeButton}
          >
            <X size={20} color={base.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {item && contentJson != null ? (
            <PanelRenderer panelType={item.panelType} contentJson={contentJson} />
          ) : (
            <Text style={[styles.missing, { color: base.textMuted }]}>
              This panel lives in the full chapter view.
            </Text>
          )}
        </ScrollView>

        <TouchableOpacity
          onPress={onOpenFullChapter}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel="Open full chapter"
          style={[styles.footer, { borderTopColor: base.border }]}
        >
          <ExternalLink size={14} color={base.gold} />
          <Text style={[styles.footerLabel, { color: base.gold }]}>Open full chapter</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 17,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: -spacing.xs,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  missing: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 52,
    borderTopWidth: 1,
    borderRadius: radii.sm,
  },
  footerLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
