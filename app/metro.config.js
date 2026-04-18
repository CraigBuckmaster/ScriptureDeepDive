/**
 * metro.config.js — Metro bundler configuration.
 *
 * Wraps Expo's default config with Sentry's Expo wrapper so that source maps
 * are automatically uploaded to Sentry during EAS builds. The wrapper is a
 * pass-through at bundle time; it only adds the source-map-upload step in CI.
 *
 * See: https://docs.sentry.io/platforms/react-native/manual-setup/expo/
 */
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// Allow metro to resolve .db files as bundled assets
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'db'];

module.exports = config;
