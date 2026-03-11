const { composePlugins, withNx } = require('@nx/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Note: This was added by an Nx migration. Webpack builds are required to have a corresponding Webpack config file.
  // See: https://nx.dev/recipes/webpack/webpack-config-setup

  // Enable source maps for debugging in development
  if (config.mode !== 'production') {
    config.devtool = 'source-map';
  }

  return config;
});
