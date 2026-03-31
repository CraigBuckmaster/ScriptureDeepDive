/**
 * VerseLongPressMenu — Context menu shown on long-press of a verse.
 *
 * Actions: Copy to clipboard · Share · Add Note
 * Appears as a bottom sheet overlay with a dimmed backdrop.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Copy, Share2, BookOpen } from 'lucide-react-native';
import { base, spacing, radii, fontFamily } from '../theme';
import { copyVerse, shareVerse } from '../utils/shareVerse';
import { logger } from '../utils/logger';

interface Props {
  visible: boolean;
  verseText: string;
  verseRef: string;
  translation?: string;
  onClose: () => void;
  onAddNote?: () => void;
}

export function VerseLongPressMenu({
  visible, verseText, verseRef, translation, onClose, onAddNote,
}: Props) {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopy = async () => {
    try {
      await copyVerse(verseText, verseRef, translation);
      setCopyFeedback(true);
      setTimeout(() => {
        setCopyFeedback(false);
        onClose();
      }, 1000);
    } catch (err) {
      logger.warn('VerseLongPressMenu', 'Copy failed', err);
      onClose();
    }
  };

  const handleShare = async () => {
    onClose();
    try {
      await shareVerse(verseText, verseRef, translation);
    } catch (err) {
      logger.warn('VerseLongPressMenu', 'Share failed', err);
    }
  };

  const handleNote = () => {
    onClose();
    onAddNote?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Verse preview */}
              <Text style={styles.refLabel}>{verseRef}</Text>
              <Text style={styles.preview} numberOfLines={3}>{verseText}</Text>

              <View style={styles.divider} />

              {/* Actions */}
              <TouchableOpacity style={styles.action} onPress={handleCopy} activeOpacity={0.7}>
                <Copy size={18} color={copyFeedback ? base.gold : base.textDim} />
                <Text style={[styles.actionText, copyFeedback && styles.actionTextActive]}>
                  {copyFeedback ? 'Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.action} onPress={handleShare} activeOpacity={0.7}>
                <Share2 size={18} color={base.textDim} />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>

              {onAddNote && (
                <TouchableOpacity style={styles.action} onPress={handleNote} activeOpacity={0.7}>
                  <BookOpen size={18} color={base.textDim} />
                  <Text style={styles.actionText}>Add Note</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: base.bgElevated,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  refLabel: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  preview: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: base.border,
    marginVertical: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  actionText: {
    color: base.text,
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
  },
  actionTextActive: {
    color: base.gold,
  },
});
