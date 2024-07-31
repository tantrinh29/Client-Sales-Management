// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Lắng nghe trên tất cả các giao diện mạng
    port: process.env.PORT || 5173, // Sử dụng cổng từ biến môi trường hoặc cổng 5173
  }
});
