/**
 * StarRating — 5-star picker for rating content.
 *
 * Auth-aware: prompts sign-in if user is not authenticated.
 * Optimistic UI: sets rating immediately, debounces API call.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Star, StarOff } from 'lucide-react-native';
import { useTheme, MIN_TOUCH_TARGET } from '../../theme';
import { useAuthStore } from '../../stores';
import { lightImpact } from '../../utils/haptics';

interface Props {
  rating: number;
  onRate: (rating: number) => void;
}

function StarRating({ rating, onRate }: Props) {
  const { base } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [optimisticRating, setOptimisticRating] = useState(rating);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setOptimisticRating(rating);
  }, [rating]);

  const handleRate = useCallback((star: number) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to rate content.', [{ text: 'OK' }]);
      return;
    }

    lightImpact();

    // Tap same star to clear
    const newRating = star === optimisticRating ? 0 : star;
    setOptimisticRating(newRating);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onRate(newRating);
    }, 300);
  }, [user, optimisticRating, onRate]);

  return (
    <View style={styles.container} accessibilityRole="adjustable" accessibilityLabel={`Rating: ${optimisticRating} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleRate(star)}
          hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
          accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
          style={styles.starTouch}
        >
          {star <= optimisticRating ? (
            <Star size={18} color={base.gold} fill={base.gold} />
          ) : (
            <StarOff size={18} color={base.textMuted + '60'} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starTouch: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
});

const MemoizedStarRating = React.memo(StarRating);
export { MemoizedStarRating as StarRating };
export default MemoizedStarRating;
