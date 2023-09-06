// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
    const config = await getDefaultConfig(__dirname);
    const { transformer, resolver } = config;

    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts,
        sourceExts: [
            ...resolver.sourceExts,
            "jsx",
            "js",
            "ts",
            "tsx",
            "cjs",
            "json",
            "png"],
    };
    return config;
})();
