import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import fs from 'fs'
// @ts-ignore
import path from 'path'

// @ts-ignore
const premiumFolder = path.resolve(__dirname, 'src/features/Premium');
// @ts-ignore
const isPremiumAvailable = fs.existsSync(premiumFolder);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ignore-missing-premium',
      resolveId(id: string) {
        if (id && id.indexOf('/Premium/') > -1 && !isPremiumAvailable) {
          return '\0virtual-premium-fallback';
        }
      },
      load(id: string) {
        if (id === '\0virtual-premium-fallback') {
          // By throwing here, the dynamic import's .catch() block in React.lazy will perfectly execute.
          return `throw new Error("Premium feature absent in Community build");`;
        }
      }
    }
  ],
})
