/**
 * ShareButton — Triggers the native share sheet.
 *
 * Auth-aware: prompts sign-in if user is not authenticated.
 */

import React, { useCallback } from 'react';
import { TouchableOpacity, Share, Alert, StyleSheet } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { useTheme, MIN_TOUCH_TARGET } from '../../theme';
import { useAuthStore } from '../../stores';
import { lightImpact } from '../../utils/haptics';
import { logger } from '../../utils/logger';

interface Props {
  title: string;
  body: string;
  url?: string;
}

function ShareButton({ title, body, url }: Props) {
  const { base } = useTheme();
  const user = useAuthStore((s) => s.user);

  const handlePress = useCallback(async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to share content.', [{ text: 'OK' }]);
      return;
    }

    lightImpact();

    try {
      const message = url ? `${body}\n\n${url}` : body;
      await Share.share({ title, message });
    } catch (err) {
      logger.warn('ShareButton', 'Share failed', err);
    }
  }, [user, title, body, url]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel="Share"
      style={styles.container}
    >
      <Share2 size={18} color={base.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const MemoizedShareButton = React.memo(ShareButton);
export { MemoizedShareButton as ShareButton };
export default MemoizedShareButton;
