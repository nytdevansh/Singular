import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',           // Change if your entry file is different
  output: {
    file: 'dist/index.esm.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [typescript({
    tsconfig: './tsconfig.json'
  })],
  external: [], // Add external dependencies here
};