module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 routes its worklet transform through react-native-worklets;
    // the plugin must be last. `react-native-reanimated/plugin` is kept as an
    // alias by the library but the worklets package is the canonical location.
    plugins: ['react-native-worklets/plugin'],
  };
};
