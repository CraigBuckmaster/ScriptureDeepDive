/**
 * utils/mapStyles.ts — Google Maps JSON styling.
 *
 * Two themes controlled by the Biblical/Modern toggle:
 *
 * ancientMapStyle  — Parchment-world aesthetic: warm earth tones, aged water,
 *                    zero modern labels/roads/borders. Only our custom biblical
 *                    place markers are visible.
 *
 * modernMapStyle   — Dark theme matching the app, with all standard Google Maps
 *                    labels, roads, and POIs visible.
 *
 * Reference: https://developers.google.com/maps/documentation/javascript/style-reference
 * Preview:   https://mapstyle.withgoogle.com
 */

interface StyleRule {
  featureType?: string;
  elementType?: string;
  stylers: Record<string, string | number>[];
}

// ── Ancient World ────────────────────────────────────────────────────

export const ancientMapStyle: StyleRule[] = [
  // ── Kill every label on the map ──
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },

  // ── Terrain / land — warm parchment ──
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#3d2e17' }],
  },
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry.fill',
    stylers: [{ color: '#4a3820' }],
  },
  {
    featureType: 'landscape.natural.landcover',
    elementType: 'geometry.fill',
    stylers: [{ color: '#3a2d15' }],
  },

  // ── Water — deep aged ink ──
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a2836' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#14202c' }],
  },

  // ── Hide all roads ──
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },

  // ── Hide administrative boundaries, borders ──
  {
    featureType: 'administrative',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },

  // ── Hide POIs (parks, businesses, etc.) ──
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },

  // ── Hide transit ──
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },

  // ── Man-made landscape (buildings, etc.) — blend into terrain ──
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#3a2d15' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ visibility: 'off' }],
  },
];

// ── Modern (Dark Theme) ─────────────────────────────────────────────

export const modernMapStyle: StyleRule[] = [
  // ── Base: dark background ──
  {
    elementType: 'geometry',
    stylers: [{ color: '#1a1610' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a89878' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0c0a07' }],
  },

  // ── Water — dark navy ──
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#0e1a26' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a6a80' }],
  },

  // ── Land ──
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1e1812' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#231c14' }],
  },

  // ── Roads — subtle, not overpowering ──
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2418' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3a3020' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#252015' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1e1812' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b5d48' }],
  },

  // ── Administrative — faint borders ──
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4a3e28' }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7a6a50' }],
  },

  // ── POIs — visible but muted ──
  {
    featureType: 'poi',
    elementType: 'geometry.fill',
    stylers: [{ color: '#231c14' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b5d48' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1e2a18' }],
  },

  // ── Transit — very subtle ──
  {
    featureType: 'transit',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1e1812' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5a4e38' }],
  },
];
