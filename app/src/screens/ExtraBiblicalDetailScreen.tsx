/**
 * ExtraBiblicalDetailScreen — Detail view for one extrabiblical entry
 * (HWGTB-P2-03 / #1548). Sections (in order):
 *   1. Hero (title + aliases + dates + tradition status)
 *   2. Brief summary
 *   3. NT citations
 *   4. OT allusions
 *   5. Scholar voices
 *   6. Related debates
 *   7. Related difficult passages
 *   8. Related journeys
 *   9. Further reading
 *  10. Full summary (or "Coming soon" placeholder)
 *
 * Premium gating matches DebatePanel.tsx:
 *  - Free tier: Hero + first paragraph of brief_summary only
 *  - Premium tier: all sections
 * Tapping anywhere in the gated region fires showUpgrade('explore',
 * 'Extra-Biblical Literature').
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily, useTypography } from '../theme';
import { usePremium } from '../hooks/usePremium';
import { useExtraBiblicalEntry } from '../hooks/useExtraBiblicalEntry';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { ExtraBiblicalHero } from '../components/ExtraBiblicalHero';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { parseReference, getBookByName } from '../utils/verseResolver';
import { logger } from '../utils/logger';
import type {
  ExtrabiblicalEntry,
  ExtrabiblicalNTCitation,
  ExtrabiblicalOTAllusion,
  ExtrabiblicalScholarVoice,
  ExtrabiblicalFurtherReading,
} from '../types';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';

type Nav = ScreenNavProp<'Explore', 'ExtraBiblicalDetail'>;
type Route = ScreenRouteProp<'Explore', 'ExtraBiblicalDetail'>;

function ExtraBiblicalDetailScreen() {
  const { base } = useTheme();
  const { content } = useTypography();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id } = route.params;
  const { entry, loading } = useExtraBiblicalEntry(id);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const handleVersePress = useCallback(
    (ref: string) => {
      const parsed = parseReferenceExtended(ref);
      if (parsed) {
        navigation.navigate('Chapter', {
          bookId: parsed.bookId,
          chapterNum: parsed.chapter,
          ...(parsed.verseStart !== undefined
            ? { verseNum: parsed.verseStart }
            : {}),
        });
      }
    },
    [navigation],
  );

  const handleScholarPress = useCallback(
    (scholarId: string) => {
      navigation.navigate('ScholarBio', { scholarId });
    },
    [navigation],
  );

  const handleDebatePress = useCallback(
    (topicId: string) => navigation.navigate('DebateDetail', { topicId }),
    [navigation],
  );

  const handleDifficultPassagePress = useCallback(
    (passageId: string) =>
      navigation.navigate('DifficultPassageDetail', { passageId }),
    [navigation],
  );

  const handleJourneyPress = useCallback(
    (journeyId: string) => navigation.navigate('JourneyDetail', { journeyId }),
    [navigation],
  );

  const handleExternalLink = useCallback((url: string) => {
    Linking.openURL(url).catch((err) =>
      logger.warn('ExtraBiblicalDetail', `Failed to open ${url}`, err),
    );
  }, []);

  const handleUpgrade = useCallback(() => {
    showUpgrade('explore', 'Extra-Biblical Literature');
  }, [showUpgrade]);

  const firstParagraph = useMemo(
    () => (entry ? firstParagraphOf(entry.brief_summary) : ''),
    [entry],
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <ScreenHeader onBack={() => navigation.goBack()} title="" />
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <ScreenHeader onBack={() => navigation.goBack()} title="Not Found" />
        <View style={styles.center}>
          <Text style={[content.bodyMd, styles.bodyText, { color: base.textDim }]}>
            Entry not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={entry.title}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ExtraBiblicalHero entry={entry} />

        {/* Section 2: Brief summary — free users get first paragraph only */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>SUMMARY</Text>
          <Text style={[content.bodyMd, styles.bodyText, { color: base.text }]}>
            {isPremium ? entry.brief_summary : firstParagraph}
          </Text>
        </View>

        {isPremium ? (
          <PremiumSections
            entry={entry}
            onVersePress={handleVersePress}
            onScholarPress={handleScholarPress}
            onDebatePress={handleDebatePress}
            onDifficultPassagePress={handleDifficultPassagePress}
            onJourneyPress={handleJourneyPress}
            onExternalLink={handleExternalLink}
          />
        ) : (
          <LockedFooter onUpgrade={handleUpgrade} />
        )}
      </ScrollView>

      {upgradeRequest && (
        <UpgradePrompt
          visible
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
          onClose={dismissUpgrade}
        />
      )}
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function ScreenHeader({ onBack, title }: { onBack: () => void; title: string }) {
  const { base } = useTheme();
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ChevronLeft size={22} color={base.gold} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: base.gold }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

function PremiumSections({
  entry,
  onVersePress,
  onScholarPress,
  onDebatePress,
  onDifficultPassagePress,
  onJourneyPress,
  onExternalLink,
}: {
  entry: ExtrabiblicalEntry;
  onVersePress: (ref: string) => void;
  onScholarPress: (id: string) => void;
  onDebatePress: (id: string) => void;
  onDifficultPassagePress: (id: string) => void;
  onJourneyPress: (id: string) => void;
  onExternalLink: (url: string) => void;
}) {
  const { base } = useTheme();
  const { content } = useTypography();
  return (
    <>
      {entry.nt_citations.length > 0 ? (
        <Section label="NEW TESTAMENT CITATIONS">
          {entry.nt_citations.map((c, i) => (
            <NTCitationRow key={`${c.ref}-${i}`} cit={c} onPress={onVersePress} />
          ))}
        </Section>
      ) : null}

      {entry.ot_allusions.length > 0 ? (
        <Section label="OLD TESTAMENT ALLUSIONS">
          {entry.ot_allusions.map((a, i) => (
            <OTAllusionRow key={`${a.ref}-${i}`} allusion={a} onPress={onVersePress} />
          ))}
        </Section>
      ) : null}

      {entry.scholar_voices.length > 0 ? (
        <Section label="SCHOLAR VOICES">
          {entry.scholar_voices.map((v, i) => (
            <ScholarVoiceRow
              key={`${v.scholar_id}-${i}`}
              voice={v}
              onPress={onScholarPress}
            />
          ))}
        </Section>
      ) : null}

      {entry.related_debate_ids.length > 0 ? (
        <Section label="RELATED DEBATES">
          <ChipRow ids={entry.related_debate_ids} onPress={onDebatePress} testIdPrefix="debate" />
        </Section>
      ) : null}

      {entry.related_difficult_passage_ids.length > 0 ? (
        <Section label="RELATED DIFFICULT PASSAGES">
          <ChipRow
            ids={entry.related_difficult_passage_ids}
            onPress={onDifficultPassagePress}
            testIdPrefix="difficult"
          />
        </Section>
      ) : null}

      {entry.related_journey_ids.length > 0 ? (
        <Section label="RELATED JOURNEYS">
          <ChipRow ids={entry.related_journey_ids} onPress={onJourneyPress} testIdPrefix="journey" />
        </Section>
      ) : null}

      {entry.further_reading.length > 0 ? (
        <Section label="FURTHER READING">
          {entry.further_reading.map((f, i) => (
            <FurtherReadingRow
              key={`${f.title}-${i}`}
              item={f}
              onPress={onExternalLink}
            />
          ))}
        </Section>
      ) : null}

      <Section label="FULL SUMMARY">
        {entry.full_summary ? (
          <Text style={[content.bodyMd, styles.bodyText, { color: base.text }]}>
            {entry.full_summary}
          </Text>
        ) : (
          <View
            style={[
              styles.comingSoonCard,
              { backgroundColor: base.bgElevated, borderColor: base.gold + '30' },
            ]}
          >
            <Text style={[styles.comingSoonText, { color: base.textDim }]}>
              Coming soon — expanded scholarly summary
            </Text>
          </View>
        )}
      </Section>
    </>
  );
}

function LockedFooter({ onUpgrade }: { onUpgrade: () => void }) {
  const { base } = useTheme();
  const { content } = useTypography();
  return (
    <TouchableOpacity
      onPress={onUpgrade}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Unlock full entry"
      style={[
        styles.lockedCard,
        { backgroundColor: base.bgElevated, borderColor: base.gold + '30' },
      ]}
    >
      <Text style={[styles.lockedTitle, { color: base.gold }]}>
        {'✨ Unlock the full entry'}
      </Text>
      <Text style={[content.bodySm, styles.lockedDesc, { color: base.textDim }]}>
        NT citations, OT allusions, scholar voices, related debates,
        difficult passages, journeys, and further reading.
      </Text>
    </TouchableOpacity>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { base } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: base.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

function NTCitationRow({
  cit,
  onPress,
}: {
  cit: ExtrabiblicalNTCitation;
  onPress: (ref: string) => void;
}) {
  const { base } = useTheme();
  const { content } = useTypography();
  return (
    <TouchableOpacity
      onPress={() => onPress(cit.ref)}
      activeOpacity={0.7}
      accessibilityRole="link"
      accessibilityLabel={`Open ${cit.ref}`}
      style={[styles.citationRow, { borderColor: base.gold + '30' }]}
    >
      <Text style={[styles.citationRef, { color: base.gold }]}>{cit.ref}</Text>
      <Text style={[content.bodySm, styles.citationCites, { color: base.textDim }]}>
        {'→ '}
        {cit.cites}
      </Text>
      {cit.type ? (
        <Text style={[styles.citationType, { color: base.textMuted }]}>
          {formatCitationType(cit.type)}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

function OTAllusionRow({
  allusion,
  onPress,
}: {
  allusion: ExtrabiblicalOTAllusion;
  onPress: (ref: string) => void;
}) {
  const { base } = useTheme();
  const { content } = useTypography();
  return (
    <TouchableOpacity
      onPress={() => onPress(allusion.ref)}
      activeOpacity={0.7}
      accessibilityRole="link"
      accessibilityLabel={`Open ${allusion.ref}`}
      style={[styles.citationRow, { borderColor: base.gold + '30' }]}
    >
      <Text style={[styles.citationRef, { color: base.gold }]}>
        {allusion.ref}
      </Text>
      <Text style={[content.bodyMd, styles.bodyText, { color: base.textDim }]}>
        {allusion.connection}
      </Text>
    </TouchableOpacity>
  );
}

function ScholarVoiceRow({
  voice,
  onPress,
}: {
  voice: ExtrabiblicalScholarVoice;
  onPress: (scholarId: string) => void;
}) {
  const { base } = useTheme();
  const { content } = useTypography();
  return (
    <View style={styles.voiceBlock}>
      <TouchableOpacity
        onPress={() => onPress(voice.scholar_id)}
        accessibilityRole="button"
        accessibilityLabel={`Scholar: ${voice.scholar_id}`}
      >
        <Text style={[styles.voiceName, { color: base.gold }]}>
          {formatScholarLabel(voice.scholar_id)}
        </Text>
      </TouchableOpacity>
      <Text style={[content.bodyMd, styles.bodyText, { color: base.textDim }]}>
        {voice.position}
      </Text>
    </View>
  );
}

function ChipRow({
  ids,
  onPress,
  testIdPrefix,
}: {
  ids: string[];
  onPress: (id: string) => void;
  testIdPrefix: string;
}) {
  const { base } = useTheme();
  return (
    <View style={styles.chipRow}>
      {ids.map((id) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPress(id)}
          activeOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel={`Open ${testIdPrefix} ${id}`}
          style={[
            styles.chip,
            { borderColor: base.gold + '55', backgroundColor: base.gold + '10' },
          ]}
        >
          <Text style={[styles.chipText, { color: base.gold }]}>
            {formatIdLabel(id)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function FurtherReadingRow({
  item,
  onPress,
}: {
  item: ExtrabiblicalFurtherReading;
  onPress: (url: string) => void;
}) {
  const { base } = useTheme();
  const hasUrl = typeof item.url === 'string' && item.url.length > 0;
  const Container = hasUrl ? TouchableOpacity : View;
  return (
    <Container
      {...(hasUrl
        ? {
            onPress: () => onPress(item.url!),
            activeOpacity: 0.7,
            accessibilityRole: 'link' as const,
            accessibilityLabel: `Open ${item.title}`,
          }
        : {})}
      style={styles.readingRow}
    >
      <Text style={[styles.readingTitle, { color: base.text }]}>{item.title}</Text>
      {item.author ? (
        <Text style={[styles.readingAuthor, { color: base.textDim }]}>
          {item.author}
        </Text>
      ) : null}
      {item.note ? (
        <Text style={[styles.readingNote, { color: base.textMuted }]}>
          {item.note}
        </Text>
      ) : null}
    </Container>
  );
}

// ── Ref parsing (extends parseReference with single-chapter-book shortcut) ──

interface ParsedVerseRef {
  bookId: string;
  chapter: number;
  verseStart?: number;
}

/**
 * Wraps parseReference with single-chapter-book handling: "Jude 14",
 * "Jude 14-15", "Philemon 6", "2 John 9", "Obadiah 10-11" are all parsed
 * as chapter=1 with the number treated as a verse. The standard
 * parseReference regex requires a colon before the verse, which is
 * correct for multi-chapter books but wrong for these 1-chapter cases
 * that appear throughout the extrabiblical content (Jude especially).
 */
function parseReferenceExtended(ref: string): ParsedVerseRef | null {
  const standard = parseReference(ref);
  if (standard) {
    return {
      bookId: standard.bookId,
      chapter: standard.chapter,
      verseStart: standard.verseStart,
    };
  }
  // Fallback: "<Book> <n>" or "<Book> <n>-<m>" for single-chapter books.
  const m = ref.trim().match(/^(\d?\s*[A-Za-z][A-Za-z .]+?)\s+(\d+)(?:\s*[-–—]\s*\d+)?$/);
  if (!m) return null;
  const book = getBookByName(m[1].trim());
  if (!book || book.chapters !== 1) return null;
  return {
    bookId: book.id,
    chapter: 1,
    verseStart: parseInt(m[2], 10),
  };
}

// ── Formatters ────────────────────────────────────────────────────

function firstParagraphOf(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const idx = trimmed.indexOf('\n\n');
  return idx === -1 ? trimmed : trimmed.slice(0, idx).trim();
}

function formatIdLabel(id: string): string {
  return id
    .split(/[-_]/)
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

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  bodyText: {
  },
  citationRow: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 4,
    marginBottom: spacing.xs,
  },
  citationRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  citationCites: {
  },
  citationType: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  voiceBlock: {
    gap: 4,
    marginBottom: spacing.sm,
  },
  voiceName: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  chipRow: {
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
  readingRow: {
    gap: 2,
    marginBottom: spacing.sm,
  },
  readingTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  readingAuthor: {
    fontFamily: fontFamily.body,
    fontSize: 12,
  },
  readingNote: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
  },
  comingSoonCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  comingSoonText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
  },
  lockedCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  lockedTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
  },
  lockedDesc: {
    textAlign: 'center',
  },
});

export default withErrorBoundary(ExtraBiblicalDetailScreen);
