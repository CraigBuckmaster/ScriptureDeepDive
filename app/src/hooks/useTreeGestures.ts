/**
 * hooks/useTreeGestures.ts — Pinch-to-zoom + pan for the tree.
 *
 * Two-layer transform to handle iOS Reduce Motion:
 *   Inner View: translateX/Y only (React state — always re-renders)
 *   Outer Animated.View: translateX/Y deltas + scale (Reanimated, UI thread)
 *
 * Scale lives ONLY on the Animated.View layer — no nested scaling, no blur.
 * Programmatic centering reads the current scale.value and computes
 * translate to position the target node correctly at whatever zoom level
 * the user is at. Centering never changes scale.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  cancelAnimation,
  ReduceMotion,
} from 'react-native-reanimated';
import { TREE_CONSTANTS } from '../utils/treeBuilder';

/** Scale used for centering calculations and initial zoom. */
const TARGET_SCALE_MOBILE = 0.65;
const TARGET_SCALE_TABLET = 0.9;

interface TreeGestureResult {
  gesture: GestureType;
  /** Inner View style — translate only, React state */
  baseStyle: ViewStyle;
  /** Outer Animated.View style — translate deltas + scale, Reanimated */
  gestureStyle: ReturnType<typeof useAnimatedStyle>;
  centreOnNode: (nodeX: number, nodeY: number) => void;
  centreOnNodeTop: (nodeX: number, nodeY: number) => void;
  centreOnNodeAbovePanel: (nodeX: number, nodeY: number) => void;
}

export function useTreeGestures(): TreeGestureResult {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const isMobile = SCREEN_W < 768;
  const targetScale = isMobile ? TARGET_SCALE_MOBILE : TARGET_SCALE_TABLET;

  // ── Layer 1: Base translate (React state) ──────────────────────────
  const [baseTx, setBaseTx] = useState(0);
  const [baseTy, setBaseTy] = useState(0);

  const baseStyle = useMemo<ViewStyle>(() => ({
    transform: [
      { translateX: baseTx },
      { translateY: baseTy },
    ],
  }), [baseTx, baseTy]);

  // ── Layer 2: Gesture transform (Reanimated shared values) ──────────
  // Scale starts at TARGET_SCALE so the first centering doesn't need to change it.
  const gestTx = useSharedValue(0);
  const gestTy = useSharedValue(0);
  const scale = useSharedValue(targetScale);

  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const savedScale = useSharedValue(targetScale);

  // Track base for reading in gesture worklets via ref
  const baseTxRef = useRef(0);
  const baseTyRef = useRef(0);

  // Pinch
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, newScale));
    });

  // Pan — screen-space pixels, works directly with the Animated.View
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onBegin(() => {
      cancelAnimation(gestTx);
      cancelAnimation(gestTy);
      savedTx.value = gestTx.value;
      savedTy.value = gestTy.value;
    })
    .onUpdate((e) => {
      gestTx.value = savedTx.value + e.translationX;
      gestTy.value = savedTy.value + e.translationY;
    })
    .onEnd((e) => {
      gestTx.value = withDecay({
        velocity: e.velocityX,
        deceleration: 0.997,
        reduceMotion: ReduceMotion.Never,
      });
      gestTy.value = withDecay({
        velocity: e.velocityY,
        deceleration: 0.997,
        reduceMotion: ReduceMotion.Never,
      });
    });

  const gesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Outer Animated.View: translate deltas + scale
  const gestureStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: gestTx.value },
      { translateY: gestTy.value },
      { scale: scale.value },
    ],
  }));

  // ── Programmatic centering ─────────────────────────────────────────
  // Centering formula with nested transforms:
  //   Outer: translate(gestTx, gestTy) → scale(s)
  //   Inner: translate(baseTx, baseTy)
  //   Point (nodeX, nodeY) appears on screen at:
  //     screenX = gestTx + (baseTx + nodeX) * s
  //     screenY = gestTy + (baseTy + nodeY) * s
  //
  // When centering, reset gestTx/gestTy to 0:
  //     targetScreenX = (baseTx + nodeX) * s
  //     baseTx = targetScreenX / s - nodeX

  const jumpTo = useCallback((nodeX: number, nodeY: number, screenX: number, screenY: number) => {
    const s = scale.value;
    const newBaseTx = screenX / s - nodeX;
    const newBaseTy = screenY / s - nodeY;
    console.log(`[Gesture] jumpTo node=(${nodeX.toFixed(0)},${nodeY.toFixed(0)}) target=(${screenX.toFixed(0)},${screenY.toFixed(0)}) scale=${s.toFixed(2)} → base=(${newBaseTx.toFixed(0)},${newBaseTy.toFixed(0)})`);

    // Cancel running gesture animations
    cancelAnimation(gestTx);
    cancelAnimation(gestTy);
    // Reset gesture translate to identity
    gestTx.value = 0;
    gestTy.value = 0;
    savedTx.value = 0;
    savedTy.value = 0;

    // Set base translate via React state (guaranteed re-render)
    baseTxRef.current = newBaseTx;
    baseTyRef.current = newBaseTy;
    setBaseTx(newBaseTx);
    setBaseTy(newBaseTy);
  }, []);

  const centreOnNode = useCallback((nodeX: number, nodeY: number) => {
    jumpTo(nodeX, nodeY, SCREEN_W / 2, SCREEN_H / 2);
  }, [jumpTo, SCREEN_W, SCREEN_H]);

  const centreOnNodeTop = useCallback((nodeX: number, nodeY: number) => {
    jumpTo(nodeX, nodeY, SCREEN_W / 2, SCREEN_H * 0.15);
  }, [jumpTo, SCREEN_W, SCREEN_H]);

  const centreOnNodeAbovePanel = useCallback((nodeX: number, nodeY: number) => {
    jumpTo(nodeX, nodeY, SCREEN_W / 2, SCREEN_H * 0.25);
  }, [jumpTo, SCREEN_W, SCREEN_H]);

  return { gesture, baseStyle, gestureStyle, centreOnNode, centreOnNodeTop, centreOnNodeAbovePanel };
}
