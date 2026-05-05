// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://suhbalibrary.org',
  output: 'static',

  vite: {
    plugins: [
      // Tailwind v4 integrates via Vite plugin, not Astro integration
      tailwindcss(),
    ],
  },

  // Content Collections are auto-discovered in src/content/
  // Config lives in src/content/config.ts

  // Build options
  build: {
    // Inline small assets to reduce requests
    inlineStylesheets: 'auto',
  },

  // Image optimisation — no external service; static only
  image: {
    // R2 images are referenced by absolute URL; no local optimisation needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.suhbalibrary.org',
      },
      {
        protocol: 'https',
        hostname: 'r2.suhbalibrary.org',
      },
    ],
  },
});
