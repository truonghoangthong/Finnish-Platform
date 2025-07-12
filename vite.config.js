import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ← cần thêm dòng này

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ← alias @ trỏ đến thư mục src/
    },
  },
});
