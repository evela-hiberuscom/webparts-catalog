/**
 * SPFx webpack customization – strip webpack-dev-server HMR client from the
 * bundle so the web part loads correctly in SharePoint Online debug mode.
 *
 * Problem: webpack-dev-server injects its HMR WebSocket client as an entry
 * point via compiler.hooks.make AFTER our configure hook runs. Setting
 * devServer.hot = false in the config object is too early — the server ignores
 * it. The HMR client ends up in the bundle and crashes SharePoint's AMD loader
 * with "[HMR] Hot Module Replacement is disabled".
 *
 * Fix: NormalModuleReplacementPlugin intercepts module resolution at compile
 * time and replaces the webpack-dev-server client with an empty stub BEFORE
 * the module graph is built — regardless of when the entry was injected.
 *
 * @param {import('webpack').Configuration & { devServer?: import('webpack-dev-server').Configuration }} webpackConfig
 * @param {unknown} _taskSession
 * @param {unknown} _heftConfiguration
 * @param {typeof import('webpack')} webpack
 */
const path = require('path');

module.exports = function customizeWebpack(webpackConfig, _taskSession, _heftConfiguration, webpack) {
  // Handle both a single config object and a multi-compiler array
  const configs = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];

  for (const cfg of configs) {
    // Belt-and-braces: disable hot/liveReload in devServer options
    if (cfg.devServer) {
      cfg.devServer.hot = false;
      cfg.devServer.liveReload = false;
    }

    // webpack-dev-server v5 injects its client entry via EntryPlugin.apply(compiler)
    // AFTER the onConfigure hook runs, so we can't remove it from config.entry
    // directly. NormalModuleReplacementPlugin intercepts at resolution time and
    // replaces the webpack-dev-server client with an empty stub regardless of
    // when the entry was injected.
    if (webpack && webpack.NormalModuleReplacementPlugin) {
      if (!cfg.plugins) {
        cfg.plugins = [];
      }
      const noopModule = path.resolve(__dirname, 'noop.js');
      cfg.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/webpack-dev-server[\/\\]client/, noopModule),
        new webpack.NormalModuleReplacementPlugin(/webpack[\/\\]hot[\/\\](dev-server|only-dev-server|emitter|log|log-apply-result|signal)/, noopModule)
      );
    }
  }
};
