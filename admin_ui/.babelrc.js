module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        development: process.env.BABEL_ENV === 'development',
      },
    ],
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 2 versions', 'ie >= 11'],
        },
        debug: false,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};
