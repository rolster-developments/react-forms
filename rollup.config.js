import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const plugins = [
  commonjs(),
  resolve(),
  typescript({
    tsconfig: './tsconfig.app.json',
    declaration: true,
    declarationDir: 'dist',
    include: ['node_modules/@rolster/types/index.d.ts']
  })
];

const rollupTs = (file) => {
  return {
    input: [`dist/esm/${file}.js`],
    output: [
      {
        file: `dist/cjs/${file}.js`,
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true
      },
      {
        file: `dist/es/${file}.js`,
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true
      }
    ],
    external: [
      '@rolster/helpers-forms',
      '@rolster/validators',
      'react',
      'uuid'
    ],
    plugins
  };
};

export default [rollupTs('index')];
