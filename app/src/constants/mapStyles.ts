/**
 * constants/mapStyles.ts — R2-hosted MapLibre style URLs.
 *
 * Kept in its own module (no MapLibre imports) so components that need
 * the URLs — including the MapChip dispatcher that must load before
 * the native module check — can import them without pulling MapLibre's
 * MapView module into scope. That module calls `requireNativeComponent`
 * at load time, which throws in Expo Go.
 *
 * Style JSON is authored in `content/map-styles/` and published by
 * `_tools/upload_to_r2.py` on every content-pipeline run (#1316).
 */

export const STYLE_ANCIENT =
  'https://contentcompanionstudy.com/map-styles/ancient.json';

export const STYLE_MODERN =
  'https://contentcompanionstudy.com/map-styles/modern.json';
