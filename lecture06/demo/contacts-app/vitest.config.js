import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',      // simulated DOM
    setupFiles: ['./vitest.setup.js'],
    globals: true,             // test/expect/vi available globally, no imports
  },
});
