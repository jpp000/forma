const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

const reactRoot = path.dirname(
  require.resolve('react/package.json', { paths: [projectRoot] }),
);
const reactDomRoot = path.dirname(
  require.resolve('react-dom/package.json', { paths: [projectRoot] }),
);

config.resolver.extraNodeModules = {
  react: reactRoot,
  'react-dom': reactDomRoot,
};

const forcedModules = {
  react: path.join(reactRoot, 'index.js'),
  'react/jsx-runtime': path.join(reactRoot, 'jsx-runtime.js'),
  'react/jsx-dev-runtime': path.join(reactRoot, 'jsx-dev-runtime.js'),
  'react-dom': path.join(reactDomRoot, 'index.js'),
  'react-dom/client': path.join(reactDomRoot, 'client.js'),
};

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const forced = forcedModules[moduleName];
  if (forced) {
    return { type: 'sourceFile', filePath: forced };
  }

  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
