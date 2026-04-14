/**
 * useTreeCamera.ts — ViewBox-based camera for the genealogy tree.
 *
 * Manages a camera that defines which portion of world-space is visible.
 * Pan and zoom gestures update the camera; the camera state derives a
 * `viewBox` string that is applied to a screen-sized <Svg> element.
 *
 * This replaces the two-layer Animated.View + React state transform
 * architecture from useTreeGestures.ts. Because viewBox is a plain React
 * prop — not a Reanimated-driven native transform — the iOS Reduce Motion
 * bug that broke programmatic centering no longer applies. Centering
 * functions just call setCamera directly.
 *
 * Coordinate model:
 *   camera.x / camera.y = world-space position of the viewport's top-left
 *   camera.zoom         = ratio of screen pixels to world pixels
 *   viewW = screenWidth / zoom    (world-space width of the viewport)
 *   viewH = screenHeight / zoom   (world-space height of the viewport)
 *   viewBox = `${camera.x} ${camera.y} ${viewW} ${viewH}`
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { BREAKPOINTS } from '../theme/breakpoints';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { TREE_CONSTANTS } from '../utils/treeBuilder';

export interface CameraState {
  /** World-space X of the viewport's left edge. */
  x: number;
  /** World-space Y of the viewport's top edge. */
  y: number;
  /** Zoom level. Higher = more zoomed in (less world per pixel). */
  zoom: number;
}

export interface TreeCameraResult {
  /** Composed pan + pinch gesture for GestureDetector. */
  gesture: ReturnType<typeof Gesture.Simultaneous>;
  /** Current camera state (world-space position + zoom). */
  camera: CameraState;
  /** viewBox string for the Svg element: "x y width height". */
  viewBox: string;
  /** World-space width of the current viewport. */
  viewW: number;
  /** World-space height of the current viewport. */
  viewH: number;
  /** Centre the viewport on a world-space point. */
  centreOnNode: (worldX: number, worldY: number) => void;
  /** Place a world-space point near the top of the viewport. */
  centreOnNodeTop: (worldX: number, worldY: number) => void;
  /** Place a world-space point in the upper quarter (above sidebar). */
  centreOnNodeAbovePanel: (worldX: number, worldY: number) => void;
}

/** Deceleration factor for pan momentum. Mirrors Reanimated's withDecay
 *  default so the feel stays familiar. Applied per-frame to velocity. */
const DECAY = 0.997;
/** Stop the decay RAF loop once velocity drops below this (px/frame). */
const DECAY_EPSILON = 0.1;

function clampZoom(z: number): number {
  return Math.min(TREE_CONSTANTS.maxZoom, Math.max(TREE_CONSTANTS.minZoom, z));
}

export function useTreeCamera(): TreeCameraResult {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const isMobile = SCREEN_W < BREAKPOINTS.tablet;

  const initialZoom = isMobile
    ? TREE_CONSTANTS.initialScaleMobile
    : TREE_CONSTANTS.initialScaleTablet;

  const [camera, setCamera] = useState<CameraState>({
    x: 0,
    y: 0,
    zoom: initialZoom,
  });

  // Ref mirror so gesture worklets (running on the UI thread via runOnJS)
  // can read the current value without stale closure issues.
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  // Pan-start camera snapshot so onUpdate can compute an absolute position
  // from the gesture's cumulative translationX/Y. Avoids drift from
  // incrementally applying per-frame deltas.
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Pinch-start snapshots. `worldFocalX/Y` is the world point under the
  // finger centroid at pinch begin; we keep it under the same screen
  // position as zoom changes by adjusting camera.x / camera.y.
  const pinchStartRef = useRef<{
    zoom: number;
    worldFocalX: number;
    worldFocalY: number;
    focalScreenX: number;
    focalScreenY: number;
  } | null>(null);

  /** Timestamp of the last camera update during active pan.
   *  Skipping intermediate frames reduces React re-renders from ~60/s to
   *  ~35/s during active gestures. One-shot updates (centering, search,
   *  era jump) are not throttled. */
  const lastPanTime = useRef(0);

  /** Same throttle for pinch gestures. */
  const lastPinchTime = useRef(0);

  // RAF handle for pan-decay loop (nullable so we can cancel on new gestures).
  const decayHandleRef = useRef<number | null>(null);
  const cancelDecay = useCallback(() => {
    if (decayHandleRef.current !== null) {
      cancelAnimationFrame(decayHandleRef.current);
      decayHandleRef.current = null;
    }
  }, []);

  useEffect(() => () => cancelDecay(), [cancelDecay]);

  // ── Pan gesture ────────────────────────────────────────────────────
  const onPanBegin = useCallback(() => {
    cancelDecay();
    // Reset throttle so the first frame of a new gesture fires immediately.
    lastPanTime.current = 0;
    panStartRef.current = { x: cameraRef.current.x, y: cameraRef.current.y };
  }, [cancelDecay]);

  const onPanUpdate = useCallback((translationX: number, translationY: number) => {
    const now = Date.now();
    if (now - lastPanTime.current < 28) return; // ~35fps during active pan
    lastPanTime.current = now;

    const start = panStartRef.current;
    if (!start) return;
    const zoom = cameraRef.current.zoom;
    // Moving a finger right by `translationX` screen pixels should shift
    // the world LEFT under it — i.e. subtract from camera.x.
    const nextX = start.x - translationX / zoom;
    const nextY = start.y - translationY / zoom;
    setCamera((prev) => ({ ...prev, x: nextX, y: nextY }));
  }, []);

  const onPanEnd = useCallback((velocityX: number, velocityY: number) => {
    // velocity is in screen px/s. Convert to world px/frame (assume 60 fps).
    const zoom = cameraRef.current.zoom;
    let vx = -velocityX / zoom / 60;
    let vy = -velocityY / zoom / 60;
    if (Math.abs(vx) < DECAY_EPSILON && Math.abs(vy) < DECAY_EPSILON) return;

    const step = () => {
      setCamera((prev) => ({ ...prev, x: prev.x + vx, y: prev.y + vy }));
      vx *= DECAY;
      vy *= DECAY;
      if (Math.abs(vx) < DECAY_EPSILON && Math.abs(vy) < DECAY_EPSILON) {
        decayHandleRef.current = null;
        return;
      }
      decayHandleRef.current = requestAnimationFrame(step);
    };
    decayHandleRef.current = requestAnimationFrame(step);
  }, []);

  // ── Pinch gesture ──────────────────────────────────────────────────
  const onPinchBegin = useCallback((focalScreenX: number, focalScreenY: number) => {
    cancelDecay();
    // Reset throttle so the first frame of a new gesture fires immediately.
    lastPinchTime.current = 0;
    const { x, y, zoom } = cameraRef.current;
    pinchStartRef.current = {
      zoom,
      worldFocalX: x + focalScreenX / zoom,
      worldFocalY: y + focalScreenY / zoom,
      focalScreenX,
      focalScreenY,
    };
  }, [cancelDecay]);

  const onPinchUpdate = useCallback((scale: number, focalScreenX: number, focalScreenY: number) => {
    const now = Date.now();
    if (now - lastPinchTime.current < 28) return; // ~35fps during active pinch
    lastPinchTime.current = now;

    const start = pinchStartRef.current;
    if (!start) return;
    const newZoom = clampZoom(start.zoom * scale);
    // Keep the world point that was under the finger at pinch-begin
    // under the *current* finger centroid (which may drift during a
    // two-finger gesture). This matches iOS Maps-style focal zoom.
    const newX = start.worldFocalX - focalScreenX / newZoom;
    const newY = start.worldFocalY - focalScreenY / newZoom;
    setCamera({ x: newX, y: newY, zoom: newZoom });
  }, []);

  const panGesture = useMemo(
    () => Gesture.Pan()
      .minDistance(5)
      .onBegin(() => {
        runOnJS(onPanBegin)();
      })
      .onUpdate((e) => {
        runOnJS(onPanUpdate)(e.translationX, e.translationY);
      })
      .onEnd((e) => {
        runOnJS(onPanEnd)(e.velocityX, e.velocityY);
      }),
    [onPanBegin, onPanUpdate, onPanEnd],
  );

  const pinchGesture = useMemo(
    () => Gesture.Pinch()
      .onBegin((e) => {
        runOnJS(onPinchBegin)(e.focalX, e.focalY);
      })
      .onUpdate((e) => {
        runOnJS(onPinchUpdate)(e.scale, e.focalX, e.focalY);
      }),
    [onPinchBegin, onPinchUpdate],
  );

  const gesture = useMemo(
    () => Gesture.Simultaneous(pinchGesture, panGesture),
    [pinchGesture, panGesture],
  );

  // ── Derived viewBox ────────────────────────────────────────────────
  const safeZoom = camera.zoom > 0 ? camera.zoom : 1;
  const viewW = SCREEN_W / safeZoom;
  const viewH = SCREEN_H / safeZoom;
  const viewBox = `${camera.x} ${camera.y} ${viewW} ${viewH}`;

  // ── Centering functions ────────────────────────────────────────────
  const centreOnNode = useCallback((worldX: number, worldY: number) => {
    cancelDecay();
    setCamera((prev) => {
      const z = prev.zoom > 0 ? prev.zoom : 1;
      const vW = SCREEN_W / z;
      const vH = SCREEN_H / z;
      return { ...prev, x: worldX - vW / 2, y: worldY - vH / 2 };
    });
  }, [SCREEN_W, SCREEN_H, cancelDecay]);

  const centreOnNodeTop = useCallback((worldX: number, worldY: number) => {
    cancelDecay();
    setCamera((prev) => {
      const z = prev.zoom > 0 ? prev.zoom : 1;
      const vW = SCREEN_W / z;
      const vH = SCREEN_H / z;
      return { ...prev, x: worldX - vW / 2, y: worldY - vH * 0.15 };
    });
  }, [SCREEN_W, SCREEN_H, cancelDecay]);

  const centreOnNodeAbovePanel = useCallback((worldX: number, worldY: number) => {
    cancelDecay();
    setCamera((prev) => {
      const z = prev.zoom > 0 ? prev.zoom : 1;
      const vW = SCREEN_W / z;
      const vH = SCREEN_H / z;
      return { ...prev, x: worldX - vW / 2, y: worldY - vH * 0.25 };
    });
  }, [SCREEN_W, SCREEN_H, cancelDecay]);

  return {
    gesture,
    camera,
    viewBox,
    viewW,
    viewH,
    centreOnNode,
    centreOnNodeTop,
    centreOnNodeAbovePanel,
  };
}
