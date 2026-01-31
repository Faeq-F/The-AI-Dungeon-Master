
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // This allows process.env.API_KEY to work in the browser code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    host: true,
    port: 5173
  }
});
