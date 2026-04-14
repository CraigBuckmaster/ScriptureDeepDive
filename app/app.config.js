/**
 * app.config.js — Dynamic Expo config.
 *
 * Currently a thin passthrough over app.json. Kept as a dynamic config so
 * future environment-based tweaks (Sentry DSN, feature flags, etc.) can be
 * layered on without editing app.json.
 *
 * Note: Google Maps API keys are no longer injected — the map now uses
 * MapLibre with free OpenFreeMap tiles, no API keys required (#1315).
 */

module.exports = ({ config }) => config;
