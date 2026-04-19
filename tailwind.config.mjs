/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        background:          '#131313',
        surface:             '#1a1a1a',
        'surface-low':       '#1b1b1b',
        'surface-mid':       '#1f1f1f',
        'surface-high':      '#2a2a2a',
        'surface-highest':   '#353535',
        primary:             '#FFE7A3',
        'primary-dim':       '#E6C870',
        outline:             '#988e90',
        'outline-dim':       '#3c3c3c',
      },
      fontFamily: {
        headline: ['Space Grotesk Variable', 'Space Grotesk', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
