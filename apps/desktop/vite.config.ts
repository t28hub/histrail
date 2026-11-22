import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Tauri's devUrl uses a fixed port; keep output so Rust errors stay visible.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
});
