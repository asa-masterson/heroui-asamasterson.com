import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { codecovVitePlugin } from "@codecov/vite-plugin";
import sitemap from 'vite-plugin-sitemap';

const BASE_URL = 'https://asamasterson.com';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "heroui-asamasterson.com",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
    sitemap({
      hostname: BASE_URL,
      dynamicRoutes: ['/about', '/projects', '/pacman', '/pong', '/2048'],
      changefreq: 'monthly',
      priority: { '/': 1.0, '/about': 0.8, '/projects': 0.8, '/pacman': 0.6, '/pong': 0.6, '/2048': 0.6 },
      outDir: 'dist',
      generateRobotsTxt: false,
    }),
  ],
  ssgOptions: {
    dirStyle: "nested",
  },
})
