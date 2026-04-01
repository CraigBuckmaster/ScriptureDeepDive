/**
 * app.config.js — Dynamic Expo config.
 *
 * Reads the base config from app.json and injects secrets from
 * environment variables so they never appear in source control.
 *
 * Set GOOGLE_MAPS_API_KEY in your .env file or CI environment.
 */

const baseConfig = require('./app.json');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'GOOGLE_MAPS_API_KEY';

module.exports = ({ config }) => {
  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
    },
  };
};
