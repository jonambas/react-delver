import swc from 'rollup-plugin-swc';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'bin/cli.ts',

  plugins: [
    nodeResolve({
      extensions: ['.ts']
    }),
    swc({
      sourceMaps: true,
      minify: true,
      jsc: {
        parser: {
          syntax: 'typescript'
        },
        target: 'es2018'
      }
    })
  ],
  external: ['glob', 'chalk', '@delver/logger', '@delver/react', 'find-up', 'fs-extra', 'meow'],
  output: [
    {
      format: 'cjs',
      file: 'dist/bin/cli.js',
      sourcemap: true,
      banner: '#!/usr/bin/env node'
    }
  ]
};
