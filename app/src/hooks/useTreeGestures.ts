/**
 * hooks/useTreeGestures.ts — Pinch-to-zoom + pan for the genealogy tree.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  iOS REDUCE MOTION + REANIMATED 3.16 — THE NIGHTMARE              ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                    ║
 * ║  When iOS Settings → Accessibility → Motion → "Reduce Motion" is   ║
 * ║  enabled, Reanimated's useAnimatedStyle SILENTLY STOPS updating    ║
 * ║  the native view transform for programmatic shared-value changes.  ║
 * ║  Gesture callbacks (onUpdate/onEnd) still work because they run    ║
 * ║  through a different Reanimated pipeline on the UI thread.         ║
 * ║                                                                    ║
 * ║  The symptom: filter buttons fire, logs show correct coordinates,  ║
 * ║  shared values update (confirmed by reading .value), but the       ║
 * ║  Animated.View does not visually move. Pan/pinch gestures work     ║
 * ║  fine because they go through the gesture pipeline.                ║
 * ║                                                                    ║
 * ║  WHAT WE TRIED (AND FAILED):                                      ║
 * ║  1. Direct .value = x assignment from JS thread — values update    ║
 * ║     in JS but native view doesn't move.                            ║
 * ║  2. withTiming + ReduceMotion.Never — Reanimated docs say this     ║
 * ║     should override, but it doesn't trigger view updates either.   ║
 * ║  3. cancelAnimation() before setting — no effect.                  ║
 * ║  4. runOnUI(() => { 'worklet'; sharedVal.value = x })() — runs on  ║
 * ║     UI thread but STILL doesn't trigger useAnimatedStyle.          ║
 * ║  5. setRenderTick + useState to force React re-render, hoping      ║
 * ║     useAnimatedStyle re-evaluates — it doesn't; worklets don't     ║
 * ║     re-run on React renders.                                       ║
 * ║  6. Single Animated.View for everything — same problem, the        ║
 * ║     Reanimated style just won't update from any JS/UI call.        ║
 * ║                                                                    ║
 * ║  WHAT WORKS:                                                       ║
 * ║  Two-layer transform:                                              ║
 * ║    • Outer Animated.View — gesture deltas (Reanimated).            ║
 * ║      Updated by gesture worklets → always works.                   ║
 * ║    • Inner View — base transform (React state via useState).       ║
 * ║      Updated by setBase() → plain React re-render → always works. ║
 * ║                                                                    ║
 * ║  Programmatic centering changes the inner View (React state).      ║
 * ║  Pan/pinch changes the outer Animated.View (gesture worklets).     ║
 * ║  Neither relies on programmatic Reanimated style updates.          ║
 * ║                                                                    ║
 * ║  KNOWN TRADE-OFF:                                                  ║
 * ║  The inner View has scale in its transform. Pinch-zooming the      ║
 * ║  outer Animated.View scales a bitmap already rasterized at the     ║
 * ║  base scale → blurry SVG text while fingers are down. On pinch     ║
 * ║  end, commitGesture() merges the scale into base state, triggering ║
 * ║  React re-render → SVG re-rasterizes at the new zoom → crisp.     ║
 * ║  Brief blur during active pinch is acceptable.                     ║
 * ║                                                                    ║
 * ║  FUTURE FIX OPTIONS:                                               ║
 * ║  • Upgrade Reanimated — may fix the Reduce Motion bridge bug.      ║
 * ║  • App-level Reduce Motion override via Reanimated config:         ║
 * ║      ReducedMotionConfig.setConfig(ReduceMotion.Never)             ║
 * ║  • Move scale to outer layer only, inner layer translate-only      ║
 * ║    (attempted, centering broke — needs different coordinate math). ║
 * ║                                                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  cancelAnimation,
  runOnJS,
  ReduceMotion,
} from 'react-native-reanimated';
import { TREE_CONSTANTS } from '../utils/treeBuilder';
import { logger } from '../utils/logger';

interface TreeGestureResult {
  gesture: ReturnType<typeof Gesture.Simultaneous>;
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
  // WHY React state and not Reanimated? Because Reanimated's useAnimatedStyle
  // does not re-evaluate for programmatic shared-value changes under iOS
  // Reduce Motion. React state → View style is the ONLY reliable way to
  // programmatically move the tree viewport. See header comment for the
  // full list of things we tried.
  const [base, setBase] = useState<{ tx: number; ty: number; s: number }>({ tx: 0, ty: 0, s: initialScale });
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
  // WHY does Reanimated work here but not in Layer 1? Because gesture
  // worklets (onBegin/onUpdate/onEnd) run on the Reanimated UI thread
  // as part of the gesture-handler pipeline, which bypasses the broken
  // Reduce Motion → useAnimatedStyle bridge. Gestures always produce
  // visible transform changes. The key insight is that only PROGRAMMATIC
  // changes from JS are broken — gesture-driven changes work fine.
  //
  // These start at identity (0, 0, 1) and accumulate during active
  // gestures. On pinch end, commitGesture() merges them into base
  // state and resets back to identity.
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
  // This is the whole reason for the two-layer architecture. Filter taps,
  // search results, and deep links need to move the viewport to a specific
  // node. Under iOS Reduce Motion, Reanimated refuses to visually update
  // the Animated.View for programmatic changes. So we set the position
  // via React state (setBase) → inner View → guaranteed re-render.
  // The gesture layer is reset to identity so transforms don't stack.
  const jumpTo = useCallback((tx: number, ty: number, s: number) => {
    logger.info('Gesture', `jumpTo base tx=${tx.toFixed(0)} ty=${ty.toFixed(0)} s=${s.toFixed(2)}`);
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
