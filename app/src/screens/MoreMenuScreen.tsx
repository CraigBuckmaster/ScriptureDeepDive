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
import { Bookmark, Clock, Calendar, Settings, ArrowRight, StickyNote } from 'lucide-react-native';
import { base, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../theme';

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
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">More</Text>

      <View style={styles.menuList}>
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.screen}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.6}
            style={[
              styles.menuRow,
              idx < MENU_ITEMS.length - 1 && styles.menuRowBorder,
            ]}
          >
            <item.icon size={20} color={base.textDim} />
            <Text style={styles.menuLabel}>{item.label}</Text>
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
    backgroundColor: base.bg,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: base.gold,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  menuList: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: base.border,
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
    borderBottomColor: base.border + '40',
  },
  menuLabel: {
    flex: 1,
    color: base.text,
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
  },
});
