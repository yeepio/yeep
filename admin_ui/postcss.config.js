const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [tailwindcss('./admin_ui/theme/tailwind.js'), autoprefixer],
};
