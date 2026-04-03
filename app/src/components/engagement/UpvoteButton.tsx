/**
 * UpvoteButton — Heart toggle with count for engagement.
 *
 * Auth-aware: prompts sign-in if user is not authenticated.
 * Optimistic UI: toggles immediately, debounces API call.
 */

import React, { useState, useRef, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useTheme, MIN_TOUCH_TARGET } from '../../theme';
import { useAuthStore } from '../../stores';
import { mediumImpact } from '../../utils/haptics';

interface Props {
  count: number;
  isUpvoted: boolean;
  onToggle: () => void;
}

function UpvoteButton({ count, isUpvoted, onToggle }: Props) {
  const { base } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [optimisticUpvoted, setOptimisticUpvoted] = useState(isUpvoted);
  const [optimisticCount, setOptimisticCount] = useState(count);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync optimistic state when props change
  React.useEffect(() => {
    setOptimisticUpvoted(isUpvoted);
    setOptimisticCount(count);
  }, [isUpvoted, count]);

  const handlePress = useCallback(() => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to upvote content.', [{ text: 'OK' }]);
      return;
    }

    mediumImpact();

    // Optimistic update
    setOptimisticUpvoted((prev) => !prev);
    setOptimisticCount((prev) => optimisticUpvoted ? prev - 1 : prev + 1);

    // Debounce the actual API call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onToggle();
    }, 300);
  }, [user, optimisticUpvoted, onToggle]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel={`${optimisticUpvoted ? 'Remove upvote' : 'Upvote'}. ${optimisticCount} upvotes`}
      style={styles.container}
    >
      <Heart
        size={18}
        color={optimisticUpvoted ? base.danger : base.textMuted}
        fill={optimisticUpvoted ? base.danger : 'transparent'}
      />
      {optimisticCount > 0 && (
        <Text style={[styles.count, { color: optimisticUpvoted ? base.danger : base.textMuted }]}>
          {optimisticCount}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    gap: 4,
  },
  count: {
    fontSize: 13,
  },
});

const MemoizedUpvoteButton = React.memo(UpvoteButton);
export { MemoizedUpvoteButton as UpvoteButton };
export default MemoizedUpvoteButton;
