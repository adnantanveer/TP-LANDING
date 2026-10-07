import { defineConfig } from 'vite';

// Relative base so the built output is relocatable — this site is mounted
// at /restaurant-kits/ under the main app's domain, not served from its own root.
export default defineConfig({
  base: './',
  // Ports from the tp-landing block (8420-8429) in Developer/.claude/rules/port-registry.md
  server: { port: 8422, strictPort: true },
  preview: { port: 8423, strictPort: true },
});
