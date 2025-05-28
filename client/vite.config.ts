import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow access from external hosts
    port: 5173, // Your preferred port
    allowedHosts: [
      'game.adrtest.com.ua',
      'localhost',
      '127.0.0.1',
      '.adrtest.com.ua', // This allows all subdomains of adrtest.com.ua
    ],
    // Alternative: Allow all hosts (less secure, only for development)
    // allowedHosts: 'all',

    // HTTPS configuration if needed for Telegram Web App
    // https: {
    //   key: './path/to/private-key.pem',
    //   cert: './path/to/certificate.pem',
    // },

    // Proxy configuration if you need to proxy API requests
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
})
