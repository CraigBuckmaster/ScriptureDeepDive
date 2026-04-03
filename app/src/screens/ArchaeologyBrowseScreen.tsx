/**
 * ArchaeologyBrowseScreen — Browse archaeological discoveries.
 *
 * Shows a list of discovery cards with category filter chips and search.
 * Free access — no premium gate on the browse screen.
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ArchaeologyCard } from '../components/ArchaeologyCard';
import { useArchaeologyBrowse, useArchaeologySearch } from '../hooks/useArchaeology';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ArchaeologicalDiscovery } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function ArchaeologyBrowseScreen() {
  const { base } = useTheme();
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

  if (loading && !isSearching) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Archaeological Evidence" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Archaeological Evidence" onBack={() => navigation.goBack()} />
        <View style={styles.searchWrap}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search discoveries..."
          />
        </View>

        {/* Category filter pills */}
        {!isSearching && categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillRow}
          >
            <TouchableOpacity
              onPress={() => { setSelectedCategory(undefined); setSearch(''); }}
              style={[
                styles.pill,
                { borderColor: base.border },
                !selectedCategory && {
                  borderColor: base.gold + '55',
                  backgroundColor: base.gold + '12',
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: base.textMuted },
                  !selectedCategory && { color: base.gold },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => handleCategoryPress(cat)}
                  style={[
                    styles.pill,
                    { borderColor: base.border },
                    active && {
                      borderColor: base.gold + '55',
                      backgroundColor: base.gold + '12',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: base.textMuted },
                      active && { color: base.gold },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {searching ? (
        <View style={styles.loadingPad}><LoadingSkeleton lines={4} /></View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: base.textMuted }]}>
                {isSearching
                  ? `No discoveries found for "${search}"`
                  : 'No archaeological discoveries available'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  searchWrap: { marginBottom: spacing.sm },
  pillRow: { gap: spacing.xs, marginBottom: spacing.md },
  pill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  listPad: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  loadingPad: { padding: spacing.lg },
  emptyState: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fontFamily.ui, fontSize: 14 },
});

export default withErrorBoundary(ArchaeologyBrowseScreen);
