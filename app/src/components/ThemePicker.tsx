/**
 * ThemePicker — Visual theme selector with 3 preview cards + System toggle.
 *
 * Shows mini mockups of Dark, Sepia, and Light themes. Selecting a theme
 * applies immediately. System toggle follows OS appearance (maps to dark/light).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Monitor } from 'lucide-react-native';
import { base, useTheme, spacing, radii, fontFamily } from '../theme';
import { buildPalette, type ThemeMode } from '../theme/palettes';

type ThemePreference = 'dark' | 'sepia' | 'light' | 'system';

interface Props {
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => void;
}

const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'dark', label: 'Dark' },
  { mode: 'sepia', label: 'Sepia' },
  { mode: 'light', label: 'Light' },
];

export function ThemePicker({ theme, setTheme }: Props) {
  const { base } = useTheme();
  const isSystem = theme === 'system';

  return (
    <View style={[styles.container, { borderBottomColor: base.border + '40' }]}>
      <Text style={[styles.label, { color: base.text }]}>Appearance</Text>

      <View style={styles.cardsRow}>
        {THEME_OPTIONS.map(({ mode, label }) => {
          const preview = buildPalette(mode);
          const isActive = !isSystem && theme === mode;

          return (
            <TouchableOpacity
              key={mode}
              onPress={() => setTheme(mode)}
              style={[
                styles.card,
                {
                  backgroundColor: preview.base.bg,
                  borderColor: isActive ? base.gold : preview.base.border,
                  borderWidth: isActive ? 2 : 1,
                },
              ]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${label} theme`}
            >
              {/* Mini mockup: header bar */}
              <View style={[styles.mockHeader, { backgroundColor: preview.base.gold + '30' }]}>
                <View style={[styles.mockHeaderDot, { backgroundColor: preview.base.gold }]} />
                <View style={[styles.mockHeaderLine, { backgroundColor: preview.base.gold }]} />
              </View>

              {/* Mini mockup: text lines */}
              <View style={styles.mockBody}>
                <View style={[styles.mockLine, { backgroundColor: preview.base.text, opacity: 0.6, width: '90%' }]} />
                <View style={[styles.mockLine, { backgroundColor: preview.base.text, opacity: 0.4, width: '70%' }]} />
                <View style={[styles.mockLine, { backgroundColor: preview.base.text, opacity: 0.3, width: '80%' }]} />
              </View>

              <Text
                style={[
                  styles.cardLabel,
                  { color: isActive ? base.gold : base.textDim },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* System toggle */}
      <TouchableOpacity
        onPress={() => setTheme(isSystem ? 'dark' : 'system')}
        style={[
          styles.systemRow,
          {
            backgroundColor: isSystem ? base.gold + '15' : 'transparent',
            borderColor: isSystem ? base.gold + '40' : base.border,
          },
        ]}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: isSystem }}
        accessibilityLabel="Use system appearance"
      >
        <Monitor size={14} color={isSystem ? base.gold : base.textMuted} />
        <Text style={[styles.systemLabel, { color: isSystem ? base.gold : base.textMuted }]}>
          System
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  mockHeader: {
    width: '100%',
    height: 14,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 3,
    marginBottom: 4,
  },
  mockHeaderDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  mockHeaderLine: {
    height: 2,
    flex: 1,
    borderRadius: 1,
    opacity: 0.5,
  },
  mockBody: {
    width: '100%',
    gap: 3,
    marginBottom: 6,
  },
  mockLine: {
    height: 2,
    borderRadius: 1,
  },
  cardLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  systemLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
