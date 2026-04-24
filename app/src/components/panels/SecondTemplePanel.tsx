/**
 * SecondTemplePanel — Renders `st2` (Second Temple Context) panels.
 *
 * Displays NT-passage panels that cite or allude to extra-biblical Second
 * Temple literature (1 Enoch, Jubilees, Assumption of Moses, 1 Maccabees,
 * etc.). Styled distinctly from `ctx` (literary) and `hist` (historical)
 * panels so readers recognize they are looking at intertestamental
 * background rather than mainstream commentary.
 *
 * Schema: HWGTB-P1-03 (#1540). Content: HWGTB-P1-06 (#1543).
 * Premium gating follows the DebatePanel.tsx convention — props-based,
 * parent (ChapterScreen) wires `isPremium` + `onUpgradePress` from the
 * `usePremium()` hook. The panel stays decoupled from the premium store.
 */

import React, { useCallback, useState } from 'react';
import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown, ChevronRight, ScrollText } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import { TappableReference } from '../TappableReference';
import type {
  ParsedRef,
  SecondTemplePanelPayload,
  St2CitationRef,
  St2ScholarVoice,
} from '../../types';

interface Props {
  data: SecondTemplePanelPayload;
  onRefPress?: (ref: ParsedRef) => void;
  onScholarPress?: (scholarId: string) => void;
  onExtraBiblicalPress?: (extrabiblicalId: string) => void;
  /** Free-tier sees header + 2-line body teaser with a fade overlay. */
  isPremium?: boolean;
  onUpgradePress?: () => void;
}

export function SecondTemplePanel({
  data,
  onRefPress,
  onScholarPress,
  onExtraBiblicalPress,
  isPremium = true,
  onUpgradePress,
}: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('st2');
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  const locked = !isPremium;

  const handleUpgradeTap = useCallback(() => {
    onUpgradePress?.();
  }, [onUpgradePress]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          expanded ? 'Collapse Second Temple Context' : 'Expand Second Temple Context'
        }
        style={styles.header}
      >
        <ScrollText size={16} color={colors.accent} />
        <Text style={[styles.headerTitle, { color: colors.accent }]} numberOfLines={1}>
          {data.header}
        </Text>
        {expanded ? (
          <ChevronDown size={14} color={base.textMuted} />
        ) : (
          <ChevronRight size={14} color={base.textMuted} />
        )}
      </TouchableOpacity>

      {expanded ? (
        locked ? (
          <LockedBody
            text={data.body}
            onPress={handleUpgradeTap}
            accent={colors.accent}
            bg={colors.bg}
            textColor={base.textDim}
            mutedColor={base.textMuted}
          />
        ) : (
          <UnlockedBody
            data={data}
            accent={colors.accent}
            textColor={base.textDim}
            mutedColor={base.textMuted}
            goldColor={base.gold}
            onRefPress={onRefPress}
            onScholarPress={onScholarPress}
            onExtraBiblicalPress={onExtraBiblicalPress}
          />
        )
      ) : null}
    </View>
  );
}

function LockedBody({
  text,
  onPress,
  accent,
  bg,
  textColor,
  mutedColor,
}: {
  text: string;
  onPress: () => void;
  accent: string;
  bg: string;
  textColor: string;
  mutedColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Unlock Second Temple Context"
      style={styles.lockedContainer}
    >
      <View style={styles.lockedTeaser}>
        <Text
          style={[styles.body, { color: textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
        {/* Approximate a gradient fade by layering the panel bg over the
            lower portion of the teaser. Avoids a new expo-linear-gradient
            dependency, matching GoldSeparator / GlossySectionWrapper. */}
        <View
          pointerEvents="none"
          style={[
            styles.fadeOverlay,
            { backgroundColor: bg },
          ]}
        />
      </View>
      <Text style={[styles.unlockCta, { color: accent }]}>
        {'✨ Unlock Second Temple Context'}
      </Text>
      <Text style={[styles.unlockHint, { color: mutedColor }]}>
        Scholar voices, citations, and extra-biblical cross-links
      </Text>
    </Pressable>
  );
}

function UnlockedBody({
  data,
  accent,
  textColor,
  mutedColor,
  goldColor,
  onRefPress,
  onScholarPress,
  onExtraBiblicalPress,
}: {
  data: SecondTemplePanelPayload;
  accent: string;
  textColor: string;
  mutedColor: string;
  goldColor: string;
  onRefPress?: (ref: ParsedRef) => void;
  onScholarPress?: (scholarId: string) => void;
  onExtraBiblicalPress?: (id: string) => void;
}) {
  return (
    <View style={styles.bodyContainer}>
      <TappableReference
        text={data.body}
        style={[styles.body, { color: textColor }]}
        onRefPress={onRefPress}
      />

      {data.citation_refs.length > 0 ? (
        <View style={styles.citationsWrap}>
          {data.citation_refs.map((cit, i) => (
            <CitationBadge
              key={`${cit.nt}-${i}`}
              cit={cit}
              accent={accent}
              mutedColor={mutedColor}
            />
          ))}
        </View>
      ) : null}

      {data.extrabiblical_ids.length > 0 && onExtraBiblicalPress ? (
        <View style={styles.chipsWrap}>
          {data.extrabiblical_ids.map((id) => (
            <TouchableOpacity
              key={id}
              onPress={() => onExtraBiblicalPress(id)}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel={`Open ${id} detail`}
              style={[
                styles.chip,
                { borderColor: accent + '55', backgroundColor: accent + '10' },
              ]}
            >
              <Text style={[styles.chipText, { color: accent }]}>
                {formatExtrabiblicalLabel(id)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {data.scholar_voices && data.scholar_voices.length > 0 ? (
        <View style={styles.voicesContainer}>
          {data.scholar_voices.map((v, i) => (
            <ScholarVoice
              key={`${v.scholar_id}-${i}`}
              voice={v}
              goldColor={goldColor}
              textColor={textColor}
              mutedColor={mutedColor}
              onPress={onScholarPress}
            />
          ))}
        </View>
      ) : null}

      {data.takeaway ? (
        <View style={[styles.takeawayBlock, { borderLeftColor: accent }]}>
          <Text style={[styles.takeawayText, { color: textColor }]}>
            {data.takeaway}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function CitationBadge({
  cit,
  accent,
  mutedColor,
}: {
  cit: St2CitationRef;
  accent: string;
  mutedColor: string;
}) {
  const typeLabel = cit.type ? formatCitationType(cit.type) : null;
  return (
    <View
      style={[styles.badge, { borderColor: accent + '55' }]}
      accessibilityRole="text"
    >
      <Text style={[styles.badgeNt, { color: accent }]}>{cit.nt}</Text>
      {cit.source ? (
        <Text style={[styles.badgeSource, { color: mutedColor }]}>
          {cit.source}
        </Text>
      ) : null}
      {typeLabel ? (
        <Text style={[styles.badgeType, { color: mutedColor }]}>{typeLabel}</Text>
      ) : null}
    </View>
  );
}

function ScholarVoice({
  voice,
  goldColor,
  textColor,
  mutedColor,
  onPress,
}: {
  voice: St2ScholarVoice;
  goldColor: string;
  textColor: string;
  mutedColor: string;
  onPress?: (id: string) => void;
}) {
  const handlePress = () => onPress?.(voice.scholar_id);
  return (
    <View style={styles.voiceBlock}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityLabel={`Scholar: ${voice.scholar_id}`}
      >
        <Text style={[styles.voiceName, { color: goldColor }]}>
          {formatScholarLabel(voice.scholar_id)}
        </Text>
      </TouchableOpacity>
      {voice.tradition ? (
        <Text style={[styles.voiceTradition, { color: mutedColor }]}>
          {voice.tradition}
        </Text>
      ) : null}
      <Text style={[styles.voiceNote, { color: textColor }]}>{voice.note}</Text>
    </View>
  );
}

function formatExtrabiblicalLabel(id: string): string {
  return id
    .split('_')
    .map((s) => (s.length > 1 ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

function formatScholarLabel(id: string): string {
  if (!id) return '';
  return id[0].toUpperCase() + id.slice(1);
}

function formatCitationType(type: 'direct_quotation' | 'allusion' | 'echo'): string {
  switch (type) {
    case 'direct_quotation':
      return 'Direct quotation';
    case 'allusion':
      return 'Allusion';
    case 'echo':
      return 'Echo';
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  bodyContainer: {
    gap: spacing.md,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  lockedContainer: {
    gap: spacing.xs,
  },
  lockedTeaser: {
    position: 'relative',
  },
  fadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 16,
    opacity: 0.7,
  },
  unlockCta: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  unlockHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  citationsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeNt: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  badgeSource: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
    marginTop: 1,
  },
  badgeType: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 1,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  voicesContainer: {
    gap: spacing.sm,
  },
  voiceBlock: {
    gap: 2,
  },
  voiceName: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  voiceTradition: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
  },
  voiceNote: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  takeawayBlock: {
    borderLeftWidth: 2,
    paddingLeft: spacing.sm,
    paddingVertical: 2,
  },
  takeawayText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    lineHeight: 20,
  },
});
