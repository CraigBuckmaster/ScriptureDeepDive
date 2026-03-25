/**
 * hooks/useTreeGestures.ts — Pinch-to-zoom + pan for the tree.
 *
 * Two-layer transform for iOS Reduce Motion compatibility:
 *   Outer Animated.View: gesture deltas (Reanimated, UI thread — always works)
 *   Inner View: base transform (React state — always re-renders)
 *
 * Both layers use transformOrigin '0% 0%' so the centering math is simple:
 *   screen_position = base_translate + svg_position * base_scale
 *   (when gesture layer is identity)
 *
 * Programmatic centering: sets base via setState, resets gesture to identity.
 * Pan/zoom: gesture deltas accumulate, composing with frozen base.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  cancelAnimation,
  runOnJS,
  ReduceMotion,
} from 'react-native-reanimated';
import { TREE_CONSTANTS } from '../utils/treeBuilder';

interface TreeGestureResult {
  gesture: GestureType;
  baseStyle: ViewStyle;
  gestureStyle: ReturnType<typeof useAnimatedStyle>;
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

  // ── Layer 1: Base transform (React state) ──────────────────────────
  const [base, setBase] = useState({ tx: 0, ty: 0, s: initialScale });
  const baseRef = useRef(base);
  baseRef.current = base;

  const baseStyle = useMemo<ViewStyle>(() => ({
    transform: [
      { translateX: base.tx },
      { translateY: base.ty },
      { scale: base.s },
    ],
  }), [base.tx, base.ty, base.s]);

  // ── Layer 2: Gesture offsets (Reanimated shared values) ────────────
  const gestTx = useSharedValue(0);
  const gestTy = useSharedValue(0);
  const gestScale = useSharedValue(1);

  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const savedScale = useSharedValue(1);

  /**
   * Merge current gesture transform into base state, reset gesture to identity.
   * Combined transform: screen = (x * baseS + baseTx) * gestScale + gestTx
   * New base: s' = baseS * gestScale, tx' = baseTx * gestScale + gestTx
   */
  const commitGesture = useCallback(() => {
    const { tx, ty, s } = baseRef.current;
    const gTx = gestTx.value;
    const gTy = gestTy.value;
    const gS = gestScale.value;
    const newS = Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, s * gS));
    const newTx = tx * gS + gTx;
    const newTy = ty * gS + gTy;
    // Reset gesture to identity
    gestTx.value = 0;
    gestTy.value = 0;
    gestScale.value = 1;
    savedTx.value = 0;
    savedTy.value = 0;
    savedScale.value = 1;
    // Commit to base → React re-render → SVG re-rasterizes at new scale
    setBase({ tx: newTx, ty: newTy, s: newS });
  }, []);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = gestScale.value;
    })
    .onUpdate((e) => {
      gestScale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      // Commit scale to base so SVG re-rasterizes at the new zoom level
      runOnJS(commitGesture)();
    });

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

  const gestureStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: gestTx.value },
      { translateY: gestTy.value },
      { scale: gestScale.value },
    ],
  }));

  // ── Programmatic centering ─────────────────────────────────────────
  const jumpTo = useCallback((tx: number, ty: number, s: number) => {
    console.log(`[Gesture] jumpTo base tx=${tx.toFixed(0)} ty=${ty.toFixed(0)} s=${s.toFixed(2)}`);
    cancelAnimation(gestTx);
    cancelAnimation(gestTy);
    cancelAnimation(gestScale);
    gestTx.value = 0;
    gestTy.value = 0;
    gestScale.value = 1;
    setBase({
      tx,
      ty,
      s: Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, s)),
    });
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

  return { gesture, baseStyle, gestureStyle, centreOnNode, centreOnNodeTop, centreOnNodeAbovePanel };
}
