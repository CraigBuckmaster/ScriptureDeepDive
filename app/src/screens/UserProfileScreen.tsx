/**
 * UserProfileScreen — User account overview and navigation hub.
 *
 * Shows avatar, display name (editable), trust level, account info,
 * sign-out, and links to Settings, Bookmarks, and Reading History.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import {
  Settings,
  Bookmark,
  Clock,
  LogOut,
  ChevronRight,
  FileText,
} from 'lucide-react-native';
import { useAuthStore } from '../stores';
import { getAuthProfile, type AuthProfile } from '../db/userQueries';
import { upsertAuthProfile } from '../db/userMutations';
import { ScreenHeader } from '../components/ScreenHeader';
import { useMySubmissions } from '../hooks/useMySubmissions';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { Submission, SubmissionStatus } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { logger } from '../utils/logger';

/* ── Trust level helpers ──────────────────────────────────────────── */

const TRUST_LEVELS: Record<number, { label: string; color: string }> = {
  0: { label: 'New Member', color: '#888' },
  1: { label: 'Contributor', color: '#bfa050' },
  2: { label: 'Trusted', color: '#50b060' },
};

function getTrustLevel(_user: { app_metadata?: Record<string, any> }): number {
  return _user?.app_metadata?.trust_level ?? 0;
}

/* ── Component ────────────────────────────────────────────────────── */

function UserProfileScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'UserProfile'>>();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const { submissions: mySubmissions } = useMySubmissions();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    getAuthProfile()
      .then((p) => {
        setProfile(p);
        setDisplayName(p?.display_name ?? '');
      })
      .catch((err) => logger.warn('UserProfileScreen', 'Failed to load profile', err));
  }, [user]);

  /* ── Derived values ────────────────────────────────────────────── */

  const trustLevel = user ? getTrustLevel(user) : 0;
  const trustInfo = TRUST_LEVELS[trustLevel] ?? TRUST_LEVELS[0];

  const email = profile?.email ?? user?.email ?? '';
  const providerRaw = profile?.provider ?? user?.app_metadata?.provider ?? 'email';
  const providerLabel =
    providerRaw === 'google' ? 'Google' :
    providerRaw === 'apple' ? 'Apple' :
    providerRaw === 'facebook' ? 'Facebook' :
    'Email';

  const initials = getInitials(displayName || email);

  /* ── Handlers ──────────────────────────────────────────────────── */

  const handleSaveName = async () => {
    setIsEditingName(false);
    if (!user || !profile) return;
    try {
      await upsertAuthProfile(
        profile.supabase_uid,
        profile.email,
        displayName,
        profile.avatar_url,
        profile.provider,
      );
    } catch (err) {
      logger.warn('UserProfileScreen', 'Failed to update display name', err);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.goBack();
        },
      },
    ]);
  };

  /* ── Not signed in ─────────────────────────────────────────────── */

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <ScreenHeader title="Profile" onBack={() => navigation.goBack()} style={styles.headerSpacing} />
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: base.textDim }]}>
            Sign in to view your profile.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as any)}
            style={[styles.signInButton, { backgroundColor: base.gold }]}
          >
            <Text style={[styles.signInButtonText, { color: base.bg }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ── Signed in ─────────────────────────────────────────────────── */

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Profile" onBack={() => navigation.goBack()} style={styles.headerSpacing} />

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: base.gold + '20', borderColor: base.gold }]}>
            <Text style={[styles.avatarInitials, { color: base.gold }]}>{initials}</Text>
          </View>
        </View>

        {/* Display name */}
        <View style={styles.nameSection}>
          {isEditingName ? (
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
              autoFocus
              style={[styles.nameInput, { color: base.text, borderColor: base.gold }]}
              placeholder="Display name"
              placeholderTextColor={base.textMuted}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)}>
              <Text style={[styles.displayName, { color: base.text }]}>
                {displayName || 'Tap to set name'}
              </Text>
              <Text style={[styles.editHint, { color: base.textMuted }]}>Tap to edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trust level badge */}
        <View style={[styles.badgeRow, { borderColor: base.border + '40' }]}>
          <View style={[styles.badge, { backgroundColor: trustInfo.color + '20' }]}>
            <Text style={[styles.badgeText, { color: trustInfo.color }]}>
              Level {trustLevel} — {trustInfo.label}
            </Text>
          </View>
        </View>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>ACCOUNT</Text>
          <InfoRow label="Email" value={email} base={base} />
          <InfoRow label="Provider" value={providerLabel} base={base} />
        </View>

        {/* Navigation links */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>QUICK LINKS</Text>
          <NavRow icon={Settings} label="Settings" onPress={() => navigation.navigate('Settings')} base={base} />
          <NavRow icon={Bookmark} label="Bookmarks" onPress={() => navigation.navigate('Bookmarks')} base={base} />
          <NavRow icon={Clock} label="Reading History" onPress={() => navigation.navigate('ReadingHistory')} base={base} />
        </View>

        {/* My Submissions */}
        {mySubmissions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: base.textMuted }]}>MY SUBMISSIONS</Text>
            {mySubmissions.map((sub: Submission) => (
              <TouchableOpacity
                key={sub.id}
                onPress={() => navigation.navigate('SubmissionDetail' as any, { submissionId: sub.id })}
                style={[styles.navRow, { borderBottomColor: base.border + '40' }]}
                activeOpacity={0.6}
              >
                <FileText size={18} color={base.textDim} />
                <View style={styles.submissionInfo}>
                  <Text style={[styles.navLabel, { color: base.text }]} numberOfLines={1}>
                    {sub.title}
                  </Text>
                  <StatusBadge status={sub.status} base={base} />
                </View>
                <ChevronRight size={14} color={base.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutButton, { borderColor: base.danger + '40' }]}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <LogOut size={16} color={base.danger} />
          <Text style={[styles.signOutText, { color: base.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // For email, use first letter
  return name[0].toUpperCase();
}

/* ── Sub-components ───────────────────────────────────────────────── */

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  draft: '#888',
  pending: '#d4a843',
  approved: '#50b060',
  rejected: '#cc4444',
  flagged: '#cc6633',
};

function StatusBadge({
  status,
  base,
}: {
  status: SubmissionStatus;
  base: ReturnType<typeof useTheme>['base'];
}) {
  const color = STATUS_COLORS[status] ?? '#888';
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

function InfoRow({ label, value, base }: { label: string; value: string; base: ReturnType<typeof useTheme>['base'] }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: base.border + '40' }]}>
      <Text style={[styles.infoLabel, { color: base.textDim }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: base.text }]}>{value}</Text>
    </View>
  );
}

function NavRow({
  icon: Icon,
  label,
  onPress,
  base,
}: {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  base: ReturnType<typeof useTheme>['base'];
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.navRow, { borderBottomColor: base.border + '40' }]}
      activeOpacity={0.6}
    >
      <Icon size={18} color={base.textDim} />
      <Text style={[styles.navLabel, { color: base.text }]}>{label}</Text>
      <ChevronRight size={14} color={base.textMuted} />
    </TouchableOpacity>
  );
}

/* ── Styles ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerSpacing: {
    marginBottom: spacing.lg,
  },

  /* Avatar */
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 28,
  },

  /* Name */
  nameSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  displayName: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
    textAlign: 'center',
  },
  editHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  nameInput: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
    textAlign: 'center',
    borderBottomWidth: 2,
    paddingVertical: spacing.xs,
    minWidth: 200,
  },

  /* Badge */
  badgeRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
  },
  badgeText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },

  /* Sections */
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  infoValue: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },

  /* Nav rows */
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  navLabel: {
    flex: 1,
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
  },

  /* Sign out */
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  signOutText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
  },

  /* Empty state */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  signInButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
  },
  signInButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 15,
  },

  /* Submissions */
  submissionInfo: {
    flex: 1,
    gap: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  statusText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    letterSpacing: 0.3,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default withErrorBoundary(UserProfileScreen);
