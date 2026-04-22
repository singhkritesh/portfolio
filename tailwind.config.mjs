/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        background:          '#000000',
        surface:             '#141414',
        'surface-low':       '#141414',
        'surface-mid':       '#191919',
        'surface-high':      '#242424',
        'surface-highest':   '#2e2e2e',
        primary:             '#E8A444',
        'primary-dim':       '#C98830',
        outline:             '#988e90',
        'outline-dim':       '#2a2a2a',
      },
      fontFamily: {
        headline: ['Space Grotesk Variable', 'Space Grotesk', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
