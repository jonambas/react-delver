#!/usr/bin/env node
const esbuild = require('esbuild');
const pkg = require('../package.json');

const options = {
  entryPoints: ['src/index.ts'],
  bundle: false,
  write: true,
  minify: true,
  sourcemap: 'linked',
  platform: 'node'
};

esbuild.buildSync({
  ...options,
  format: 'cjs',
  outfile: pkg.main
});
