const { AndroidConfig, withAndroidColors, withAndroidStyles } = require('@expo/config-plugins');

const ACCENT_COLOR = '#6841f2';

function withAndroidAccentColor(config) {
  config = withAndroidColors(config, (config) => {
    config.modResults = AndroidConfig.Colors.assignColorValue(config.modResults, {
      name: 'colorAccent',
      value: ACCENT_COLOR,
    });
    return config;
  });

  config = withAndroidStyles(config, (config) => {
    config.modResults = AndroidConfig.Styles.assignStylesValue(config.modResults, {
      add: true,
      value: '@color/colorAccent',
      name: 'colorAccent',
      parent: AndroidConfig.Styles.getAppThemeGroup(),
    });
    return config;
  });

  return config;
}

module.exports = withAndroidAccentColor;
