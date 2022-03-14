import swc from 'rollup-plugin-swc';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/bin/cli.ts',
  plugins: [
    nodeResolve({
      extensions: ['.ts']
    }),
    swc({
      sourceMaps: 'inline',
      minify: true,
      jsc: {
        parser: {
          syntax: 'typescript'
        },
        target: 'es2018'
      }
    })
  ],
  external: [
    'fs',
    'fs-extra',
    'meow',
    'chalk',
    'find-up',
    'path',
    'glob-promise',
    '@delver/logger',
    '@delver/react',
    '@delver/css'
  ],
  output: [
    {
      format: 'esm',
      file: 'dist/bin/cli.js',
      banner: '#!/usr/bin/env node'
    }
  ]
};
