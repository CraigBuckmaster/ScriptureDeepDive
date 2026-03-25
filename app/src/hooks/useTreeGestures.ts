/**
 * hooks/useTreeGestures.ts — Pinch-to-zoom + pan for the tree.
 *
 * Hybrid transform for iOS Reduce Motion compatibility + crisp SVG:
 *
 *   Outer Animated.View: ALL transforms as shared values (translate + scale).
 *     Gesture worklets update these directly on the UI thread → always works.
 *
 *   Programmatic centering: sets shared values from JS, then bumps a React
 *     state counter to force re-render → useAnimatedStyle re-evaluates →
 *     picks up the new shared values → native view updates.
 *
 * Single scale layer means SVG is always rasterized at the actual display
 * scale — no blurry nested scaling.
 */

import { useState, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  cancelAnimation,
  ReduceMotion,
} from 'react-native-reanimated';
import { TREE_CONSTANTS } from '../utils/treeBuilder';

interface TreeGestureResult {
  gesture: GestureType;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
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

  // All transform state lives in shared values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(initialScale);

  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const savedScale = useSharedValue(initialScale);

  // Bump this to force React re-render → useAnimatedStyle re-evaluation
  const [, setRenderTick] = useState(0);

  // ── Gestures (UI thread — always work) ─────────────────────────────

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, newScale));
    });

  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onBegin(() => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      savedTx.value = translateX.value;
      savedTy.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedTx.value + e.translationX;
      translateY.value = savedTy.value + e.translationY;
    })
    .onEnd((e) => {
      translateX.value = withDecay({
        velocity: e.velocityX,
        deceleration: 0.997,
        reduceMotion: ReduceMotion.Never,
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        deceleration: 0.997,
        reduceMotion: ReduceMotion.Never,
      });
    });

  const gesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Single animated style — no nesting, no double-rasterization
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ── Programmatic centering ─────────────────────────────────────────
  // Sets shared values from JS (updates the JS-side cache), then bumps
  // a state counter to force a React re-render. During re-render,
  // useAnimatedStyle re-evaluates and reads the current shared values.
  // This bypasses the Reduce Motion issue where reactive shared-value
  // changes don't trigger style re-evaluation.
  const jumpTo = useCallback((tx: number, ty: number, s: number) => {
    console.log(`[Gesture] jumpTo tx=${tx.toFixed(0)} ty=${ty.toFixed(0)} s=${s.toFixed(2)}`);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(scale);
    translateX.value = tx;
    translateY.value = ty;
    scale.value = Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, s));
    // Force React re-render → useAnimatedStyle picks up new values
    setRenderTick((t) => t + 1);
  }, []);

  const centreOnNode = useCallback((nodeX: number, nodeY: number) => {
    const s = isMobile ? 0.65 : 0.9;
    jumpTo(SCREEN_W / 2 - nodeX * s, SCREEN_H / 2 - nodeY * s, s);
  }, [jumpTo, SCREEN_W, SCREEN_H, isMobile]);

  const centreOnNodeTop = useCallback((nodeX: number, nodeY: number) => {
    const s = isMobile ? 0.65 : 0.9;
    jumpTo(SCREEN_W / 2 - nodeX * s, SCREEN_H * 0.15 - nodeY * s, s);
  }, [jumpTo, SCREEN_W, SCREEN_H, isMobile]);

  const centreOnNodeAbovePanel = useCallback((nodeX: number, nodeY: number) => {
    const s = isMobile ? 0.65 : 0.9;
    jumpTo(SCREEN_W / 2 - nodeX * s, SCREEN_H * 0.25 - nodeY * s, s);
  }, [jumpTo, SCREEN_W, SCREEN_H, isMobile]);

  return { gesture, animatedStyle, centreOnNode, centreOnNodeTop, centreOnNodeAbovePanel };
}
