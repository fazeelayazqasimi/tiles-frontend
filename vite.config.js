import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // agar aap custom domain ya subfolder me host kar rahe ho, to base set karna
  base: '/',
  server: {
    port: 5173, // local development port
    strictPort: true,
  },
  build: {
    outDir: 'dist', // default Vite build folder
  },
});
