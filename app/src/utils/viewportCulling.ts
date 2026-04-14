/**
 * viewportCulling.ts — Viewport intersection tests for tree elements.
 *
 * Pure geometry — no React, no hooks. Given a camera (x, y, zoom) and a
 * screen size, derive a world-space bounding box and test nodes / links
 * against it. Callers use the results to decide which SVG elements to
 * mount this frame.
 *
 * The margin parameter inflates the viewport so elements near its edge
 * don't pop in and out during fast pans. 200 px world-space is generous
 * but filtering is cheap (a single array scan with a constant-time test
 * per element).
 */

export interface ViewportBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Derive the world-space viewport bounds from camera state.
 *
 * The viewport is the rectangle of world-space that maps to the visible
 * screen. `viewW = screenWidth / zoom` and `viewH = screenHeight / zoom`
 * because a higher zoom shows less world per pixel. The margin inflates
 * the rectangle on every side.
 */
export function getViewportBounds(
  cameraX: number,
  cameraY: number,
  screenWidth: number,
  screenHeight: number,
  zoom: number,
  margin: number,
): ViewportBounds {
  const safeZoom = zoom > 0 ? zoom : 1;
  const viewW = screenWidth / safeZoom;
  const viewH = screenHeight / safeZoom;
  return {
    left: cameraX - margin,
    right: cameraX + viewW + margin,
    top: cameraY - margin,
    bottom: cameraY + viewH + margin,
  };
}

/** Whether a world-space point falls within viewport bounds. */
export function isPointInViewport(
  x: number,
  y: number,
  bounds: ViewportBounds,
): boolean {
  return x >= bounds.left && x <= bounds.right
    && y >= bounds.top && y <= bounds.bottom;
}

/**
 * Whether a line segment (e.g. a genealogical link) intersects the viewport.
 *
 * This uses endpoint containment as an approximation — if either endpoint
 * is inside the (margin-inflated) viewport, the link renders. For typical
 * tree layouts the links span short distances relative to the viewport,
 * so the false-negative rate (link crosses viewport but both endpoints
 * are outside) is negligible and the check is fast.
 */
export function isLinkInViewport(
  source: { x: number; y: number },
  target: { x: number; y: number },
  bounds: ViewportBounds,
): boolean {
  return isPointInViewport(source.x, source.y, bounds)
    || isPointInViewport(target.x, target.y, bounds);
}
