import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react'
import {crx} from '@crxjs/vite-plugin'
import manifest from './src/manifest.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // tailwindcss(),
    // react(), 
    crx({ manifest })
  ], 
  build: {
    // Silences the console noise by stopping .map file generation
    sourcemap: false, 
  }
});
