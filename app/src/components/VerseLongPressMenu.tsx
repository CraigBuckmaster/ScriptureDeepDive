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
import { Copy, Share2, BookOpen, Highlighter, Bookmark } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { copyVerse, shareVerse } from '../utils/shareVerse';
import { logger } from '../utils/logger';

interface Props {
  visible: boolean;
  verseText: string;
  verseRef: string;
  translation?: string;
  onClose: () => void;
  onAddNote?: () => void;
  onHighlight?: () => void;
  highlightColor?: string | null;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export function VerseLongPressMenu({
  visible, verseText, verseRef, translation, onClose, onAddNote, onHighlight, highlightColor,
  onBookmark, isBookmarked,
}: Props) {
  const { base } = useTheme();
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
            <View style={[styles.sheet, { backgroundColor: base.bgElevated }]}>
              {/* Verse preview */}
              <Text style={[styles.refLabel, { color: base.gold }]} accessibilityRole="header">{verseRef}</Text>
              <Text style={[styles.preview, { color: base.textDim }]} numberOfLines={3}>{verseText}</Text>

              <View style={[styles.divider, { backgroundColor: base.border }]} />

              {/* Actions */}
              <TouchableOpacity
                style={styles.action}
                onPress={handleCopy}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={copyFeedback ? 'Copied to clipboard' : 'Copy verse to clipboard'}
              >
                <Copy size={18} color={copyFeedback ? base.gold : base.textDim} />
                <Text style={[styles.actionText, { color: base.text }, copyFeedback && { color: base.gold }]}>
                  {copyFeedback ? 'Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.action}
                onPress={handleShare}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Share verse"
              >
                <Share2 size={18} color={base.textDim} />
                <Text style={[styles.actionText, { color: base.text }]}>Share</Text>
              </TouchableOpacity>

              {onBookmark && (
                <TouchableOpacity
                  style={styles.action}
                  onPress={() => { onClose(); onBookmark(); }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
                >
                  <Bookmark size={18} color={isBookmarked ? base.gold : base.textDim} fill={isBookmarked ? base.gold : 'none'} />
                  <Text style={[styles.actionText, { color: base.text }, isBookmarked && { color: base.gold }]}>
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Text>
                </TouchableOpacity>
              )}

              {onHighlight && (
                <TouchableOpacity
                  style={styles.action}
                  onPress={() => { onClose(); onHighlight(); }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={highlightColor ? 'Change verse highlight color' : 'Highlight verse'}
                >
                  <Highlighter size={18} color={highlightColor ? highlightColor : base.textDim} />
                  <Text style={styles.actionText}>{highlightColor ? 'Change Highlight' : 'Highlight'}</Text>
                </TouchableOpacity>
              )}

              {onAddNote && (
                <TouchableOpacity
                  style={styles.action}
                  onPress={handleNote}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Add a note to this verse"
                >
                  <BookOpen size={18} color={base.textDim} />
                  <Text style={[styles.actionText, { color: base.text }]}>Add Note</Text>
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
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  refLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  preview: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  actionText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
  },
});
