/**
 * OnboardingDemo — Interactive mini-chapter demo for onboarding page 2.
 *
 * Renders Genesis 1:1–2 with 3 tappable panel buttons (Hebrew, History, Sarna).
 * Tapping a button expands real content. A pulsing hint arrow draws attention
 * to the buttons. After first tap, confirmation text replaces the hint.
 *
 * All content is statically bundled — no DB dependency (DB may not be
 * ready during first-launch onboarding).
 *
 * Part of Epic #1048 (#1055).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { spacing, radii, fontFamily, panels, scholars, type ThemePalette } from '../theme';
import { logEvent } from '../services/analytics';

// ── Static demo content (from Genesis 1, section 1) ────────────

interface DemoPanel {
  key: string;
  label: string;
  title: string;
  tradition?: string;
  color: string;
  pill?: boolean;
  content: string;
}

const DEMO_VERSES = [
  { num: 1, text: 'In the beginning God created the heavens and the earth.' },
  { num: 2, text: 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.' },
];

const DEMO_PANELS: DemoPanel[] = [
  {
    key: 'heb',
    label: 'Hebrew',
    title: 'Hebrew Word Study',
    color: panels.heb.accent,
    content: 'בְּרֵאשִׁית (bereshit) — "In the beginning." This can be read as an absolute state ("In the beginning, God created") or a construct ("When God began to create"). The ambiguity is intentional — the Hebrew opens the text to both valid readings.',
  },
  {
    key: 'hist',
    label: 'History',
    title: 'Historical Context',
    color: panels.hist.accent,
    content: 'Genesis 1 was composed against the backdrop of Babylonian and Egyptian creation myths. Unlike Enuma Elish, where creation emerges from divine conflict, Genesis presents a sovereign God who creates by speech alone — a pointed theological contrast.',
  },
  {
    key: 'sarna',
    label: 'Sarna',
    title: 'Nahum Sarna',
    tradition: 'Jewish Academic',
    color: scholars.sarna,
    pill: true,
    content: "The Hebrew stem b-r-ʾ is used in the Bible exclusively of divine activity, never of human making. This verb choice emphasizes the effortless, unparalleled nature of God's creative act — something only God can do.",
  },
];

// ── Component ──────────────────────────────────────────────────

interface Props {
  base: ThemePalette['base'];
}

export function OnboardingDemo({ base }: Props) {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  // Pulsing hint animation
  useEffect(() => {
    if (hasInteracted) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [hasInteracted, pulseAnim]);

  const handlePanelTap = (key: string) => {
    setActivePanel(activePanel === key ? null : key);
    if (!hasInteracted) {
      setHasInteracted(true);
      logEvent('onboarding_demo_panel_tap', { panelType: key });
    }
  };

  const activePanelData = DEMO_PANELS.find((p) => p.key === activePanel);

  return (
    <View style={styles.container}>
      {/* Mini verse text */}
      <View style={[styles.verseBox, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
        {DEMO_VERSES.map((v) => (
          <Text key={v.num} style={[styles.verseText, { color: base.text }]}>
            <Text style={[styles.verseNum, { color: base.textMuted }]}>{v.num} </Text>
            {v.text}{' '}
          </Text>
        ))}
      </View>

      {/* Panel buttons */}
      <View style={styles.buttonRow}>
        {DEMO_PANELS.map((p) => (
          <TouchableOpacity
            key={p.key}
            onPress={() => handlePanelTap(p.key)}
            activeOpacity={0.7}
            style={[
              styles.panelBtn,
              {
                borderColor: activePanel === p.key ? p.color : p.color + '50',
                backgroundColor: activePanel === p.key ? p.color + '20' : base.bgElevated,
                borderRadius: p.pill ? 16 : radii.md,
              },
            ]}
          >
            <Text style={[styles.panelBtnText, { color: p.color }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pulsing hint (before interaction) */}
      {!hasInteracted && (
        <Animated.View style={[styles.hintRow, { opacity: pulseAnim }]}>
          <Text style={[styles.hintText, { color: base.gold }]}>↑ Tap any button to try it</Text>
        </Animated.View>
      )}

      {/* Expanded panel content */}
      {activePanelData && (
        <View style={[styles.panelContent, {
          backgroundColor: activePanelData.color + '08',
          borderColor: activePanelData.color + '30',
        }]}>
          <View style={styles.panelHeader}>
            <View style={[styles.accentBar, { backgroundColor: activePanelData.color }]} />
            <Text style={[styles.panelTitle, { color: activePanelData.color }]}>
              {activePanelData.title}
            </Text>
          </View>
          {activePanelData.tradition && (
            <View style={[styles.traditionBadge, { backgroundColor: activePanelData.color + '15', borderColor: activePanelData.color + '30' }]}>
              <Text style={[styles.traditionText, { color: activePanelData.color }]}>
                {activePanelData.tradition}
              </Text>
            </View>
          )}
          <Text style={[styles.panelBody, { color: base.textDim }]}>
            {activePanelData.content}
          </Text>
        </View>
      )}

      {/* Confirmation after interaction */}
      {hasInteracted && !activePanelData && (
        <Text style={[styles.confirmText, { color: base.textDim }]}>
          Every passage has study buttons. Hebrew words, historical context, and scholar commentary — all one tap away.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  verseBox: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    width: '100%',
  },
  verseText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  verseNum: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  panelBtn: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  panelBtnText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  hintRow: {
    marginBottom: spacing.xs,
  },
  hintText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    textAlign: 'center',
  },
  panelContent: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    width: '100%',
    marginTop: spacing.xs,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  accentBar: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
  },
  panelTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  traditionBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 1,
    marginBottom: 4,
    marginLeft: 9,
  },
  traditionText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
  },
  panelBody: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },
  confirmText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
});
