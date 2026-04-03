/**
 * ParallelDetailScreen — Full parallel comparison view.
 *
 * Shows all Gospel accounts for a synoptic entry simultaneously as
 * stacked cards, with diff annotations below.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getSynopticEntry } from '../db/content';
import { parseReference, resolveVersesWithNumbers, type ResolvedVerse } from '../utils/verseResolver';
import { useSettingsStore } from '../stores';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { GospelPassageCard } from '../components/GospelPassageCard';
import { GOSPEL_CONFIG } from '../components/GospelDots';
import { DiffAnnotationList, normalizeDiffAnnotation } from '../components/DiffAnnotation';
import type { DiffAnnotationData } from '../components/DiffAnnotation';
import { useTheme, spacing, fontFamily } from '../theme';
import type { SynopticEntry } from '../types';
import { logger } from '../utils/logger';

interface Passage {
  book: string;
  ref: string;
}

export default function ParallelDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ParallelDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'ParallelDetail'>>();
  const { entryId } = route.params;
  const translation = useSettingsStore((s) => s.translation);

  const [entry, setEntry] = useState<SynopticEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passageTexts, setPassageTexts] = useState<Record<string, ResolvedVerse[]>>({});

  // Load entry
  useEffect(() => {
    getSynopticEntry(entryId).then((e) => {
      setEntry(e);
      setIsLoading(false);
    });
  }, [entryId]);

  // Resolve verse texts for all passages
  useEffect(() => {
    if (!entry) return;
    let cancelled = false;

    let passages: Passage[] = [];
    try { passages = JSON.parse(entry.passages_json); } catch { /* */ }

    Promise.all(
      passages.map(async (p) => {
        const parsed = parseReference(p.ref);
        if (!parsed) return { book: p.book, verses: [] as ResolvedVerse[] };
        const verses = await resolveVersesWithNumbers(parsed, translation);
        return { book: p.book, verses };
      })
    ).then((results) => {
      if (cancelled) return;
      const texts: Record<string, ResolvedVerse[]> = {};
      for (const r of results) texts[r.book] = r.verses;
      setPassageTexts(texts);
    });

    return () => { cancelled = true; };
  }, [entry, translation]);

  if (isLoading || !entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Parallel Passage" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}>
          {isLoading ? <LoadingSkeleton lines={8} /> : (
            <Text style={[styles.notFound, { color: base.textMuted }]}>Passage not found</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  let passages: Passage[] = [];
  try { passages = JSON.parse(entry.passages_json); } catch { /* */ }

  let diffAnnotations: DiffAnnotationData[] = [];
  try {
    const rawAnnotations = JSON.parse(entry.diff_annotations_json || '[]');
    diffAnnotations = rawAnnotations.map(normalizeDiffAnnotation);
  } catch { /* */ }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title={entry.title} onBack={() => navigation.goBack()} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Gospel passage cards */}
        {passages.map((p, idx) => {
          const cfg = GOSPEL_CONFIG[p.book];
          const gospelName = cfg?.name ?? p.book.charAt(0).toUpperCase() + p.book.slice(1);
          const color = cfg?.color ?? base.gold;
          const parsed = parseReference(p.ref);

          return (
            <GospelPassageCard
              key={`${p.book}-${idx}`}
              gospelName={gospelName}
              passageRef={p.ref}
              verses={passageTexts[p.book] ?? []}
              color={color}
              onNavigate={() => {
                if (parsed) {
                  navigation.navigate('Chapter', {
                    bookId: parsed.bookId,
                    chapterNum: parsed.chapter,
                  });
                }
              }}
            />
          );
        })}

        {/* Diff annotations with Gospel name labels */}
        {diffAnnotations.length > 0 && (
          <DiffAnnotationList annotations={diffAnnotations} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  loadingPad: { padding: spacing.lg },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  notFound: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
  },
});
