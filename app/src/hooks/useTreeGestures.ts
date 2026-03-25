/**
 * hooks/useTreeGestures.ts — Pinch-to-zoom + pan with momentum for the tree.
 *
 * Uses react-native-gesture-handler v2 + reanimated shared values.
 * Simultaneous pinch + pan. Zoom bounded [0.15, 3].
 *
 * IMPORTANT: All programmatic centering uses direct shared-value assignment
 * (no withTiming) because iOS Reduce Motion causes withTiming to silently
 * fail to update the native view transform. Direct assignment always works.
 *
 * Centering functions (all instant):
 *   centreOnNode         — center of viewport
 *   centreOnNodeTop      — near top of viewport (for tree root)
 *   centreOnNodeAbovePanel — upper third (for bio panel)
 */

import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  cancelAnimation,
  ReduceMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { TREE_CONSTANTS } from '../utils/treeBuilder';

interface TreeGestureResult {
  gesture: GestureType;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  centreOnNode: (nodeX: number, nodeY: number) => void;
  centreOnNodeTop: (nodeX: number, nodeY: number) => void;
  centreOnNodeAbovePanel: (nodeX: number, nodeY: number) => void;
}

export function useTreeGestures(): TreeGestureResult {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const isMobile = SCREEN_W < 768;

  const initialScale = isMobile
    ? TREE_CONSTANTS.initialScaleMobile
    : TREE_CONSTANTS.initialScaleTablet;

  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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
      // Momentum decay — functional navigation, not decorative
      translateX.value = withDecay({ velocity: e.velocityX, deceleration: 0.997, reduceMotion: ReduceMotion.Never });
      translateY.value = withDecay({ velocity: e.velocityY, deceleration: 0.997, reduceMotion: ReduceMotion.Never });
    });

  const gesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  /** Cancel running animations and set transform directly. */
  const jumpTo = useCallback((x: number, y: number, targetScale: number) => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(scale);
    console.log(`[Gesture] jumpTo tx=${x.toFixed(0)} ty=${y.toFixed(0)} s=${targetScale.toFixed(2)} (from tx=${translateX.value.toFixed(0)} ty=${translateY.value.toFixed(0)} s=${scale.value.toFixed(2)})`);
    translateX.value = x;
    translateY.value = y;
    scale.value = Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, targetScale));
  }, []);

  // Centre on a specific node (node ends up at viewport center)
  const centreOnNode = useCallback((nodeX: number, nodeY: number) => {
    const s = isMobile ? 0.65 : 0.9;
    jumpTo(SCREEN_W / 2 - nodeX * s, SCREEN_H / 2 - nodeY * s, s);
  }, [jumpTo, SCREEN_W, SCREEN_H, isMobile]);

  // Centre on a node near the top of the viewport (for tree root / Adam)
  const centreOnNodeTop = useCallback((nodeX: number, nodeY: number) => {
    const s = isMobile ? 0.65 : 0.9;
    jumpTo(SCREEN_W / 2 - nodeX * s, SCREEN_H * 0.15 - nodeY * s, s);
  }, [jumpTo, SCREEN_W, SCREEN_H, isMobile]);

  // Centre on a node offset upward so it sits above a bottom panel
  const centreOnNodeAbovePanel = useCallback((nodeX: number, nodeY: number) => {
    const s = isMobile ? 0.65 : 0.9;
    jumpTo(SCREEN_W / 2 - nodeX * s, SCREEN_H * 0.25 - nodeY * s, s);
  }, [jumpTo, SCREEN_W, SCREEN_H, isMobile]);

  return { gesture, animatedStyle, scale, translateX, translateY, centreOnNode, centreOnNodeTop, centreOnNodeAbovePanel };
}
