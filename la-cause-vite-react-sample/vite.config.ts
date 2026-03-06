import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { lacauseVitePlugin } from '@01ive-co-jp/la-cause-core/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    lacauseVitePlugin(),
  ],
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
})
