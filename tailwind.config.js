/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs'],  // all .ejs files
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "fantasy"],
  },
}

