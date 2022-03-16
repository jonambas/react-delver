import makeConfig from './makeConfig.js';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import open from 'open';

export async function startUI(config) {
  const webpackDevServerConfig = {
    hot: true,
    port: config.ui.port,
    compress: true,
    client: {
      logging: 'error',
      overlay: true
    }
  };

  const webpackConfig = makeConfig(config, {
    production: false
  });

  const compiler = webpack(webpackConfig);
  const devServer = new WebpackDevServer(
    webpackDevServerConfig,
    compiler
  );

  devServer.start(config.ui.port, '0.0.0.0', (...args) => {
    const [err] = args;

    if (!err) {
      open(`http://localhost:${config.ui.port}`);
    }

    console.log(err);
  });
}

export async function buildUI() {
  console.log('starting');
}
