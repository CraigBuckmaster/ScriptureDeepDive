/**
 * FollowButton — Toggle button for follow/unfollow state.
 *
 * Shows "Follow" or "Following" with appropriate styling.
 * Auth-aware: prompts sign-in if user is not authenticated.
 */

import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { UserPlus, UserCheck } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../../theme';
import { useAuthStore } from '../../stores';
import { mediumImpact } from '../../utils/haptics';

export type FollowTargetType = 'topic' | 'user';

interface Props {
  targetId: string;
  targetType: FollowTargetType;
  isFollowing: boolean;
  onToggle: () => void;
}

function FollowButton({ targetId: _targetId, targetType: _targetType, isFollowing, onToggle }: Props) {
  const { base } = useTheme();
  const user = useAuthStore((s) => s.user);

  const handlePress = useCallback(() => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to follow content.', [{ text: 'OK' }]);
      return;
    }

    mediumImpact();
    onToggle();
  }, [user, onToggle]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={isFollowing ? 'Unfollow' : 'Follow'}
      style={[
        styles.container,
        {
          borderColor: isFollowing ? base.gold + '55' : base.border,
          backgroundColor: isFollowing ? base.gold + '12' : 'transparent',
        },
      ]}
    >
      {isFollowing ? (
        <UserCheck size={14} color={base.gold} />
      ) : (
        <UserPlus size={14} color={base.textMuted} />
      )}
      <Text
        style={[
          styles.label,
          { color: isFollowing ? base.gold : base.textMuted },
        ]}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    gap: 4,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});

const MemoizedFollowButton = React.memo(FollowButton);
export { MemoizedFollowButton as FollowButton };
export default MemoizedFollowButton;
