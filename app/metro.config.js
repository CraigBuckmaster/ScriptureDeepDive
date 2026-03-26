const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow metro to resolve .db files as bundled assets
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'db'];

module.exports = config;
