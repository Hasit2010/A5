/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],  // adjust path if needed
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "fantasy"],
  },
}

