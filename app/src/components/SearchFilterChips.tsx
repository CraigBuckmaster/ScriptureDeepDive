/**
 * SearchFilterChips — Horizontal pill row for scoping search results.
 * Filters: All / OT / NT / [Book name if selected]
 */

import React from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

export interface SearchFilter {
  testament: 'all' | 'ot' | 'nt';
  bookId: string | null;
  bookName: string | null;
}

interface Props {
  filter: SearchFilter;
  onFilterChange: (filter: SearchFilter) => void;
  onBookPickerOpen: () => void;
}

const TESTAMENT_OPTIONS: { id: 'all' | 'ot' | 'nt'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ot', label: 'OT' },
  { id: 'nt', label: 'NT' },
];

function SearchFilterChips({ filter, onFilterChange, onBookPickerOpen }: Props) {
  const { base } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {TESTAMENT_OPTIONS.map((opt) => {
        const isActive = filter.testament === opt.id && !filter.bookId;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onFilterChange({ testament: opt.id, bookId: null, bookName: null })}
            style={[styles.chip, { borderColor: base.border }, isActive && { borderColor: base.gold, backgroundColor: base.gold + '20' }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipLabel, { color: base.textMuted }, isActive && { color: base.gold }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Book filter chip */}
      {filter.bookId ? (
        <TouchableOpacity
          style={[styles.chip, { borderColor: base.gold, backgroundColor: base.gold + '20' }]}
          onPress={() => onFilterChange({ ...filter, bookId: null, bookName: null })}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipLabel, { color: base.gold }]}>
            {filter.bookName ?? filter.bookId}
          </Text>
          <X size={12} color={base.gold} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.chip, { borderColor: base.border }]}
          onPress={onBookPickerOpen}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipLabel, { color: base.textMuted }]}>Book...</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const MemoizedSearchFilterChips = React.memo(SearchFilterChips);
export { MemoizedSearchFilterChips as SearchFilterChips };
export default MemoizedSearchFilterChips;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  chipLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
