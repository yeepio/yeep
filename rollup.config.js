import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';
import executable from 'rollup-plugin-executable';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import esModuleInterop from 'rollup-plugin-es-module-interop';

const serverConfig = {
  input: 'server/server.js',
  output: [
    {
      file: 'dist/server.js',
      format: 'cjs',
    },
  ],
  plugins: [
    resolve({
      only: [/^\.{0,2}\//],
    }),
    commonjs(),
    esModuleInterop(),
    babel({
      exclude: 'node_modules/**',
    }),
    progress({
      clearLine: false,
    }),
  ],
};

const cliConfig = {
  input: 'cli/cli.js',
  output: [
    {
      banner: '#!/usr/bin/env node',
      file: 'dist/yeep.js',
      format: 'cjs',
    },
  ],
  plugins: [
    replace({
      '../server/server': './server',
      delimiters: ['', ''],
    }),
    resolve({
      only: [/^\.{0,2}\//],
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
    }),
    executable(),
    progress({
      clearLine: false,
    }),
  ],
};

export default [serverConfig, cliConfig];
