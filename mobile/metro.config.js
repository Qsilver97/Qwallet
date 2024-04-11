const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.server = {
  port: 19001, // Set your desired port here
};

module.exports = defaultConfig;
