/**
 * BottomBar — Sticky bottom: ← Prev | NIV ↔ ESV | Next →
 */

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSettingsStore } from '../stores';
import { base, spacing, radii, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function BottomBar({ hasPrev, hasNext, onPrev, onNext }: Props) {
  const translation = useSettingsStore((s) => s.translation);
  const setTranslation = useSettingsStore((s) => s.setTranslation);

  return (
    <SafeAreaView style={{ backgroundColor: base.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, height: 48,
        borderTopWidth: 1, borderTopColor: base.border,
      }}>
        {/* Prev */}
        <TouchableOpacity
          onPress={onPrev} disabled={!hasPrev}
          accessibilityLabel="Previous chapter"
          style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' }}
        >
          <Text style={{ color: hasPrev ? base.gold : base.textMuted + '40', fontSize: 14 }}>← Prev</Text>
        </TouchableOpacity>

        {/* Translation toggle */}
        <View style={{
          flexDirection: 'row', backgroundColor: base.bgElevated,
          borderRadius: radii.pill, borderWidth: 1, borderColor: base.border,
        }}>
          {(['niv', 'esv'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTranslation(t)}
              accessibilityLabel={`Switch to ${t.toUpperCase()}`}
              accessibilityState={{ selected: translation === t }}
              style={{
                paddingHorizontal: 16, paddingVertical: 6,
                backgroundColor: translation === t ? base.gold + '30' : 'transparent',
                borderRadius: radii.pill,
              }}
            >
              <Text style={{
                color: translation === t ? base.gold : base.textMuted,
                fontFamily: 'SourceSans3_600SemiBold', fontSize: 12,
              }}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next */}
        <TouchableOpacity
          onPress={onNext} disabled={!hasNext}
          accessibilityLabel="Next chapter"
          style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'flex-end' }}
        >
          <Text style={{ color: hasNext ? base.gold : base.textMuted + '40', fontSize: 14 }}>Next →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
