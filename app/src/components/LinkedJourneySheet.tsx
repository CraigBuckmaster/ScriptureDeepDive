/**
 * LinkedJourneySheet — Bottom sheet that presents a linked journey inline
 * when tapping a stop_type: 'linked_journey' stop.
 */

import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, BackHandler } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useJourney } from '../hooks/useJourney';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { JourneyStop } from '../types';

interface Props {
  visible: boolean;
  linkedJourneyId: string | null;
  linkedJourneyIntro: string | null;
  onClose: () => void;
  onNavigateToChapter: (bookId: string, chapterNum: number, verseNum?: number) => void;
}

function extractVerseNum(ref: string | null): number | undefined {
  if (!ref) return undefined;
  const m = ref.match(/:(\d+)/);
  return m ? parseInt(m[1], 10) : undefined;
}

export function LinkedJourneySheet({
  visible, linkedJourneyId, linkedJourneyIntro,
  onClose, onNavigateToChapter,
}: Props) {
  const { base } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const { journey, stops, isLoading } = useJourney(visible ? linkedJourneyId : null);

  const snapPoints = useMemo(() => ['70%', '95%'], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  // Android back button closes sheet
  useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [visible, onClose]);

  const handleStopPress = useCallback((stop: JourneyStop) => {
    if (stop.book_id && stop.chapter_num) {
      onNavigateToChapter(stop.book_id, stop.chapter_num, extractVerseNum(stop.ref));
    }
  }, [onNavigateToChapter]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: base.bgElevated }}
      handleIndicatorStyle={{ backgroundColor: base.textMuted, width: 40 }}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          {journey && (
            <>
              <Text style={[styles.title, { color: base.text }]} numberOfLines={1}>
                {journey.title}
              </Text>
              {journey.subtitle && (
                <Text style={[styles.subtitle, { color: base.textMuted }]} numberOfLines={1}>
                  {journey.subtitle}
                </Text>
              )}
              {journey.lens_id && (
                <View style={[styles.lensBadge, { backgroundColor: base.gold + '20' }]}>
                  <Text style={[styles.lensText, { color: base.gold }]}>
                    {journey.lens_id.replace(/_/g, ' ')}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={8}
          accessibilityLabel="Close linked journey"
          accessibilityRole="button"
        >
          <X size={20} color={base.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {linkedJourneyIntro && (
          <Text style={[styles.intro, { color: base.text }]}>
            {linkedJourneyIntro}
          </Text>
        )}

        {isLoading && (
          <Text style={[styles.loading, { color: base.textMuted }]}>Loading...</Text>
        )}

        {stops.map((stop) => {
          if (stop.stop_type === 'linked_journey') return null;

          return (
            <View key={stop.stop_order} style={styles.stopRow}>
              <View style={styles.spine}>
                <View style={[styles.dot, { backgroundColor: base.gold }]} />
                {stop.stop_order < stops.length && (
                  <View style={[styles.line, { backgroundColor: base.border }]} />
                )}
              </View>
              <TouchableOpacity
                style={[styles.stopCard, { backgroundColor: base.bg, borderColor: base.border }]}
                onPress={() => handleStopPress(stop)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${stop.label}: ${stop.ref}`}
              >
                {stop.ref && (
                  <Text style={[styles.stopRef, { color: base.gold }]}>{stop.ref}</Text>
                )}
                {stop.label && (
                  <Text style={[styles.stopLabel, { color: base.text }]}>{stop.label}</Text>
                )}
                {stop.development && (
                  <Text style={[styles.stopDev, { color: base.textMuted }]} numberOfLines={4}>
                    {stop.development}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3333',
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.body,
    fontSize: 18,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: 2,
  },
  lensBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginTop: 6,
  },
  lensText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  closeBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  intro: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    lineHeight: 21,
    marginVertical: spacing.md,
    fontStyle: 'italic',
  },
  loading: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  stopRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  spine: {
    width: 24,
    alignItems: 'center',
    paddingTop: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  stopCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  stopRef: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    marginBottom: 4,
  },
  stopLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    marginBottom: 4,
  },
  stopDev: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 19,
  },
});
