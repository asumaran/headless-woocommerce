// From https://github.com/Automattic/color-studio/blob/c84671390ebc7fb5ef616ba349b8ccadc533c745/dist/colors.json#L149-L161
const woocommercePurple = {
  DEFAULT: '#7f54b3',
  0: '#f7edf7',
  50: '#e5cfe8',
  100: '#d6b4e0',
  200: '#c792e0',
  300: '#af7dd1',
  400: '#9a69c7',
  500: '#7f54b3',
  600: '#674399',
  700: '#533582',
  800: '#3c2861',
  900: '#271b3d',
  1000: '#140e1f',
};

module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class',
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
  ],
  theme: { extend: { colors: { purple: woocommercePurple } } },
};
