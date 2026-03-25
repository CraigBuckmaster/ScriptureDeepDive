/**
 * hooks/useTreeGestures.ts — Pinch-to-zoom + pan with momentum for the tree.
 *
 * Uses react-native-gesture-handler v2 + reanimated shared values.
 * Simultaneous pinch + pan. Zoom bounded [0.15, 3].
 * Programmatic animateTo() for search-to-node and era-jump.
 */

import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDecay,
  type SharedValue,
} from 'react-native-reanimated';
import { TREE_CONSTANTS } from '../utils/treeBuilder';

interface TreeGestureResult {
  gesture: GestureType;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  animateTo: (x: number, y: number, targetScale: number, duration?: number) => void;
  centreOnNode: (nodeX: number, nodeY: number) => void;
  jumpToNode: (nodeX: number, nodeY: number) => void;
  centreOnNodeAbovePanel: (nodeX: number, nodeY: number) => void;
}

export function useTreeGestures(): TreeGestureResult {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const isMobile = SCREEN_W < 768;

  const initialScale = isMobile
    ? TREE_CONSTANTS.initialScaleMobile
    : TREE_CONSTANTS.initialScaleTablet;

  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(SCREEN_W / 2);
  const translateY = useSharedValue(SCREEN_H * 0.15);

  const savedScale = useSharedValue(initialScale);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, newScale));
    });

  // Pan gesture
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onBegin(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd((e) => {
      // Momentum decay
      translateX.value = withDecay({ velocity: e.velocityX, deceleration: 0.997 });
      translateY.value = withDecay({ velocity: e.velocityY, deceleration: 0.997 });
    });

  // Compose: simultaneous pinch + pan
  const gesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated style for the tree container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Programmatic animation
  const animateTo = useCallback((x: number, y: number, targetScale: number, duration = 500) => {
    translateX.value = withTiming(x, { duration });
    translateY.value = withTiming(y, { duration });
    scale.value = withTiming(
      Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, targetScale)),
      { duration }
    );
  }, []);

  // Immediate jump — no animation, sets transform instantly
  const jumpTo = useCallback((x: number, y: number, targetScale: number) => {
    translateX.value = x;
    translateY.value = y;
    scale.value = Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, targetScale));
  }, []);

  // Centre on a specific node
  const centreOnNode = useCallback((nodeX: number, nodeY: number) => {
    const targetScale = isMobile ? 0.65 : 0.9;
    const centerX = SCREEN_W / 2 - nodeX * targetScale;
    const centerY = SCREEN_H / 2 - nodeY * targetScale;
    animateTo(centerX, centerY, targetScale, 550);
  }, [animateTo, SCREEN_W, SCREEN_H, isMobile]);

  // Instant jump to centre on a node (no animation — for initial load)
  const jumpToNode = useCallback((nodeX: number, nodeY: number) => {
    const targetScale = isMobile ? 0.65 : 0.9;
    const centerX = SCREEN_W / 2 - nodeX * targetScale;
    const centerY = SCREEN_H * 0.15 - nodeY * targetScale;
    jumpTo(centerX, centerY, targetScale);
  }, [jumpTo, SCREEN_W, SCREEN_H, isMobile]);

  // Centre on a node but offset upward so it sits above a bottom panel
  const centreOnNodeAbovePanel = useCallback((nodeX: number, nodeY: number) => {
    const targetScale = isMobile ? 0.65 : 0.9;
    const centerX = SCREEN_W / 2 - nodeX * targetScale;
    // Position node at roughly 25% from top instead of 50%
    const centerY = SCREEN_H * 0.25 - nodeY * targetScale;
    animateTo(centerX, centerY, targetScale, 550);
  }, [animateTo, SCREEN_W, SCREEN_H, isMobile]);

  return { gesture, animatedStyle, scale, translateX, translateY, animateTo, centreOnNode, jumpToNode, centreOnNodeAbovePanel };
}
