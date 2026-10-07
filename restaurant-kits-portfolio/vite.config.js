import { defineConfig } from 'vite';

// Relative base so the built output is relocatable — this site is mounted
// at /restaurant-kits/ under the main app's domain, not served from its own root.
export default defineConfig({
  base: './',
  // Never inline assets as data: URIs. The small partner logos fall under Vite's
  // 4KB default and would be base64'd into index.html (several times each, as the
  // marquee repeats them), bloating the render-critical document; as files they
  // are lazy-loaded and cached instead.
  build: { assetsInlineLimit: 0 },
  // Ports from the tp-landing block (8420-8429) in Developer/.claude/rules/port-registry.md
  server: { port: 8422, strictPort: true },
  preview: { port: 8423, strictPort: true },
});
