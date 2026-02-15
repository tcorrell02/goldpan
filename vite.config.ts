import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'
import {crx} from '@crxjs/vite-plugin'
import manifest from './src/manifest.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(), 
    crx({ manifest })
  ],
  base: './', //Essential for relative paths in production
  
  build: {
    // Stops the browser from looking for .map files, silencing the console noise
    sourcemap: false, 
  }
});
