#!/usr/bin/env node
const esbuild = require('esbuild');
const { limitSizePlugin } = require('esbuild-plugin-limit-size');
const pkg = require('../package.json');

const options = {
  entryPoints: ['src/index.ts'],
  bundle: false,
  write: true,
  minify: true,
  sourcemap: 'linked',
  platform: 'node'
};

esbuild.build({
  ...options,
  format: 'cjs',
  outfile: pkg.main,
  plugins: [limitSizePlugin(5, true)]
});
