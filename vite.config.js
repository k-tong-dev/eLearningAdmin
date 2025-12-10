import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 1337,
    allowedHosts: [
      'vps-9a813bd4.vps.ovh.net',
      'localhost',
      '127.0.0.1',
    ],
  },
});
