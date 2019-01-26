const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [tailwindcss('./admin_ui/theme/tailwind.js'), require('autoprefixer')],
};
