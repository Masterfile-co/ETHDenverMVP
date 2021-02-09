const tailwindcss = require("tailwindcss");

module.exports = {
  style: {
    postcss: {
      plugins: [tailwindcss("./tailwind.js"), require("autoprefixer")],
    },
  },
};
