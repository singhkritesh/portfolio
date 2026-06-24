/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        background:          '#ffffff',
        surface:             '#f7f7f7',
        'surface-low':       '#f7f7f7',
        'surface-mid':       '#f0f0f0',
        'surface-high':      '#e8e8e8',
        'surface-highest':   '#e0e0e0',
        primary:             '#E8A444',
        'primary-dim':       '#C98830',
        outline:             '#988e90',
        'outline-dim':       '#e4e4e4',
      },
      fontFamily: {
        headline: ['Space Grotesk Variable', 'Space Grotesk', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
