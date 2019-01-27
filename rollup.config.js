import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';
import executable from 'rollup-plugin-executable';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import esModuleInterop from 'rollup-plugin-es-module-interop';
import copy from 'rollup-plugin-copy';
import json from 'rollup-plugin-json';
import glob from 'glob';

export default [
  /* server.js configuration */
  {
    input: 'server/server.js',
    output: [
      {
        file: 'dist/server.js',
        format: 'cjs',
      },
    ],
    plugins: [
      // copy({
      //   admin_ui: 'dist/admin_ui',
      //   verbose: true,
      // }),
      replace({
        '../admin_ui': './admin_ui',
        delimiters: ['', ''],
      }),
      resolve({
        only: [/^\.{0,2}\//],
      }),
      commonjs(),
      esModuleInterop(),
      json(),
      babel({
        exclude: 'node_modules/**',
      }),
      progress({
        clearLine: false,
      }),
    ],
  },
  /* yeep CLI configuration */
  {
    input: 'cli/cli.js',
    output: [
      {
        banner: '#!/usr/bin/env node',
        file: 'dist/yeep.js',
        format: 'cjs',
      },
    ],
    plugins: [
      copy({
        'server/views': 'dist/views',
        verbose: true,
      }),
      replace({
        '../server/server': './server',
        '../migrations': './migrations',
        delimiters: ['', ''],
      }),
      resolve({
        only: [/^\.{0,2}\//],
      }),
      commonjs(),
      json(),
      babel({
        exclude: 'node_modules/**',
      }),
      executable(),
      progress({
        clearLine: false,
      }),
    ],
  },
  /* migrations build */
  ...glob.sync('migrations/*.js').map((file) => ({
    input: file,
    output: [
      {
        file: file.replace('migrations', 'dist/migrations'),
        format: 'cjs',
      },
    ],
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**',
      }),
      replace({
        '../server/views': '../views',
        delimiters: ['', ''],
      }),
    ],
  })),
];
