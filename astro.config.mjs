import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://singhkritesh.github.io',
  base: '/portfolio',
  integrations: [
    tailwind({ applyBaseStyles: false }),
  ],
  output: 'static',
  devToolbar: { enabled: false },
});
