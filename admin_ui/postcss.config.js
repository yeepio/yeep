const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [tailwindcss('./admin_ui/tailwind.js'), require('autoprefixer')],
};
