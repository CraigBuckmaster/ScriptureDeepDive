/**
 * ArchaeologyBrowseScreen — Browse archaeological discoveries.
 *
 * Shows a list of discovery cards with category filter chips and search.
 * Free access — no premium gate on the browse screen.
 *
 * Card #1359 (UI polish phase 2): migrated to shared BrowseScreenTemplate
 * and BrowseFilterPill. Search + filter/empty/loading are now template-owned.
 */

import React, { useCallback, useState, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import {
  BrowseScreenTemplate,
  BrowseFilterPill,
} from '../components/BrowseScreenTemplate';
import { ArchaeologyCard } from '../components/ArchaeologyCard';
import { useArchaeologyBrowse, useArchaeologySearch } from '../hooks/useArchaeology';
import { spacing } from '../theme';
import type { ArchaeologicalDiscovery } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function ArchaeologyBrowseScreen() {
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ArchaeologyBrowse'>>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { data: discoveries, loading } = useArchaeologyBrowse(selectedCategory);
  const { search, setSearch, results: searchResults, searching } = useArchaeologySearch();

  const isSearching = search.length >= 2;

  // Extract unique categories from discoveries
  const categories = useMemo(() => {
    const cats = new Set<string>();
    discoveries.forEach((d) => cats.add(d.category));
    return Array.from(cats).sort();
  }, [discoveries]);

  const displayData = isSearching ? searchResults : discoveries;

  const handleCategoryPress = useCallback(
    (cat: string) => {
      setSelectedCategory((prev) => (prev === cat ? undefined : cat));
      setSearch('');
    },
    [setSearch],
  );

  const handleDiscoveryPress = useCallback(
    (discoveryId: string) => {
      navigation.push('ArchaeologyDetail', { discoveryId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ArchaeologicalDiscovery }) => (
      <ArchaeologyCard
        name={item.name}
        category={item.category}
        location={item.location}
        dateRange={item.date_range}
        significance={item.significance}
        onPress={() => handleDiscoveryPress(item.id)}
      />
    ),
    [handleDiscoveryPress],
  );

  const filterBar = !isSearching && categories.length > 0 ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillRow}
    >
      <BrowseFilterPill
        label="All"
        active={!selectedCategory}
        onPress={() => { setSelectedCategory(undefined); setSearch(''); }}
      />
      {categories.map((cat) => (
        <BrowseFilterPill
          key={cat}
          label={cat}
          active={selectedCategory === cat}
          onPress={() => handleCategoryPress(cat)}
        />
      ))}
    </ScrollView>
  ) : null;

  const showLoading = (loading && !isSearching) || searching;

  return (
    <BrowseScreenTemplate
      title="Archaeological Evidence"
      loading={showLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search discoveries..."
      filterBar={filterBar}
      data={displayData}
      renderItem={renderItem}
      keyExtractor={(item: ArchaeologicalDiscovery) => item.id}
      emptyMessage={
        isSearching
          ? `No discoveries found for "${search}"`
          : 'No archaeological discoveries available'
      }
    />
  );
}

const styles = StyleSheet.create({
  pillRow: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
});

export default withErrorBoundary(ArchaeologyBrowseScreen);
