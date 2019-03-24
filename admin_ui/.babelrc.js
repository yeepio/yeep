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
          browsers: ['since 2015', 'IE 11'],
        },
        debug: false,
      },
    ],
  ],
  plugins: [
    'styled-jsx/babel',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};
