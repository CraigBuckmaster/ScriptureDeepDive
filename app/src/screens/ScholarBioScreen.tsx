/**
 * ScholarBioScreen — Full scholar bio with sections, scope, other scholars grid.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, type DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getScholar, getAllScholars } from '../db/content';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { Scholar, ScholarBio } from '../types';
import { logger } from '../utils/logger';

export default function ScholarBioScreen() {
  const { base, getScholarColor } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ScholarBio'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'ScholarBio'>>();
  const { scholarId } = route.params ?? {};
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [bio, setBio] = useState<ScholarBio | null>(null);
  const [allScholars, setAllScholars] = useState<Scholar[]>([]);

  useEffect(() => {
    if (scholarId) {
      getScholar(scholarId).then((s) => {
        setScholar(s);
        if (s?.bio_json) try { setBio(JSON.parse(s.bio_json)); } catch (err) { logger.warn('ScholarBioScreen', 'Operation failed', err); }
      });
    }
    getAllScholars().then(setAllScholars);
  }, [scholarId]);

  const otherScholars = useMemo(
    () => allScholars.filter((s) => s.id !== scholarId).slice(0, 12),
    [allScholars, scholarId]
  );

  if (!scholar) {
    return (
      <View style={[styles.loading, { backgroundColor: base.bg }]}>
        <LoadingSkeleton lines={8} height={16} />
      </View>
    );
  }

  const color = getScholarColor(scholar.id);
  let scope: string[] | string = 'All books';
  try {
    const parsed = JSON.parse(scholar.scope_json);
    if (Array.isArray(parsed)) scope = parsed;
  } catch (err) { logger.warn('ScholarBioScreen', 'Operation failed', err); }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={scholar.name}
          subtitle={scholar.tradition ?? undefined}
          titleColor={color}
          onBack={() => navigation.goBack()}
        />
        {bio?.eyebrow && (
          <Text style={[styles.eyebrow, { color: base.textMuted }]}>{bio.eyebrow}</Text>
        )}

        <View style={[styles.divider, { backgroundColor: base.border }]} />

        {/* Bio sections */}
        {bio?.sections?.map((section: ScholarBio['sections'][number], i: number) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: base.gold }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: base.textDim }]}>{section.body}</Text>
          </View>
        ))}

        {/* Appears In */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: base.gold }]}>Appears In</Text>
          {typeof scope === 'string' ? (
            <Text style={[styles.scopeText, { color: base.textDim }]}>{scope}</Text>
          ) : (
            <View style={styles.scopeGrid}>
              {(scope as string[]).map((bookId) => (
                <TouchableOpacity
                  key={bookId}
                  onPress={() => navigation.navigate('ReadTab', { screen: 'ChapterList', params: { bookId } })}
                  style={[styles.scopeChip, { backgroundColor: color + '1A', borderColor: color + '40' }]}
                >
                  <Text style={[styles.scopeChipText, { color }]}>{bookId}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Other Scholars */}
        <Text style={[styles.othersLabel, { color: base.textMuted }]}>OTHER SCHOLARS</Text>
        <View style={styles.othersGrid}>
          {otherScholars.map((s) => {
            const sColor = getScholarColor(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => navigation.setParams({ scholarId: s.id })}
                style={[styles.otherCard, { backgroundColor: sColor + '14', borderLeftColor: sColor }]}
              >
                <Text style={[styles.otherName, { color: sColor }]}>{s.name}</Text>
                {s.tradition && (
                  <Text style={[styles.otherTradition, { color: base.textMuted }]}>{s.tradition}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
  },
  scopeText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  scopeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scopeChip: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scopeChipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  othersLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  othersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  otherCard: {
    width: '48%' as DimensionValue,
    borderLeftWidth: 3,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  otherName: {
    fontFamily: fontFamily.display,
    fontSize: 11,
  },
  otherTradition: {
    fontSize: 9,
  },
});
