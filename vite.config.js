import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` produces ONE self-contained file: dist/index.html.
// It opens directly in any browser (double-click), no server needed.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  server: { port: 5173 },
});
