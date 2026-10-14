import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'exclude-commercial-music-from-dist',
      closeBundle() {
        // Guarantee that commercial MP3 files are never included in production dist/
        const distMusicDir = path.resolve(__dirname, 'dist/assets/music');
        if (fs.existsSync(distMusicDir)) {
          fs.rmSync(distMusicDir, { recursive: true, force: true });
        }
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  }
});
