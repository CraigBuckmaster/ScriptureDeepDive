/**
 * HowWeGotTheBibleLandingScreen — Landing page for the "How We Got The
 * Bible" content bundle (HWGTB-P2-04 / #1549). Entry point into the
 * Extra-Biblical Index, Canon Comparison, and the two guided journeys.
 *
 * Full-screen Stack screen (not a modal / bottom sheet). Reached from
 * the Explore hero card.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, BookOpen, Scale, Map, BookCopy, Languages } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { useExploreImages } from '../hooks/useExploreImages';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import type { ScreenNavProp } from '../navigation/types';

type Nav = ScreenNavProp<'Explore', 'HowWeGotTheBibleLanding'>;

interface LandingEntry {
  key: string;
  title: string;
  description: string;
  Icon: typeof BookOpen;
  /** When undefined the entry is rendered as "Coming soon" (no navigation). */
  onPress?: () => void;
}

function HowWeGotTheBibleLandingScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const imageRegistry = useExploreImages();
  const heroImage = imageRegistry.HowWeGotTheBible?.images?.[0];

  const goExtraBiblicalIndex = useCallback(() => {
    navigation.navigate('ExtraBiblicalIndex');
  }, [navigation]);

  const goCanonComparison = useCallback(() => {
    navigation.navigate('CanonComparison');
  }, [navigation]);

  // Direct navigation to the two HWGTB-specific journeys. The journey
  // content already exists at content/meta/journeys/thematic/{slug}.json
  // and JourneyDetail accepts { journeyId } per navigation/types.ts —
  // so the bundle surfaces curated, specific destinations rather than
  // bouncing the user back to the generic JourneyBrowse.
  const goCanonFormationJourney = useCallback(() => {
    navigation.navigate('JourneyDetail', { journeyId: 'canon-formation' });
  }, [navigation]);

  const goTextAndTranslationJourney = useCallback(() => {
    navigation.navigate('JourneyDetail', { journeyId: 'text-and-translation' });
  }, [navigation]);

  // Escape hatch — for users whose interest was piqued by the topic
  // and want to see the rest of the journey library. Default tab,
  // no filter, so they get the full 60+ journeys.
  const goAllJourneys = useCallback(() => {
    navigation.navigate('JourneyBrowse', undefined);
  }, [navigation]);

  const entries: LandingEntry[] = [
    {
      key: 'extrabiblical',
      title: 'Extra-Biblical Literature',
      description:
        '1 Enoch, Jubilees, Tobit, the Dead Sea Scrolls — the books Jude and Peter quoted, set in their Second Temple context.',
      Icon: BookOpen,
      onPress: goExtraBiblicalIndex,
    },
    {
      key: 'canon-comparison',
      title: 'Canon Comparison',
      description:
        'Protestant, Catholic, Orthodox, and Ethiopian canons side by side — where traditions agree, where they differ, and why.',
      Icon: Scale,
      onPress: goCanonComparison,
    },
    {
      key: 'canon-formation',
      title: 'Canon Formation',
      description:
        'A 12-stop journey from oral tradition to Trent — how the 66 (or 73, or 76, or 81) books were written, collected, debated, and recognized as Scripture.',
      Icon: BookCopy,
      onPress: goCanonFormationJourney,
    },
    {
      key: 'text-and-translation',
      title: 'Text & Translation',
      description:
        'From manuscripts to your Bible — 2,000 years of scribes, monks, printers, and reformers in 10 stops.',
      Icon: Languages,
      onPress: goTextAndTranslationJourney,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: base.gold }]} numberOfLines={1}>
          How We Got The Bible
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {heroImage ? (
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: heroImage.url }}
              style={styles.heroImage}
              contentFit="cover"
              accessibilityLabel={heroImage.caption ?? 'How We Got The Bible'}
              transition={200}
            />
            {heroImage.credit ? (
              <Text style={[styles.heroCredit, { color: base.textMuted }]}>
                {heroImage.credit}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.introBlock}>
          <Text style={[styles.introText, { color: base.text }]}>
            How did we get the Bible we read today? This bundle follows the
            canon through 1,500 years of scribes, councils, and translators —
            the books that made the cut, the books that didn&apos;t, and the
            Second Temple Jewish writings the New Testament authors knew and
            quoted.
          </Text>
          <Text style={[styles.introText, { color: base.textDim }]}>
            Evangelical in framing, fair to the Catholic, Orthodox, and
            Ethiopian traditions, and honest about what scholarship actually
            says — including where it disagrees.
          </Text>
        </View>

        <View style={styles.entriesBlock}>
          {entries.map((e) => (
            <LandingEntryCard key={e.key} entry={e} />
          ))}
        </View>

        <EscapeHatchRow onPress={goAllJourneys} />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Subtle "see more like this" affordance below the curated entries.
 * Visually lighter than the primary cards so it reads as a contextual
 * suggestion rather than a peer entry — for users whose interest in
 * the topic warrants a look at the wider journey library.
 */
function EscapeHatchRow({ onPress }: { onPress: () => void }) {
  const { base } = useTheme();
  return (
    <View
      style={[
        styles.escapeHatchSection,
        { borderTopColor: base.gold + '20' },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Browse all guided journeys"
        style={styles.escapeHatch}
      >
        <Map size={14} color={base.textMuted} />
        <Text style={[styles.escapeHatchText, { color: base.textMuted }]}>
          Browse all guided journeys
        </Text>
        <ChevronRight size={14} color={base.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

function LandingEntryCard({ entry }: { entry: LandingEntry }) {
  const { base } = useTheme();
  const locked = !entry.onPress;
  const Container = locked ? View : TouchableOpacity;

  return (
    <Container
      {...(locked
        ? {}
        : {
            onPress: entry.onPress,
            activeOpacity: 0.7,
            accessibilityRole: 'button' as const,
            accessibilityLabel: `Open ${entry.title}`,
          })}
      style={[
        styles.entryCard,
        {
          backgroundColor: base.bgElevated,
          borderColor: base.gold + (locked ? '20' : '40'),
          opacity: locked ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: base.gold + '18', borderColor: base.gold + '40' },
        ]}
      >
        <entry.Icon size={18} color={base.gold} />
      </View>
      <View style={styles.entryText}>
        <View style={styles.entryTitleRow}>
          <Text style={[styles.entryTitle, { color: base.text }]}>
            {entry.title}
          </Text>
          {locked ? (
            <View
              accessibilityLabel="Coming soon"
              style={[
                styles.comingSoonPill,
                { borderColor: base.gold + '30' },
              ]}
            >
              <Text style={[styles.comingSoonText, { color: base.textMuted }]}>
                Coming soon
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          style={[styles.entryDescription, { color: base.textDim }]}
          numberOfLines={3}
        >
          {entry.description}
        </Text>
      </View>
      {!locked ? (
        <ChevronRight size={18} color={base.textMuted} style={styles.chevron} />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  heroWrap: {
    gap: spacing.xs,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
  },
  heroCredit: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
    textAlign: 'right',
  },
  introBlock: {
    gap: spacing.sm,
  },
  introText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
  },
  entriesBlock: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryText: {
    flex: 1,
    gap: 2,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    flexShrink: 1,
  },
  entryDescription: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  comingSoonPill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  comingSoonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  escapeHatchSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  escapeHatch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  escapeHatchText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});

export default withErrorBoundary(HowWeGotTheBibleLandingScreen);
