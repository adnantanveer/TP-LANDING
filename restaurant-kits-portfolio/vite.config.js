import { defineConfig } from 'vite';

// Relative base so the built output is relocatable — this site is mounted
// at /restaurant-kits/ under the main app's domain, not served from its own root.
export default defineConfig({
  base: './',
});
