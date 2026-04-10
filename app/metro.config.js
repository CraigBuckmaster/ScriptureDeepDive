const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow metro to resolve .db files as bundled assets
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'db'];

// Optional native packages that may not be installed yet.
// Resolve them to an empty shim so Metro doesn't fail at bundle time.
const optionalPeers = new Set(['@sentry/react-native']);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (optionalPeers.has(moduleName)) {
    return { type: 'empty' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
