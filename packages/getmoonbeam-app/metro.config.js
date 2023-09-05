// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('jsx');
config.resolver.assetExts.push('js');
config.resolver.assetExts.push('ts');
config.resolver.assetExts.push('tsx');
config.resolver.assetExts.push('cjs');
config.resolver.assetExts.push('json');

module.exports = config;
