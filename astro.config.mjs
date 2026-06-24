import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Rapier ships its WASM as a separate file and locates it via
// new URL("rapier_wasm3d_bg.wasm", import.meta.url). Rollup replaces
// import.meta.url with "<deleted>" when bundling third-party code, so the
// WASM load fails at runtime. This plugin emits the WASM file to _astro/
// and patches the broken URL so the browser can find it.
const rapierWasmFix = {
  name: 'rapier-wasm-fix',
  apply: 'build',
  enforce: 'post',
  generateBundle() {
    const wasmPath = resolve('./node_modules/@dimforge/rapier3d-compat/rapier_wasm3d_bg.wasm');
    this.emitFile({
      type: 'asset',
      fileName: '_astro/rapier_wasm3d_bg.wasm',
      source: readFileSync(wasmPath),
    });
  },
  renderChunk(code) {
    if (code.includes('"<deleted>"')) {
      return {
        code: code.replace(
          /new URL\("rapier_wasm3d_bg\.wasm","<deleted>"\)/g,
          'new URL("rapier_wasm3d_bg.wasm",import.meta.url)'
        ),
        map: null,
      };
    }
    return null;
  },
};

export default defineConfig({
  site: 'https://singhkritesh.github.io',
  base: '/portfolio',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
  ],
  output: 'static',
  devToolbar: { enabled: false },
  vite: {
    assetsInclude: ['**/*.glb'],
    plugins: [rapierWasmFix],
  },
});
