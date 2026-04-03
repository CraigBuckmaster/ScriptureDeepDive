/**
 * TranslationPicker — Compact pill row for switching Bible translation.
 * Bundled translations show normally; downloadable ones show a download
 * arrow until installed, then behave identically.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { TRANSLATIONS } from '../db/translationRegistry';
import { isTranslationInstalled, downloadTranslation } from '../db/translationManager';

interface Props {
  selected: string;
  onSelect: (translation: string) => void;
}

export function TranslationPicker({ selected, onSelect }: Props) {
  const { base } = useTheme();
  const [installed, setInstalled] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const status: Record<string, boolean> = {};
      for (const t of TRANSLATIONS) {
        status[t.id] = t.bundled || await isTranslationInstalled(t.id);
      }
      if (!cancelled) setInstalled(status);
    }
    check();
    return () => { cancelled = true; };
  }, [downloading]); // re-check after downloads

  const handlePress = async (translationId: string) => {
    if (installed[translationId]) {
      onSelect(translationId);
      return;
    }
    // Not installed — download first
    setDownloading(translationId);
    try {
      await downloadTranslation(translationId);
      setDownloading(null);
      onSelect(translationId);
    } catch {
      setDownloading(null);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={[styles.scroll, { borderBottomColor: base.border, backgroundColor: base.bg }]}
    >
      {TRANSLATIONS.map((t) => {
        const isActive = t.id === selected;
        const isInstalled = t.bundled || installed[t.id];
        const isDownloading = downloading === t.id;

        return (
          <TouchableOpacity
            key={t.id}
            onPress={() => handlePress(t.id)}
            disabled={isDownloading}
            style={[
              styles.pill,
              { borderColor: base.border },
              isActive && { borderColor: base.gold, backgroundColor: base.gold + '20' },
            ]}
            activeOpacity={0.7}
          >
            {isDownloading ? (
              <ActivityIndicator size={10} color={base.gold} style={styles.downloadSpinner} />
            ) : !isInstalled ? (
              <Text style={[styles.downloadIcon, { color: base.textMuted }]}>↓ </Text>
            ) : null}
            <Text style={[
              styles.pillLabel,
              { color: base.textMuted },
              isActive && { color: base.gold },
              !isInstalled && !isDownloading && { opacity: 0.7 },
            ]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    borderBottomWidth: 1,
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  pillLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  downloadIcon: {
    fontSize: 10,
    fontFamily: fontFamily.uiMedium,
  },
  downloadSpinner: {
    marginRight: 4,
  },
});
