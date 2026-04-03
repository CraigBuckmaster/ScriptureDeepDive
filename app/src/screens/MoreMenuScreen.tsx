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
import { Bookmark, Clock, Calendar, Settings, ArrowRight, StickyNote, LogIn, LogOut, User } from 'lucide-react-native';
import { useTheme, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../theme';
import { useAuthStore } from '../stores';

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
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <Text style={[styles.title, { color: base.gold }]} accessibilityRole="header">More</Text>

      {/* Auth section */}
      <View style={[styles.authCard, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
        {user ? (
          <View style={styles.authRow}>
            <User size={20} color={base.gold} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[styles.authLabel, { color: base.text }]}>{user.email}</Text>
              <Text style={[styles.authSubtitle, { color: base.textMuted }]}>Signed in</Text>
            </View>
            <TouchableOpacity onPress={signOut} accessibilityLabel="Sign out" accessibilityRole="button">
              <LogOut size={18} color={base.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.6}
            style={styles.authRow}
            accessibilityLabel="Sign in to your account"
            accessibilityRole="button"
          >
            <LogIn size={20} color={base.gold} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[styles.authLabel, { color: base.text }]}>Sign In</Text>
              <Text style={[styles.authSubtitle, { color: base.textMuted }]}>Unlock premium features and sync</Text>
            </View>
            <ArrowRight size={14} color={base.textMuted} />
          </TouchableOpacity>
        )}
      </View>

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
  authCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
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
  authLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
  },
  authSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 2,
  },
});
