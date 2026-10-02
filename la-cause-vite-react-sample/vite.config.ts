import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { lacauseVitePlugin } from '@01ive-co-jp/la-cause-core/vite-plugin'

// Read the installed package so the header follows every library update.
const corePackage = JSON.parse(readFileSync(
  join(process.cwd(), 'node_modules/@01ive-co-jp/la-cause-core/package.json'),
  'utf8',
)) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_CORE_VERSION': JSON.stringify(corePackage.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    lacauseVitePlugin(),
  ],
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
})
