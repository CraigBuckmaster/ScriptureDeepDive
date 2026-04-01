/**
 * ChapterNavBar — Sticky top bar for the chapter reading screen.
 *
 * Layout:
 *   ← NIV ▾       ‹ Genesis 2 ›          🔊 ⓘ
 *   (back/trans)    (prev/qnav/next)    (TTS/intro)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, Volume2 } from 'lucide-react-native';
import { CompactDropdown, type DropdownOption } from './CompactDropdown';
import { lightImpact } from '../utils/haptics';
import { base, useTheme, spacing, fontFamily, MIN_TOUCH_TARGET } from '../theme';

const TRANSLATION_OPTIONS: DropdownOption[] = [
  { key: 'niv', label: 'NIV' },
  { key: 'esv', label: 'ESV' },
  { key: 'kjv', label: 'KJV' },
  { key: 'asv', label: 'ASV' },
];

interface Props {
  bookName: string;
  chapterNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onQnav: () => void;
  onBack?: () => void;
  onIntroPress?: () => void;
  onTTSPress?: () => void;
  ttsActive?: boolean;
  translation: string;
  onTranslationChange: (t: string) => void;
}

export function ChapterNavBar({
  bookName, chapterNum, hasPrev, hasNext,
  onPrev, onNext, onQnav, onBack, onIntroPress, onTTSPress, ttsActive,
  translation, onTranslationChange,
}: Props) {
  const { base } = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: base.bg }]}>
      <View style={[styles.bar, { borderBottomColor: base.border }]}>
        {/* Left: Back + Translation */}
        <View style={styles.sideSection}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              style={styles.actionButton}
            >
              <ArrowLeft size={20} color={base.gold} />
            </TouchableOpacity>
          ) : null}
          <CompactDropdown
            value={translation}
            options={TRANSLATION_OPTIONS}
            onSelect={onTranslationChange}
          />
        </View>

        {/* Center: ‹ Genesis 2 › */}
        <View style={styles.chapterNav}>
          <TouchableOpacity
            onPress={() => { if (hasPrev) { lightImpact(); onPrev(); } }}
            disabled={!hasPrev}
            accessibilityLabel="Previous chapter"
            style={styles.arrowButton}
          >
            <ChevronLeft size={22} color={hasPrev ? base.gold : base.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onQnav}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`${bookName} ${chapterNum}. Tap to jump to another chapter.`}
            accessibilityRole="button"
            style={styles.chapterButton}
          >
            <Text style={[styles.chapterLabel, { color: base.text }]} numberOfLines={1}>
              {bookName} {chapterNum}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { if (hasNext) { lightImpact(); onNext(); } }}
            disabled={!hasNext}
            accessibilityLabel="Next chapter"
            style={styles.arrowButton}
          >
            <ChevronRight size={22} color={hasNext ? base.gold : base.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Right: TTS + ⓘ */}
        <View style={[styles.sideSection, styles.sideSectionRight]}>
          {onTTSPress ? (
            <TouchableOpacity
              onPress={onTTSPress}
              accessibilityLabel={ttsActive ? 'Stop reading aloud' : 'Read aloud'}
              accessibilityRole="button"
              style={styles.actionButton}
            >
              <Volume2 size={18} color={ttsActive ? base.gold : base.textMuted} />
            </TouchableOpacity>
          ) : null}
          {onIntroPress ? (
            <TouchableOpacity
              onPress={onIntroPress}
              accessibilityLabel="About this book"
              accessibilityRole="button"
              style={styles.actionButton}
            >
              <Info size={18} color={base.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    height: 48,
    borderBottomWidth: 1,
  },
  sideSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 2,
  },
  sideSectionRight: {
    justifyContent: 'flex-end',
  },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  arrowButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterButton: {
    paddingHorizontal: spacing.xs,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  chapterLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    textAlign: 'center',
  },
  actionButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
