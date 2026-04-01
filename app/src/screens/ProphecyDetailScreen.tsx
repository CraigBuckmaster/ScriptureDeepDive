/**
 * ProphecyDetailScreen — Timeline-rail view of a single prophecy chain.
 *
 * Displays the chain's progression from OT origins through NT fulfillment,
 * with tappable verse refs that navigate to the Chapter screen.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { useProphecyChainDetail } from '../hooks/useProphecyChains';
import { ScreenHeader } from '../components/ScreenHeader';
import { BadgeChip } from '../components/BadgeChip';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { base, useTheme, spacing, radii, fontFamily } from '../theme';
import type { ProphecyChainLink } from '../types';
import { logger } from '../utils/logger';

const CATEGORY_COLORS: Record<string, string> = {
  messianic: '#e8a070',
  covenant: '#70b8e8',
  judgment: '#e07070',
  restoration: '#70d098',
  typological: '#c090e0',
};

const TYPE_LABELS: Record<string, string> = {
  direct_fulfillment: 'Direct Fulfillment',
  typological_fulfillment: 'Typological',
  progressive_revelation: 'Progressive',
};

const ROLE_COLORS: Record<string, string> = {
  origin: '#8a8040',
  prophecy: '#a08840',
  development: '#b09050',
  type: '#c09858',
  fulfillment: '#d4b060',
  consummation: '#e0c878',
};

// Book IDs for OT books (to determine OT vs NT tint)
const OT_BOOKS = new Set([
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
  'joshua', 'judges', 'ruth', '1_samuel', '2_samuel',
  '1_kings', '2_kings', '1_chronicles', '2_chronicles',
  'ezra', 'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
  'ecclesiastes', 'song_of_solomon', 'isaiah', 'jeremiah',
  'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
  'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah',
  'haggai', 'zechariah', 'malachi',
]);

function parseLinks(json: string): ProphecyChainLink[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function parseTags(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/** Format book_dir to display name: "1_samuel" → "1 Samuel" */
function formatBookName(bookDir: string): string {
  return bookDir
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format link to full ref: "Genesis 3:15" */
function formatLinkRef(link: ProphecyChainLink): string {
  return `${formatBookName(link.book_dir)} ${link.verse_ref}`;
}

export default function ProphecyDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ProphecyDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'ProphecyDetail'>>();
  const { chainId } = route.params ?? {};
  const { chain, isLoading } = useProphecyChainDetail(chainId || '');

  const handleVersePress = (link: ProphecyChainLink) => {
    // Navigate to Chapter screen in ExploreStack
    try {
      navigation.navigate('Chapter', {
        bookId: link.book_dir,
        chapterNum: link.chapter_num,
      });
    } catch (err) {
      logger.warn('ProphecyDetailScreen', 'Navigation failed', err);
      Alert.alert('Not Available', `${formatLinkRef(link)} — chapter not yet available in app.`);
    }
  };

  if (isLoading || !chain) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  const links = parseLinks(chain.links_json);
  const tags = parseTags(chain.tags_json);
  const categoryColor = CATEGORY_COLORS[chain.category] || base.gold;
  const typeLabel = TYPE_LABELS[chain.chain_type] || chain.chain_type;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Prophecy Chain"
          titleColor={categoryColor}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {/* Title and badges */}
        <Text style={[styles.chainTitle, { color: base.text }]}>{chain.title}</Text>
        <View style={styles.badgeRow}>
          <BadgeChip label={chain.category} color={categoryColor} />
          <BadgeChip label={typeLabel} color={base.textMuted} />
        </View>

        {/* Summary callout */}
        {chain.summary && (
          <View style={[styles.summaryBox, { backgroundColor: base.bgElevated, borderLeftColor: base.gold }]}>
            <Text style={[styles.summaryText, { color: base.textDim }]}>{chain.summary}</Text>
          </View>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map((tag, i) => (
              <Text key={i} style={[styles.tag, { color: base.goldDim }]}>#{tag}</Text>
            ))}
          </View>
        )}

        {/* Timeline rail */}
        <View style={styles.railSection}>
          <Text style={[styles.sectionLabel, { color: base.gold }]}>FULFILLMENT CHAIN</Text>
          <View style={styles.rail}>
            {links.map((link, idx) => {
              const isOT = OT_BOOKS.has(link.book_dir);
              const dotColor = isOT ? '#c8a040' : '#a0c8e0';
              const roleColor = link.role ? (ROLE_COLORS[link.role] || base.gold) : base.gold;
              const isLast = idx === links.length - 1;
              // Use note as fallback for summary (legacy data)
              const displaySummary = link.summary || link.note;

              return (
                <View key={idx} style={styles.railItem}>
                  {/* Vertical line connector */}
                  {!isLast && <View style={[styles.railLine, { backgroundColor: base.border }]} />}

                  {/* Dot */}
                  <View style={[styles.railDot, { backgroundColor: dotColor }]} />

                  {/* Card */}
                  <View style={[styles.railCard, { backgroundColor: base.bgElevated, borderColor: base.border + '40' }]}>
                    <View style={styles.railCardHeader}>
                      <TouchableOpacity onPress={() => handleVersePress(link)}>
                        <Text style={[styles.verseRef, { color: dotColor }]}>
                          {formatLinkRef(link)}
                        </Text>
                      </TouchableOpacity>
                      {link.role && (
                        <Text style={[styles.roleLabel, { color: roleColor }]}>
                          {link.role.toUpperCase()}
                        </Text>
                      )}
                    </View>
                    {link.label && (
                      <Text style={[styles.linkLabel, { color: base.text }]}>{link.label}</Text>
                    )}
                    {displaySummary && (
                      <Text style={[styles.linkSummary, { color: base.textDim }]}>{displaySummary}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    flex: 1,
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.sm,
  },
  chainTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  summaryBox: {
    borderLeftWidth: 3,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  tag: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  railSection: {
    marginTop: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 11,
    letterSpacing: 0.4,
    marginBottom: spacing.md,
  },
  rail: {
    paddingLeft: spacing.md,
  },
  railItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    position: 'relative',
  },
  railLine: {
    position: 'absolute',
    left: 5,
    top: 14,
    bottom: -spacing.md,
    width: 2,
  },
  railDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  railCard: {
    flex: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
  },
  railCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  verseRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  roleLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  linkLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    marginBottom: 2,
  },
  linkSummary: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
