/**
 * MoreMenuScreen — Landing page for the More tab.
 *
 * Surfaces Bookmarks, Reading History, Reading Plans, and Settings
 * that were previously buried behind the Settings screen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { Bookmark, Clock, Calendar, Settings, ArrowRight, StickyNote } from 'lucide-react-native';
import { base, useTheme, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../theme';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  screen: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: StickyNote, label: 'All Notes',         screen: 'AllNotes' },
  { icon: Bookmark,   label: 'Bookmarks',         screen: 'Bookmarks' },
  { icon: Clock,      label: 'Reading History',    screen: 'ReadingHistory' },
  { icon: Calendar,   label: 'Reading Plans',      screen: 'PlanList' },
  { icon: Settings,   label: 'Settings',           screen: 'Settings' },
];

export default function MoreMenuScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'MoreMenu'>>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <Text style={[styles.title, { color: base.gold }]} accessibilityRole="header">More</Text>

      <View style={[styles.menuList, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.screen}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.6}
            style={[
              styles.menuRow,
              idx < MENU_ITEMS.length - 1 && [styles.menuRowBorder, { borderBottomColor: base.border + '40' }],
            ]}
          >
            <item.icon size={20} color={base.textDim} />
            <Text style={[styles.menuLabel, { color: base.text }]}>{item.label}</Text>
            <ArrowRight size={14} color={base.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  menuList: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
  },
  menuLabel: {
    flex: 1,
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
  },
});
