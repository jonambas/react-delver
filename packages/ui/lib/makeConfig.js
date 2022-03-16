import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const delverPath = path.resolve(__dirname, '..');
const includePaths = [path.resolve(delverPath, 'src')];

function makeConfig(config, options) {
  // console.log(config.cwd);
  // console.log({ __dirname, delverPath, includePaths });

  // const pathToUIPackage = path.resolve(
  //   config.cwd,
  //   'node_modules/@delver/ui/src'
  // );

  const pathToEntry = path.resolve(delverPath, 'src/index.tsx');

  const devServerEntries = options.production
    ? []
    : [
        `webpack-dev-server/client?http://localhost:${config.ui.port}`,
        'webpack/hot/dev-server'
      ];

  const uiConfig = {
    mode: options.production ? 'production' : 'development',
    entry: {
      main: [...devServerEntries, pathToEntry]
    },
    output: {
      filename: options.production
        ? '[name].[contenthash:8].js'
        : '[name].js',
      chunkFilename: options.production
        ? '[name].[contenthash:8].chunk.js'
        : '[name].chunk.js',
      path: path.resolve(config.cwd, config.ui.output)
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      alias: {
        __DELVER_REACT__: path.resolve(
          config.cwd,
          config.react.output
        ),
        __DELVER_CSS__: path.resolve(config.cwd, config.css.output)
        // react: path.resolve(config.cwd, 'node_modules/react')
      }
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          include: includePaths,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  jsx: true
                }
              }
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: config.ui?.title || `react-delver`,
        chunksSortMode: 'none',
        chunks: ['main'],
        filename: 'index.html'
        // favicon: path.resolve(libbyPath, 'src/favicon.png')
      })
    ],
    stats: {
      assets: false,
      colors: true,
      entrypoints: false,
      hash: false,
      modules: false,
      timings: false,
      version: false
    }
  };

  return uiConfig;
}

export default makeConfig;
