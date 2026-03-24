const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow metro to resolve .db files as bundled assets
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'db'];

module.exports = withNativeWind(config, { input: './global.css' });
