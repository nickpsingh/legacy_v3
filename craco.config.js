const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Add src directory to module resolution paths
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'src'),
        'node_modules'
      ];

      if (env === 'development') {
        // Configure React Refresh
        webpackConfig.plugins.push(
          new ReactRefreshWebpackPlugin({
            overlay: false,
          })
        );
      }

      // Ensure react-refresh is properly handled
      const babelLoader = webpackConfig.module.rules.find(
        (rule) => rule.loader && rule.loader.includes('babel-loader')
      );

      if (babelLoader) {
        babelLoader.options.plugins = [
          ...(babelLoader.options.plugins || []),
          env === 'development' && require.resolve('react-refresh/babel'),
        ].filter(Boolean);
      }

      return webpackConfig;
    },
  },
}; 