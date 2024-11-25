module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Remove expo-router/babel as it's included in preset
      "react-native-reanimated/plugin",
    ],
  };
};
