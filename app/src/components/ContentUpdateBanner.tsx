/**
 * ContentUpdateBanner — Non-blocking banner showing OTA content update progress.
 *
 * Displays at the top of the screen during content database updates.
 * Auto-dismisses on success after 2 seconds. Shows error toast on failure.
 * Part of epic #758 (CloudFlare R2 Delta DB Delivery).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { fontFamily } from '../theme';

export type UpdateStatus = 'downloading' | 'applying' | 'success' | 'error';

interface Props {
  visible: boolean;
  progress: number;
  status: UpdateStatus;
  onDismiss?: () => void;
}

const STATUS_LABELS: Record<UpdateStatus, string> = {
  downloading: 'Downloading study content…',
  applying: 'Applying update…',
  success: 'Content updated!',
  error: 'Update failed',
};

function ContentUpdateBanner({ visible, progress, status, onDismiss }: Props) {
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -80,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  // Auto-dismiss on success after 2 seconds
  useEffect(() => {
    if (status === 'success' && visible && onDismiss) {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, visible, onDismiss]);

  const isError = status === 'error';

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.inner}>
        <Text style={[styles.label, isError && styles.errorLabel]}>
          {STATUS_LABELS[status]}
        </Text>
        {(status === 'downloading' || status === 'applying') && (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const MemoizedContentUpdateBanner = React.memo(ContentUpdateBanner);
export { MemoizedContentUpdateBanner as ContentUpdateBanner };
export default MemoizedContentUpdateBanner;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  inner: {
    backgroundColor: '#1a1710',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    gap: 6,
  },
  label: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    color: '#e8dcc8',
  },
  errorLabel: {
    color: '#e05a6a',
  },
  track: {
    height: 4,
    backgroundColor: '#2a2010',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    backgroundColor: '#bfa050',
    borderRadius: 2,
  },
});
