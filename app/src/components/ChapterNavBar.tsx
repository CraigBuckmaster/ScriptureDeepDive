/**
 * ChapterNavBar — Sticky top bar for the chapter reading screen.
 *
 * Layout:
 *   ← BookName     [NIV]     ‹ Ch 43 ›
 *   (back/qnav)    (trans)   (prev/next)
 *
 * Left:   ArrowLeft + book name. Tap = back. Long press = QnavOverlay.
 * Center: TranslationDropdown (CompactDropdown wrapper).
 * Right:  Prev/Next arrows flanking the chapter number.
 *
 * NO CHEVRONS anywhere.
 */

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { TranslationDropdown } from './TranslationDropdown';
import { useSettingsStore } from '../stores';
import { base, spacing, fontFamily, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  bookName: string;
  chapterNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onQnav: () => void;
}

export function ChapterNavBar({
  bookName, chapterNum, hasPrev, hasNext,
  onBack, onPrev, onNext, onQnav,
}: Props) {
  const translation = useSettingsStore((s) => s.translation);
  const setTranslation = useSettingsStore((s) => s.setTranslation);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bar}>
        {/* Left: Back + Book name (long press → Qnav) */}
        <TouchableOpacity
          onPress={onBack}
          onLongPress={onQnav}
          delayLongPress={400}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Back to ${bookName} chapter list. Long press to navigate.`}
          style={styles.backButton}
        >
          <ArrowLeft size={18} color={base.gold} />
          <Text style={styles.bookName} numberOfLines={1}>{bookName}</Text>
        </TouchableOpacity>

        {/* Center: Translation dropdown */}
        <TranslationDropdown
          active={translation}
          onSelect={(t) => setTranslation(t as any)}
        />

        {/* Right: Prev / Ch N / Next */}
        <View style={styles.chapterNav}>
          <TouchableOpacity
            onPress={onPrev}
            disabled={!hasPrev}
            accessibilityLabel="Previous chapter"
            style={styles.arrowButton}
          >
            <ArrowLeft
              size={16}
              color={hasPrev ? base.gold : base.textMuted + '40'}
            />
          </TouchableOpacity>

          <Text style={styles.chapterNum}>Ch {chapterNum}</Text>

          <TouchableOpacity
            onPress={onNext}
            disabled={!hasNext}
            accessibilityLabel="Next chapter"
            style={styles.arrowButton}
          >
            <ArrowRight
              size={16}
              color={hasNext ? base.gold : base.textMuted + '40'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: base.bg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: base.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: MIN_TOUCH_TARGET,
    flex: 1,
  },
  bookName: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    flexShrink: 1,
  },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    justifyContent: 'flex-end',
  },
  arrowButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNum: {
    color: base.textDim,
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    minWidth: 40,
    textAlign: 'center',
  },
});
