const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Only watch the project's own node_modules
const nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

// Configure watchFolders to include only existing directories
config.watchFolders = Array.isArray(config.watchFolders)
  ? [...config.watchFolders, ...nodeModulesPaths]
  : [...nodeModulesPaths];

// Set resolver extraNodeModules to include only paths that exist
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  expo: path.resolve(__dirname, "node_modules/expo"),
  // Check if metro-runtime exists within expo's node_modules
  "metro-runtime": path.resolve(
    __dirname,
    "node_modules/expo/node_modules/metro-runtime"
  ),
};

// Ensure the problematic metro/node_modules is not in the blockList
config.resolver.blockList = config.resolver.blockList || [];

// Configure cacheVersion to force cache invalidation
config.cacheVersion = "1.0";

// Disable package exports to prevent resolution issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
