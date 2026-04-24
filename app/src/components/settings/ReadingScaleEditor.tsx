/**
 * ReadingScaleEditor — Settings editor for reading text size.
 *
 * Segmented control (8 stops between 0.85× and 1.60×) with a live
 * preview card showing a section header, a sample verse, a commentary
 * snippet, and a chrome sample row. The chrome sample uses
 * `typography.chrome.*` so users can see that chrome size doesn't move
 * when the slider does — only content scales.
 *
 * See epic #1639 for the content/chrome split.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PixelRatio } from 'react-native';
import { useTheme, spacing, radii, fontFamily, useTypography, useOsFontScale, READING_SCALE_DEFAULT } from '../../theme';
import { useSettingsStore } from '../../stores';

/** 8 perceptually-graded stops between MIN (0.85) and MAX (1.60). */
const STOPS = [0.85, 0.90, 1.00, 1.10, 1.20, 1.35, 1.50, 1.60] as const;

function formatScale(n: number): string {
  // Trim trailing zeros on whole values ("1.0×" → "1×") but keep 2 dp
  // on in-between stops so the readout stays readable.
  if (Math.abs(n - Math.round(n)) < 0.005) return `${Math.round(n)}×`;
  return `${n.toFixed(2).replace(/0$/, '')}×`;
}

/** Closest stop to a given value — guards against fp drift after migration. */
function closestStop(value: number): number {
  let best: number = STOPS[0];
  let bestDelta = Math.abs(value - best);
  for (const s of STOPS) {
    const d = Math.abs(value - s);
    if (d < bestDelta) { best = s; bestDelta = d; }
  }
  return best;
}

interface Props {
  /** Optional — test override for `PixelRatio.getFontScale()`. */
  osScaleOverride?: number;
}

export function ReadingScaleEditor({ osScaleOverride }: Props = {}) {
  const { base } = useTheme();
  const typography = useTypography();
  const liveOsScale = useOsFontScale();
  const osScale = osScaleOverride ?? liveOsScale;
  const readingScale = useSettingsStore((s) => s.readingScale);
  const setReadingScale = useSettingsStore((s) => s.setReadingScale);

  const activeStop = closestStop(readingScale);
  const osLargeNote = osScale > 1.5;

  return (
    <View style={styles.container}>
      <View style={styles.readoutRow}>
        <Text style={[styles.readoutPrimary, { color: base.text }]}>
          Reading size: {formatScale(readingScale)}
        </Text>
        {readingScale !== READING_SCALE_DEFAULT && (
          <TouchableOpacity
            onPress={() => setReadingScale(READING_SCALE_DEFAULT)}
            accessibilityRole="button"
            accessibilityLabel="Reset reading size to default"
          >
            <Text style={[styles.resetText, { color: base.gold }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.readoutSecondary, { color: base.textMuted }]}>
        Device text size: {formatScale(osScale)} · Effective: {formatScale(typography.effective.content)} (content)
      </Text>

      {osLargeNote && (
        <Text style={[styles.osNote, { color: base.textDim }]}>
          Your device is set to a large text size. The app is honoring that setting.
        </Text>
      )}

      <View
        style={[styles.segmented, { backgroundColor: base.bgElevated, borderColor: base.border }]}
        accessibilityRole="adjustable"
        accessibilityLabel="Reading size"
        accessibilityValue={{ text: formatScale(readingScale) }}
      >
        {STOPS.map((stop) => {
          const active = stop === activeStop;
          return (
            <TouchableOpacity
              key={stop}
              onPress={() => setReadingScale(stop)}
              style={[
                styles.segment,
                active && { backgroundColor: base.gold + '25' },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Reading size ${formatScale(stop)}`}
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: active ? base.gold : base.textMuted },
                ]}
              >
                {formatScale(stop)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Live preview */}
      <View
        style={[styles.preview, { backgroundColor: base.bgElevated, borderColor: base.border }]}
        accessibilityLabel="Reading size preview"
      >
        <Text style={[typography.content.displayLg, { color: base.gold }]}>
          In the Beginning
        </Text>
        <Text style={[typography.content.bodyLg, styles.previewVerse, { color: base.text }]}>
          In the beginning, God created the heavens and the earth.
        </Text>
        <Text style={[typography.content.bodyMd, styles.previewCommentary, { color: base.textDim }]}>
          Calvin: &ldquo;The simple and genuine sense, which will best agree with the
          meaning of Moses, is that God, by the power of his Word and Spirit,
          created out of nothing the heaven and the earth.&rdquo;
        </Text>
        <View style={[styles.chromeRow, { borderTopColor: base.border }]}>
          <Text style={[typography.chrome.uiBold, { color: base.textMuted }]}>
            Chrome stays the same →
          </Text>
          <View style={[styles.chip, { backgroundColor: base.gold + '15', borderColor: base.gold + '40' }]}>
            <Text style={[typography.chrome.uiSm, { color: base.gold }]}>chip</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Preserved for tests that probe segmentation logic.
export const READING_SCALE_STOPS = STOPS;

/** @internal */
export const _internal = { closestStop, formatScale };

// Expose PixelRatio for tests that want to mock module-scope fallbacks.
export const _pixelRatio = PixelRatio;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  readoutPrimary: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  resetText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  readoutSecondary: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  osNote: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    marginTop: 2,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 2,
    marginTop: spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  segmentText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  preview: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  previewVerse: {
    marginTop: spacing.xs,
  },
  previewCommentary: {
    fontFamily: fontFamily.bodyItalic,
    marginTop: spacing.xs,
  },
  chromeRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
});
