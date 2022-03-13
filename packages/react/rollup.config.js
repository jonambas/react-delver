import pkg from './package.json';
import swc from 'rollup-plugin-swc';

export default {
  input: 'src/index.ts',
  plugins: [
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
  external: ['typescript', 'glob', '@delver/logger', 'fs'],
  output: [
    {
      format: 'esm',
      file: pkg.main,
      sourcemap: true
    }
  ]
};
