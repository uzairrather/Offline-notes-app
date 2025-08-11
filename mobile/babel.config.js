module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // keep this last if you use Reanimated
      'react-native-reanimated/plugin',
    ],
  };
};
