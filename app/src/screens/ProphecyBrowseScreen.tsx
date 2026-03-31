/**
 * ProphecyBrowseScreen — Browse all prophecy chains with category filter.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useProphecyChains } from '../hooks/useProphecyChains';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { BadgeChip } from '../components/BadgeChip';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ProphecyChain, ProphecyChainLink } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  messianic: '#e8a070',
  covenant: '#70b8e8',
  judgment: '#e07070',
  restoration: '#70d098',
  typological: '#c090e0',
};

const CATEGORY_LABELS: Record<string, string> = {
  messianic: 'Messianic',
  covenant: 'Covenant',
  judgment: 'Judgment',
  restoration: 'Restoration',
  typological: 'Typological',
};

function parseLinks(json: string): ProphecyChainLink[] {
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

function getRefRange(links: ProphecyChainLink[]): string {
  if (links.length === 0) return '';
  const first = links[0];
  const last = links[links.length - 1];
  return `${formatLinkRef(first)} → ${formatLinkRef(last)}`;
}

export default function ProphecyBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ProphecyBrowse'>>();
  const { chains, isLoading } = useProphecyChains();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Derive distinct categories from data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    chains.forEach((c) => cats.add(c.category));
    return ['all', ...Array.from(cats).sort()];
  }, [chains]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return chains;
    return chains.filter((c) => c.category === categoryFilter);
  }, [chains, categoryFilter]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={6} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.topSection}>
        <ScreenHeader
          title="Prophecy & Typology"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        {/* Category filter chips */}
        <View style={styles.filterRow}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setCategoryFilter(cat)}>
              <Text
                style={[
                  styles.filterLabel,
                  { color: base.textMuted },
                  categoryFilter === cat && { color: base.gold, borderBottomColor: base.gold },
                  categoryFilter === cat && styles.filterLabelActive,
                ]}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const links = parseLinks(item.links_json);
          const refRange = getRefRange(links);
          const catColor = CATEGORY_COLORS[item.category] || base.gold;

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProphecyDetail', { chainId: item.id })}
              style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '25' }]}
              accessibilityLabel={item.title}
              accessibilityRole="button"
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: base.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <BadgeChip
                  label={CATEGORY_LABELS[item.category] || item.category}
                  color={catColor}
                  size="small"
                />
              </View>

              {item.summary && (
                <Text style={[styles.cardSummary, { color: base.textDim }]} numberOfLines={2}>
                  {item.summary}
                </Text>
              )}

              <View style={styles.cardFooter}>
                <Text style={[styles.refRange, { color: base.goldDim }]}>{refRange}</Text>
                <Text style={[styles.linkCount, { color: base.textMuted }]}>{links.length} links</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  headerSpacing: {
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    paddingBottom: 4,
  },
  filterLabelActive: {
    borderBottomWidth: 2,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
  },
  cardSummary: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  refRange: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
  },
  linkCount: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
