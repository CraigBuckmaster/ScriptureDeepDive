/**
 * ConnectivityBanner — Dismissible offline indicator.
 *
 * Shows a banner at the top of the screen when the device loses
 * connectivity, and auto-dismisses when it comes back online.
 * Displays pending sync count so users know their data is queued.
 *
 * Addresses #971 (offline connectivity indicator).
 */

import React, { memo, useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import { isConnected, onConnectivityChange } from '../services/connectivity';
import { getPendingCount } from '../services/syncQueue';

function ConnectivityBanner() {
  const { base } = useTheme();
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(!isConnected());
  const [pendingCount, setPendingCount] = useState(0);
  const slideAnim = useRef(new Animated.Value(offline ? 0 : -60)).current;

  useEffect(() => {
    const unsub = onConnectivityChange((connected) => {
      setOffline(!connected);
    });
    return unsub;
  }, []);

  // Update pending count when going offline
  useEffect(() => {
    if (offline) {
      getPendingCount().then(setPendingCount);
      const interval = setInterval(() => {
        getPendingCount().then(setPendingCount);
      }, 5_000);
      return () => clearInterval(interval);
    }
  }, [offline]);

  // Slide animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: offline ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [offline, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: base.danger,
          paddingTop: insets.top + 4,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents={offline ? 'auto' : 'none'}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.content}>
        <WifiOff size={14} color="#fff" />{/* overlay-color: intentional (white icon on offline banner) */}
        <Text style={styles.text}>
          You're offline
          {pendingCount > 0 ? ` \u00b7 ${pendingCount} pending` : ''}
        </Text>
      </View>
    </Animated.View>
  );
}

export default memo(ConnectivityBanner);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingBottom: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  text: {
    color: '#fff', // overlay-color: intentional (white text on offline banner)
    fontSize: 13,
  },
});
