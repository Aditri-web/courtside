// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname); // eslint-disable-line no-undef

// Configure Metro to work with Yarn workspaces
config.watchFolders = [
  path.resolve(__dirname, '../../packages/shared-ui'),
  path.resolve(__dirname, '../..'),
];

const appNodeModules = path.resolve(__dirname, 'node_modules');

config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: true,
  nodeModulesPaths: [
    appNodeModules,
    path.resolve(__dirname, '../../node_modules'),
  ],
  extraNodeModules: {
    '@multi-tv/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
    react: path.resolve(appNodeModules, 'react'),
    'react-dom': path.resolve(appNodeModules, 'react-dom'),
    'react-native': path.resolve(appNodeModules, 'react-native'),
    'react-native-web': path.resolve(appNodeModules, 'react-native-web'),
  },
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === 'react' || moduleName.startsWith('react/')) {
      const target = moduleName === 'react' 
        ? path.resolve(appNodeModules, 'react') 
        : path.resolve(appNodeModules, moduleName);
      return context.resolveRequest(context, target, platform);
    }
    if (moduleName === 'react-dom' || moduleName.startsWith('react-dom/')) {
      const target = moduleName === 'react-dom'
        ? path.resolve(appNodeModules, 'react-dom')
        : path.resolve(appNodeModules, moduleName);
      return context.resolveRequest(context, target, platform);
    }
    if (moduleName === 'react-native') {
      const target = platform === 'web'
        ? path.resolve(appNodeModules, 'react-native-web')
        : path.resolve(appNodeModules, 'react-native');
      return context.resolveRequest(context, target, platform);
    }
    if (moduleName === 'react-native-web') {
      return context.resolveRequest(context, path.resolve(appNodeModules, 'react-native-web'), platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

// When enabled, the optional code below will allow Metro to resolve
// and bundle source files with TV-specific extensions
// (e.g., *.ios.tv.tsx, *.android.tv.tsx, *.tv.tsx)
//
// Metro will still resolve source files with standard extensions
// as usual if TV-specific files are not found for a module.
//
if (process.env?.EXPO_TV === '1') {
  const originalSourceExts = config.resolver.sourceExts;
  const tvSourceExts = [
    ...originalSourceExts.map((e) => `tv.${e}`),
    ...originalSourceExts,
  ];
  config.resolver.sourceExts = tvSourceExts;
}

module.exports = config;
