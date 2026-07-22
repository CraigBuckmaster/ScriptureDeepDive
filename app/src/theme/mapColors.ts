/**
 * mapColors.ts — Mode-invariant colors for MapLibre GL layers and map chrome.
 *
 * The map renders fixed dark-styled tiles, so overlay colors (paths, markers,
 * halos, labels) are tuned against the tile art and deliberately do NOT
 * respond to the app theme. Everything drawn on top of the map imports from
 * here instead of hardcoding hex literals (#1898).
 */

export const mapColors = {
  /** Gold story journey paths, arrowheads, and default place markers. */
  storyGold: '#bfa050',
  /** Amber person-arc line + stop circles — distinct from story gold (#1324). */
  arcAmber: '#e09050',
  /** Warm highlight for the active place marker / label. */
  markerActive: '#f5e6b8',
  /** Dark stroke/halo against the map background. */
  darkHalo: '#1a1610',
} as const;

/** Place-type accents used by PlaceDetailCard and PlaceSearchBar. */
export const placeTypeColors: Record<string, string> = {
  city: '#d4b483', // warm sand — built environment
  mountain: '#d4b483', // warm sand — terrain
  site: '#d4b483', // warm sand — archaeological site
  water: '#90c8d8', // steel blue — water body
  region: '#b8a070', // muted gold — region boundary
} as const;

/** Testament era chip colors (PlaceDetailCard key-verse chips). */
export const testamentEra = {
  OT: '#d4a05a', // amber — Old Testament era
  NT: '#5ea073', // green — New Testament era
} as const;
