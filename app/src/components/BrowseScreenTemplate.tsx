/**
 * BrowseScreenTemplate — Generic template for browse screens.
 *
 * Consolidates the shared structure of 9 browse screens:
 * SafeAreaView + ScreenHeader + SearchInput + optional filter bar +
 * loading state + empty state + FlatList or SectionList.
 *
 * Each screen provides its unique data hook, renderItem, and filter config.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  StyleSheet,
  type FlatListProps,
  type SectionListProps,
  type ListRenderItem,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, fontFamily } from '../theme';
import { ScreenHeader } from './ScreenHeader';
import { SearchInput } from './SearchInput';
import { LoadingSkeleton } from './LoadingSkeleton';

// ─── Flat list mode ───────────────────────────────────────────────

interface FlatListMode<T> {
  mode?: 'flat';
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  numColumns?: number;
  columnWrapperStyle?: ViewStyle;
  /** Extra FlatList props (e.g. contentContainerStyle) */
  flatListProps?: Partial<FlatListProps<T>>;
}

// ─── Section list mode ────────────────────────────────────────────

interface SectionListMode<T> {
  mode: 'section';
  sections: { title: string; data: T[] }[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  renderSectionHeader: (info: { section: { title: string; data: T[] } }) => React.ReactElement;
  /** Extra SectionList props */
  sectionListProps?: Partial<SectionListProps<T>>;
}

// ─── Common props ─────────────────────────────────────────────────

interface CommonProps {
  title: string;
  subtitle?: string;
  loading: boolean;
  /** Search input value. Omit to hide search bar. */
  search?: string;
  /** Called when search text changes. Required if search is provided. */
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  /** Rendered between search and list (e.g. filter chips) */
  filterBar?: React.ReactNode;
  /** Message shown when list is empty. Defaults to "No results found". */
  emptyMessage?: string;
  /** Custom empty state component — overrides emptyMessage */
  emptyComponent?: React.ReactElement;
  /** Custom loading component — overrides default LoadingSkeleton */
  loadingComponent?: React.ReactElement;
  /** Padding style for the top section containing header/search/filter */
  topSectionStyle?: ViewStyle;
  /** Whether to render header + search inside the list as a header component.
   *  Useful for SectionList screens where the header should scroll with content. */
  headerInList?: boolean;
  /** Content container style for the list */
  contentContainerStyle?: ViewStyle;
}

export type BrowseScreenTemplateProps<T> =
  CommonProps & (FlatListMode<T> | SectionListMode<T>);

export function BrowseScreenTemplate<T>(props: BrowseScreenTemplateProps<T>) {
  const { base } = useTheme();
  const navigation = useNavigation();

  const {
    title,
    subtitle,
    loading,
    search,
    onSearchChange,
    searchPlaceholder = 'Search...',
    filterBar,
    emptyMessage = 'No results found',
    emptyComponent,
    loadingComponent,
    topSectionStyle,
    headerInList,
    contentContainerStyle,
  } = props;

  const headerContent = (
    <View style={[styles.topSection, topSectionStyle]}>
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        onBack={() => navigation.goBack()}
        style={styles.headerSpacing}
      />
      {search !== undefined && onSearchChange && (
        <View style={styles.searchWrap}>
          <SearchInput
            value={search}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </View>
      )}
      {filterBar}
    </View>
  );

  const emptyState = emptyComponent ?? (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: base.textMuted }]}>
        {emptyMessage}
      </Text>
    </View>
  );

  const loadingState = loadingComponent ?? (
    <View style={styles.loadingPad}>
      <LoadingSkeleton lines={6} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        {headerContent}
        {loadingState}
      </SafeAreaView>
    );
  }

  // ─── Section list rendering ───────────────────────────────────

  if (props.mode === 'section') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        {!headerInList && headerContent}
        <SectionList
          sections={props.sections}
          keyExtractor={props.keyExtractor}
          renderItem={props.renderItem as any}
          renderSectionHeader={props.renderSectionHeader as any}
          stickySectionHeadersEnabled
          contentContainerStyle={contentContainerStyle ?? styles.listPad}
          ListHeaderComponent={headerInList ? headerContent : undefined}
          ListEmptyComponent={emptyState}
          {...props.sectionListProps}
        />
      </SafeAreaView>
    );
  }

  // ─── Flat list rendering ──────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {!headerInList && headerContent}
      <FlatList
        data={props.data}
        keyExtractor={props.keyExtractor}
        renderItem={props.renderItem}
        numColumns={props.numColumns}
        columnWrapperStyle={props.numColumns && props.numColumns > 1 ? props.columnWrapperStyle : undefined}
        contentContainerStyle={contentContainerStyle ?? styles.listPad}
        ListHeaderComponent={headerInList ? headerContent : undefined}
        ListEmptyComponent={emptyState}
        showsVerticalScrollIndicator={false}
        {...props.flatListProps}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  headerSpacing: {
    marginBottom: spacing.md,
  },
  searchWrap: {
    marginBottom: spacing.sm,
  },
  listPad: {
    paddingHorizontal: spacing.md,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
});
